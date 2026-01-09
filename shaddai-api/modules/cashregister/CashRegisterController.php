<?php
require_once __DIR__ . '/CashRegisterSessionModel.php';
require_once __DIR__ . '/CashRegisterMovementModel.php';

class CashRegisterController {
    private $sessionModel;
    private $movementModel;

    public function __construct() {
        $this->sessionModel = new CashRegisterSessionModel();
        $this->movementModel = new CashRegisterMovementModel();
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

    public function listMyMovements() {
        $payload = $_REQUEST['jwt_payload'] ?? null;
        if (!$payload) { http_response_code(401); echo json_encode(['error'=>'No autorizado']); return; }
        $open = $this->sessionModel->findOpenByUser($payload->sub);
        if (!$open) { echo json_encode([]); return; }
        echo json_encode($this->movementModel->listBySession($open['id']));
    }

    public function closeSession() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;
            $open = $this->sessionModel->findOpenByUser($userId);
            if (!$open) { http_response_code(400); echo json_encode(['error'=>'No hay sesión abierta']); return; }
            // compute calculated balances from movements
            $calcUsd = $this->movementModel->sumBySessionAndCurrency($open['id'], 'USD');
            $calcBs = $this->movementModel->sumBySessionAndCurrency($open['id'], 'BS');
            $realUsd = isset($_POST['real_end_balance_usd']) ? (float)$_POST['real_end_balance_usd'] : null;
            $realBs = isset($_POST['real_end_balance_bs']) ? (float)$_POST['real_end_balance_bs'] : null;
            $notes = $_POST['notes'] ?? null;
            $this->sessionModel->close($open['id'], $calcUsd, $realUsd, $calcBs, $realBs, $notes);
            echo json_encode(['closed'=>true, 'calculated'=>['USD'=>$calcUsd,'BS'=>$calcBs]]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function adminListSessions() {
        $status = $_GET['status'] ?? null;
        echo json_encode($this->sessionModel->listAll(null, $status));
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
