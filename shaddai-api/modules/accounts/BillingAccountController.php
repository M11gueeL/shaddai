<?php
require_once __DIR__ . '/BillingAccountModel.php';
require_once __DIR__ . '/../services/ServiceModel.php';
require_once __DIR__ . '/../../services/RateService.php';
require_once __DIR__ . '/../../services/BillingService.php';

class BillingAccountController {
    private $model;
    private $serviceModel;
    private $rateService;
    private $billingService;

    public function __construct() {
        $this->model = new BillingAccountModel();
        $this->serviceModel = new ServiceModel();
        $this->rateService = new RateService();
        $this->billingService = new BillingService();
    }

    public function createAccount() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $patient_id = (int)($_POST['patient_id'] ?? 0);
            $payer_patient_id = (int)($_POST['payer_patient_id'] ?? 0);
            $appointment_id = isset($_POST['appointment_id']) ? (int)$_POST['appointment_id'] : null;
            if ($patient_id <= 0 || $payer_patient_id <= 0) { http_response_code(400); echo json_encode(['error'=>'patient_id and payer_patient_id are required']); return; }
            $rate = $this->rateService->getTodayOrFail();
            $id = $this->model->create([
                'patient_id' => $patient_id,
                'payer_patient_id' => $payer_patient_id,
                'appointment_id' => $appointment_id,
                'exchange_rate_id' => $rate['id'],
                'created_by' => $payload->sub,
            ]);
            http_response_code(201);
            echo json_encode(['id'=>(int)$id]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function getAccountById($id) {
        $acc = $this->model->getAccount((int)$id);
        if ($acc) echo json_encode($acc); else { http_response_code(404); echo json_encode(['error'=>'Account not found']); }
    }

    public function listAccounts() {
        $f = [
            'patient_id' => $_GET['patient_id'] ?? null,
            'payer_patient_id' => $_GET['payer_patient_id'] ?? null,
            'status' => $_GET['status'] ?? null,
            'from' => $_GET['from'] ?? null,
            'to' => $_GET['to'] ?? null,
        ];
        echo json_encode($this->model->list($f));
    }

    public function addDetailToAccount($id) {
        try {
            $account = $this->model->getAccountWithRate((int)$id);
            if (!$account) { http_response_code(404); echo json_encode(['error'=>'Account not found']); return; }
            if ($account['status'] === 'cancelled' || $account['status'] === 'paid') { http_response_code(400); echo json_encode(['error'=>'Cannot add details to a cancelled or paid account']); return; }
            $service_id = (int)($_POST['service_id'] ?? 0);
            $qty = (int)($_POST['quantity'] ?? 1);
            if ($service_id <= 0) { http_response_code(400); echo json_encode(['error'=>'service_id is required']); return; }
            if ($qty <= 0) $qty = 1;
            $service = $this->serviceModel->getById($service_id);
            if (!$service || (int)$service['is_active'] !== 1) { http_response_code(400); echo json_encode(['error'=>'Service not found or inactive']); return; }
            $priceUsd = (float)$service['price_usd'];
            $priceBs = round($priceUsd * (float)$account['rate_bcv'], 2);
            $detailId = $this->model->addDetail((int)$id, $service_id, $service['name'], $qty, $priceUsd, $priceBs);
            $totals = $this->billingService->computeTotalsForAccount((int)$id);
            http_response_code(201);
            echo json_encode(['detail_id'=>(int)$detailId, 'totals'=>$totals]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function removeDetail($detailId) {
        try {
            // Find account id from detail
            $db = Database::getInstance();
            $row = $db->query('SELECT account_id FROM billing_account_details WHERE id = :id', [':id'=>(int)$detailId]);
            if (!$row) { http_response_code(404); echo json_encode(['error'=>'Detail not found']); return; }
            $accountId = (int)$row[0]['account_id'];
            $acc = $this->model->getAccountWithRate($accountId);
            if (!$acc) { http_response_code(404); echo json_encode(['error'=>'Account not found']); return; }
            if ($acc['status'] === 'cancelled' || $acc['status'] === 'paid') { http_response_code(400); echo json_encode(['error'=>'Cannot remove details from a cancelled or paid account']); return; }
            $this->model->removeDetail((int)$detailId);
            $totals = $this->billingService->computeTotalsForAccount($accountId);
            echo json_encode(['removed'=>true, 'totals'=>$totals]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function cancelAccount($id) {
        try {
            $acc = $this->model->getAccountWithRate((int)$id);
            if (!$acc) { http_response_code(404); echo json_encode(['error'=>'Account not found']); return; }
            if ($acc['status'] === 'paid') { http_response_code(400); echo json_encode(['error'=>'Cannot cancel a paid account']); return; }
            $this->model->updateStatus((int)$id, 'cancelled');
            echo json_encode(['status'=>'cancelled']);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }
}
?>
