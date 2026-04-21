<?php
require_once __DIR__ . '/CashRegisterSessionModel.php';
require_once __DIR__ . '/CashRegisterMovementModel.php';
require_once __DIR__ . '/../payments/PaymentModel.php';

class CashRegisterController {
    private $sessionModel;
    private $movementModel;
    private $paymentModel;

    public function __construct() {
        $this->sessionModel = new CashRegisterSessionModel();
        $this->movementModel = new CashRegisterMovementModel();
        $this->paymentModel = new PaymentModel();
    }

    public function openSession() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;
            $existing = $this->sessionModel->findOpenByUser($userId);
            if ($existing) { http_response_code(409); echo json_encode(['error'=>'Ya existe una sesión de caja abierta']); return; }
            $usd = isset($_POST['start_balance_usd']) ? (float)$_POST['start_balance_usd'] : 0;
            $bs = isset($_POST['start_balance_bs']) ? (float)$_POST['start_balance_bs'] : 0;
            $sid = $this->sessionModel->open($userId, $usd, $bs);
            // initial movements for seed
            if ($usd > 0) {
                $this->movementModel->create([
                    'session_id'=>$sid,
                    'payment_id'=>null,
                    'movement_type'=>'initial_balance',
                    'amount'=>$usd,
                    'currency'=>'USD',
                    'description'=>'Fondo inicial USD',
                    'created_by'=>$userId
                ]);
            }
            if ($bs > 0) {
                $this->movementModel->create([
                    'session_id'=>$sid,
                    'payment_id'=>null,
                    'movement_type'=>'initial_balance',
                    'amount'=>$bs,
                    'currency'=>'BS',
                    'description'=>'Fondo inicial BS',
                    'created_by'=>$userId
                ]);
            }
            http_response_code(201);
            echo json_encode(['session_id'=>(int)$sid]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function status() {
        $payload = $_REQUEST['jwt_payload'] ?? null;
        if (!$payload) { http_response_code(401); echo json_encode(['error'=>'No autorizado']); return; }
        $open = $this->sessionModel->findOpenByUser($payload->sub);
        if (!$open) { echo json_encode(['status'=>'no_open_session']); return; }
        echo json_encode(['status'=>'open','session'=>$open]);
    }

    private function getDigitalPayments($userId, $startTime) {
        $sql = "SELECT id, account_id, payment_method, amount, currency, reference_number, payment_date, registered_by 
                FROM payments 
                WHERE registered_by = :uid 
                AND payment_method IN ('transfer_bs', 'mobile_payment_bs') 
                AND payment_date >= :start 
                AND status != 'rejected'
                AND deleted_at IS NULL";
        
        return $this->paymentModel->db()->query($sql, [
            ':uid' => $userId,
            ':start' => $startTime
        ]);
    }

    public function listMyMovements() {
        $payload = $_REQUEST['jwt_payload'] ?? null;
        if (!$payload) { http_response_code(401); echo json_encode(['error'=>'No autorizado']); return; }
        $open = $this->sessionModel->findOpenByUser($payload->sub);
        if (!$open) { echo json_encode([]); return; }

        $movements = $this->movementModel->listBySession($open['id']);
        // Tag standard movements as 'cash'
        foreach ($movements as &$m) {
            $m['method'] = 'cash';
        }

        // Merge digital payments (transfers/mobile) from the current session timeframe
        try {
            $digitals = $this->getDigitalPayments($payload->sub, $open['start_time']);

            foreach ($digitals as $p) {
                $lbl = ($p['payment_method'] === 'transfer_bs') ? 'Transferencia' : 'Pago Móvil';
                if (!empty($p['reference_number'])) $lbl .= ' Ref: ' . $p['reference_number'];
                if (!empty($p['account_id'])) $lbl .= ' | Cuenta #' . (int)$p['account_id'];

                $movements[] = [
                    'id' => 'dig_' . $p['id'], // Virtual ID
                    'session_id' => $open['id'],
                    'payment_id' => $p['id'],
                    'account_id' => $p['account_id'] ?? null,
                    'movement_type' => 'payment_in',
                    'amount' => $p['amount'],
                    'currency' => $p['currency'],
                    'description' => $lbl,
                    'created_at' => $p['payment_date'],
                    'created_by' => $p['registered_by'],
                    'is_virtual' => true,
                    'method' => $p['payment_method'] // 'transfer_bs' or 'mobile_payment_bs'
                ];
            }

            // Sort by date desc
            usort($movements, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

        } catch (Exception $e) {
            // Log error
        }

        echo json_encode($movements);
    }

    public function closeSession() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            
            $userId = $payload->sub;
            $open = $this->sessionModel->findOpenByUser($userId);
            
            if (!$open) { 
                http_response_code(404); 
                echo json_encode(['error' => 'No hay sesión abierta']); 
                return; 
            }
            
            // Cálculo del Sistema (Esperado)
            $calcUsd = (float)$open['start_balance_usd'];
            $calcBs = (float)$open['start_balance_bs'];
            
            // Consultar movimientos de la sesión
            $movements = $this->movementModel->listBySession($open['id']);
            
            foreach ($movements as $mov) {
                $type = $mov['movement_type'] ?? '';
                $currency = $mov['currency'] ?? '';
                $amount = (float)$mov['amount'];
                
                if (in_array($type, ['payment_in', 'adjustment_in'])) {
                    if ($currency === 'USD') $calcUsd += $amount;
                    else if ($currency === 'BS') $calcBs += $amount;
                } else if (in_array($type, ['expense_out', 'adjustment_out', 'reversal'])) {
                    if ($currency === 'USD') $calcUsd -= $amount;
                    else if ($currency === 'BS') $calcBs -= $amount;
                }
            }

            // Captura de lo Declarado
            $input = json_decode(file_get_contents('php://input'), true);
            $realUsd = isset($_POST['declared_usd']) ? (float)$_POST['declared_usd'] : (isset($input['declared_usd']) ? (float)$input['declared_usd'] : 0);
            $realBs = isset($_POST['declared_bs']) ? (float)$_POST['declared_bs'] : (isset($input['declared_bs']) ? (float)$input['declared_bs'] : 0);
            $notes = isset($_POST['notes']) ? $_POST['notes'] : (isset($input['notes']) ? $input['notes'] : null);
            
            // Cierre y actualización en el modelo
            $this->sessionModel->close($open['id'], $calcUsd, $realUsd, $calcBs, $realBs, $notes);
            
            echo json_encode([
                'message' => 'Caja cerrada y conciliada exitosamente.',
                'calculated_usd' => $calcUsd,
                'calculated_bs' => $calcBs,
                'declared_usd' => $realUsd,
                'declared_bs' => $realBs
            ]);
            
        } catch (Exception $e) { 
            http_response_code(400); 
            echo json_encode(['error' => $e->getMessage()]); 
        }
    }

