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
}
?>
