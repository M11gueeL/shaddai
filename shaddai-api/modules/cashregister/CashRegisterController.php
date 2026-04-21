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

    public function addMovement() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');

            $userId = $payload->sub;
            $open = $this->sessionModel->findOpenByUser($userId);
            if (!$open) {
                http_response_code(404);
                echo json_encode(['error' => 'No hay sesión de caja abierta']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!is_array($input)) {
                $input = [];
            }

            $movementType = isset($_POST['movement_type']) ? $_POST['movement_type'] : ($input['movement_type'] ?? null);
            $amount = isset($_POST['amount']) ? (float)$_POST['amount'] : (isset($input['amount']) ? (float)$input['amount'] : 0);
            $currency = isset($_POST['currency']) ? $_POST['currency'] : ($input['currency'] ?? null);
            $description = isset($_POST['description']) ? trim((string)$_POST['description']) : trim((string)($input['description'] ?? ''));

            $allowedTypes = ['expense_out', 'adjustment_out', 'adjustment_in'];
            if (!in_array($movementType, $allowedTypes, true)) {
                throw new Exception('Tipo de movimiento no válido');
            }

            $allowedCurrencies = ['USD', 'BS'];
            if (!in_array($currency, $allowedCurrencies, true)) {
                throw new Exception('Moneda no válida');
            }

            if ($amount <= 0) {
                throw new Exception('El monto debe ser mayor a 0');
            }

            if ($description === '') {
                throw new Exception('La descripción es obligatoria');
            }

            $movementId = $this->movementModel->create([
                'session_id' => $open['id'],
                'payment_id' => null,
                'movement_type' => $movementType,
                'amount' => $amount,
                'currency' => $currency,
                'description' => $description,
                'created_by' => $userId
            ]);

            http_response_code(201);
            echo json_encode([
                'message' => 'Movimiento registrado exitosamente',
                'movement_id' => (int)$movementId
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
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
            $session = $details['session'];
            $totals = [
                'opening_usd' => (float)($session['start_balance_usd'] ?? 0),
                'opening_bs' => (float)($session['start_balance_bs'] ?? 0),
                'cash_in_usd' => 0,
                'cash_in_bs' => 0,
                'zelle_usd' => 0,
                'other_usd' => 0,
                'mobile_bs' => 0,
                'transfer_bs' => 0,
                'card_bs' => 0,
                'movement_in_usd' => 0,
                'movement_in_bs' => 0,
                'movement_out_usd' => 0,
                'movement_out_bs' => 0,
                'net_usd_movements' => 0,
                'net_bs_movements' => 0,
                'expected_usd' => isset($session['calculated_end_balance_usd']) ? (float)$session['calculated_end_balance_usd'] : null,
                'expected_bs' => isset($session['calculated_end_balance_bs']) ? (float)$session['calculated_end_balance_bs'] : null,
                'declared_usd' => isset($session['real_end_balance_usd']) ? (float)$session['real_end_balance_usd'] : null,
                'declared_bs' => isset($session['real_end_balance_bs']) ? (float)$session['real_end_balance_bs'] : null,
                'difference_usd' => isset($session['difference_usd']) ? (float)$session['difference_usd'] : 0,
                'difference_bs' => isset($session['difference_bs']) ? (float)$session['difference_bs'] : 0,
                'is_balanced' => false,
                'has_shortage' => false,
                'has_surplus' => false
            ];

            $movementTypeLabels = [
                'payment_in' => 'Ingreso por cobro',
                'expense_out' => 'Gasto / salida de caja',
                'adjustment_in' => 'Ajuste de entrada',
                'adjustment_out' => 'Ajuste de salida',
                'reversal' => 'Reverso de operación',
                'initial_balance' => 'Fondo inicial'
            ];

            $methodLabels = [
                'cash_usd' => 'Efectivo USD',
                'cash_bs' => 'Efectivo Bs',
                'transfer_bs' => 'Transferencia',
                'mobile_payment_bs' => 'Pago móvil',
                'zelle' => 'Zelle'
            ];

            $inTypes = ['payment_in', 'adjustment_in', 'initial_balance'];
            $outTypes = ['expense_out', 'adjustment_out', 'reversal'];

            $movementsForReport = [];
            $electronicPayments = [];
            $reversedMovements = [];

            // Re-scan movements in details to sum up and normalize for report
            foreach ($details['movements'] as $m) {
                $mType = $m['movement_type'] ?? ($m['type'] ?? '');
                $currency = strtoupper((string)($m['currency'] ?? ''));
                $amt = (float)($m['amount'] ?? 0);
                $method = $m['payment_method'] ?? null;

                if (in_array($mType, $inTypes, true)) {
                    if ($currency === 'USD') $totals['movement_in_usd'] += $amt;
                    if ($currency === 'BS') $totals['movement_in_bs'] += $amt;
                }
                if (in_array($mType, $outTypes, true)) {
                    if ($currency === 'USD') $totals['movement_out_usd'] += $amt;
                    if ($currency === 'BS') $totals['movement_out_bs'] += $amt;
                }

                if ($mType === 'payment_in') {
                    if ($currency === 'USD') {
                        if ($method === 'zelle') $totals['zelle_usd'] += $amt;
                        elseif ($method === null || $method === 'cash_usd' || $method === 'cash') $totals['cash_in_usd'] += $amt;
                        else $totals['other_usd'] += $amt;
                    } elseif ($currency === 'BS') {
                        if ($method === 'mobile_payment_bs') {
                            $totals['mobile_bs'] += $amt;
                            $electronicPayments[] = $m;
                        }
                        elseif ($method === 'transfer_bs') {
                            $totals['transfer_bs'] += $amt;
                            $electronicPayments[] = $m;
                        }
                        elseif ($method === null || $method === 'cash_bs' || $method === 'cash') {
                            $totals['cash_in_bs'] += $amt;
                        }
                        else {
                            $totals['card_bs'] += $amt;
                        }
                    }
                }

                if ($mType === 'reversal') {
                    $reversedMovements[] = $m;
                }

                $direction = in_array($mType, $outTypes, true) ? 'out' : (in_array($mType, $inTypes, true) ? 'in' : 'neutral');
                $movementsForReport[] = [
                    'created_at' => $m['created_at'] ?? null,
                    'movement_type' => $mType,
                    'movement_label' => $movementTypeLabels[$mType] ?? 'Movimiento de caja',
                    'direction' => $direction,
                    'amount' => $amt,
                    'currency' => $currency,
                    'description' => $m['description'] ?? '',
                    'payment_method_label' => $method ? ($methodLabels[$method] ?? 'Método no especificado') : null,
                    'reference_number' => $m['reference_number'] ?? null,
                    'account_id' => $m['account_id'] ?? null
                ];
            }

            $totals['net_usd_movements'] = $totals['movement_in_usd'] - $totals['movement_out_usd'];
            $totals['net_bs_movements'] = $totals['movement_in_bs'] - $totals['movement_out_bs'];

            // Backward compatibility keys used by current report sections
            $totals['total_usd_movements'] = $totals['movement_in_usd'];
            $totals['total_bs_movements'] = $totals['movement_in_bs'];

            if ($totals['expected_usd'] === null) {
                $totals['expected_usd'] = $totals['opening_usd'] + $totals['net_usd_movements'];
            }
            if ($totals['expected_bs'] === null) {
                $totals['expected_bs'] = $totals['opening_bs'] + $totals['net_bs_movements'];
            }

            $totals['is_balanced'] = (abs($totals['difference_usd']) < 0.01 && abs($totals['difference_bs']) < 0.01);
            $totals['has_shortage'] = ($totals['difference_usd'] < -0.009 || $totals['difference_bs'] < -0.009);
            $totals['has_surplus'] = ($totals['difference_usd'] > 0.009 || $totals['difference_bs'] > 0.009);

            $reportData = [
                'session' => $session,
                'totals' => $totals,
                'movements' => $movementsForReport,
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
