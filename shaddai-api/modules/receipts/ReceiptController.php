<?php
require_once __DIR__ . '/ReceiptModel.php';
require_once __DIR__ . '/../../modules/accounts/BillingAccountModel.php';

class ReceiptController {
    private $model;
    private $accountModel;

    public function __construct() {
        $this->model = new ReceiptModel();
        $this->accountModel = new BillingAccountModel();
    }

    public function generateReceipt($accountId) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $acc = $this->accountModel->getAccount((int)$accountId);
            if (!$acc) { http_response_code(404); echo json_encode(['error'=>'Account not found']); return; }
            if ($acc['status'] !== 'paid') { http_response_code(400); echo json_encode(['error'=>'Account is not paid']); return; }
            $created = $this->model->create((int)$accountId, null, $payload->sub);
            // Assemble payload for client (for now, no PDF generation)
            $payloadOut = [
                'receipt_id' => (int)$created['id'],
                'receipt_number' => $created['receipt_number'],
                'account' => $acc,
            ];
            echo json_encode($payloadOut);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function listReceiptsByPatient($patientId) {
        echo json_encode($this->model->listByPatient((int)$patientId));
    }
}
?>