    public function adminListSessions() {
        $status = $_GET['status'] ?? null;
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 10;
        $startDate = $_GET['startDate'] ?? null;
        $endDate = $_GET['endDate'] ?? null;
        $userSearch = $_GET['userSearch'] ?? null;
        $sessionId = $_GET['sessionId'] ?? null;

        // Ensure userSearch is actually passed if front-end changes
        echo json_encode($this->sessionModel->listAll(null, $status, $startDate, $endDate, $userSearch, $page, $limit, $sessionId));
    }

    public function getSessionDetails() {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) throw new Exception("ID de sesión requerido");
            
            $details = $this->sessionModel->getFullDetails($id);
            if (!$details) {
                http_response_code(404);
                echo json_encode(['error' => 'Sesión no encontrada']);
                return;
            }
            
            echo json_encode($details);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function generateSessionReport() {
        try {
            require_once __DIR__ . '/../../services/ReportGeneratorService.php';
            
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if(!$payload) throw new Exception('No autorizado');

            $sessionId = $_GET['id'] ?? null;
            if (!$sessionId) throw new Exception('ID de sesión requerido');

            // 1. Get raw data
            $details = $this->sessionModel->getFullDetails((int)$sessionId);
            if (!$details) throw new Exception('Sesión no encontrada');

            // 2. Identify Requester (use JWT payload if available)
            $requesterName = '';
            if (is_object($payload)) {
                $firstName = $payload->first_name ?? ($payload->firstName ?? '');
                $lastName = $payload->last_name ?? ($payload->lastName ?? '');
                $requesterName = trim("$firstName $lastName");
            } elseif (is_array($payload)) {
                $firstName = $payload['first_name'] ?? ($payload['firstName'] ?? '');
                $lastName = $payload['last_name'] ?? ($payload['lastName'] ?? '');
                $requesterName = trim("$firstName $lastName");
            }
            
            if ($requesterName === '') {
                // Creates a fallback to DB if needed, or just SHOW ID if name is missing
                // Ideally payload should have it. If not, we can query User model.
                // assuming payload->sub is user ID.
                require_once __DIR__ . '/../users/UserModel.php';
                $uModel = new UserModel();
                try {
                     $u = $uModel->getUserById($payload->sub);
                     if($u) $requesterName = trim($u['first_name']. ' ' . $u['last_name']);
                } catch(Exception $e) {}
            }
            if ($requesterName === '') $requesterName = "Usuario #" . ($payload->sub ?? '?');


            // 3. Prepare View Data (Calculated Totals from Details)
            $totals = [
                'cash_in_usd' => 0,
                'cash_in_bs' => 0,
                'mobile_bs' => 0,
                'transfer_bs' => 0,
                'total_usd_movements' => 0,
                'total_bs_movements' => 0
            ];

            $electronicPayments = [];
            $reversedMovements = [];

            // Re-scan movements in details to sum up
            foreach ($details['movements'] as $m) {
                // If it's a payment income
                $mType = $m['movement_type'] ?? ($m['type'] ?? '');
                
                if ($mType === 'payment_in') {
                    $amt = (float)$m['amount'];
                    $method = $m['payment_method'] ?? 'cash_bs';

                    if ($m['currency'] === 'USD') {
                        $totals['cash_in_usd'] += $amt;
                        $totals['total_usd_movements'] += $amt;
                    } else {
                        // Check methods for BS
                        if ($method === 'mobile_payment_bs') {
                           $totals['mobile_bs'] += $amt;
                           $electronicPayments[] = $m;
                        }
                        elseif ($method === 'transfer_bs') {
                           $totals['transfer_bs'] += $amt;
                           $electronicPayments[] = $m;
                        }
                        elseif ($method === 'cash_bs') {
                           $totals['cash_in_bs'] += $amt;
                        }
                        
                        $totals['total_bs_movements'] += $amt;
                    }
                } elseif ($mType === 'reversal') {
                    $reversedMovements[] = $m;
                }
            }

            $reportData = [
                'session' => $details['session'],
                'totals' => $totals,
                'accounts_created' => $details['opened_accounts'] ?? [],
                'accounts_billed' => $details['billed_accounts'] ?? [],
                'cancelled_receipts' => $reversedMovements,
                'electronic_payments' => $electronicPayments,
                'meta' => [
                    'generated_by' => $requesterName,
                    'generated_at' => date('d/m/Y h:i A')
                ]
            ];

            // 4. Send PDF
            $generator = new ReportGeneratorService();
            $pdfContent = $generator->generateSessionReportPdf($reportData, "Cierre_Caja_{$sessionId}.pdf");

            if (ob_get_level()) ob_end_clean();
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="reporte_sesion_' . $sessionId . '.pdf"');
            echo $pdfContent;
            exit;

        } catch (Exception $e) {
            http_response_code(400); echo $e->getMessage();
        }
    }
}

?>
