<?php
require_once __DIR__ . '/PaymentModel.php';
require_once __DIR__ . '/../../services/RateService.php';
require_once __DIR__ . '/../../services/PaymentService.php';
require_once __DIR__ . '/../cashregister/CashRegisterSessionModel.php';
require_once __DIR__ . '/../../modules/accounts/BillingAccountModel.php';

class PaymentController {
    private $model;
    private $rateService;
    private $paymentService;
    private $accountModel;
    private $cashSessionModel;

    public function __construct() {
        $this->model = new PaymentModel();
        $this->rateService = new RateService();
        $this->paymentService = new PaymentService();
    $this->accountModel = new BillingAccountModel();
    $this->cashSessionModel = new CashRegisterSessionModel();
    }

    private function saveAttachment($file) {
        if (!$file || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;
        $baseDir = __DIR__ . '/../../public/uploads/payments/' . date('Ym');
        if (!is_dir($baseDir)) { @mkdir($baseDir, 0775, true); }
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $name = uniqid('pay_', true) . ($ext ? ('.' . $ext) : '');
        $dest = $baseDir . '/' . $name;
        if (!move_uploaded_file($file['tmp_name'], $dest)) return null;
        // public path relative for frontend
        $publicPath = '/uploads/payments/' . date('Ym') . '/' . $name;
        return $publicPath;
    }

    public function createPayment($accountId) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $account = $this->accountModel->getAccountWithRate((int)$accountId);
            if (!$account) { http_response_code(404); echo json_encode(['error'=>'Account not found']); return; }
            if ($account['status'] === 'cancelled') { http_response_code(400); echo json_encode(['error'=>'Cannot register payments to a cancelled account']); return; }
            if ($account['status'] === 'paid') { http_response_code(400); echo json_encode(['error'=>'La cuenta ya está pagada en su totalidad; no se permiten más pagos']); return; }

            $data = $_POST; // for JSON body
            $payment_method = $data['payment_method'] ?? null;
            $amount = isset($data['amount']) ? (float)$data['amount'] : null;
            $currency = $data['currency'] ?? null; // 'USD' or 'BS'
            $reference = $data['reference_number'] ?? null;
            $notes = $data['notes'] ?? null;

            if (!$payment_method || !$amount || !$currency) { http_response_code(400); echo json_encode(['error'=>'payment_method, amount and currency are required']); return; }
            if (!in_array($payment_method, ['cash_usd','cash_bs','transfer_bs','mobile_payment_bs'])) { http_response_code(400); echo json_encode(['error'=>'Invalid payment_method']); return; }
            if (!in_array($currency, ['USD','BS'])) { http_response_code(400); echo json_encode(['error'=>'Invalid currency']); return; }

            $todayRate = $this->rateService->getTodayOrFail();

            $usdEq = $currency === 'USD' ? $amount : round($amount / (float)$todayRate['rate_bcv'], 2);
            $status = in_array($payment_method, ['transfer_bs','mobile_payment_bs']) ? 'pending_verification' : 'verified';

            // If cash and will be verified immediately, require an open cash session beforehand
            $isCash = in_array($payment_method, ['cash_usd','cash_bs']);
            if ($isCash && $status === 'verified') {
                $open = $this->cashSessionModel->findOpenByUser($payload->sub);
                if (!$open) { http_response_code(400); echo json_encode(['error'=>'Debe abrir una sesión de caja antes de registrar pagos en efectivo']); return; }
            }

            // file upload (multipart)
            $attachment = null;
            if (!empty($_FILES['attachment'])) {
                $attachment = $this->saveAttachment($_FILES['attachment']);
            }

            $paymentId = $this->model->create([
                'account_id' => (int)$accountId,
                'payment_method' => $payment_method,
                'amount' => $amount,
                'currency' => $currency,
                'exchange_rate_id' => $todayRate['id'],
                'amount_usd_equivalent' => $usdEq,
                'reference_number' => $reference,
                'attachment_path' => $attachment,
                'status' => $status,
                'notes' => $notes,
                'registered_by' => $payload->sub,
            ]);

            $payment = $this->model->getById($paymentId);

            // triggers
            $this->paymentService->postPaymentSideEffects($payment, $payload->sub);

            http_response_code(201);
            echo json_encode(['id'=>(int)$paymentId]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function verifyPayment($paymentId) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $payment = $this->model->getById((int)$paymentId);
            if (!$payment) { http_response_code(404); echo json_encode(['error'=>'Payment not found']); return; }
            if ($payment['status'] === 'verified') { echo json_encode(['status'=>'already_verified']); return; }
            if ($payment['status'] === 'rejected') { http_response_code(400); echo json_encode(['error'=>'Cannot verify a rejected payment']); return; }
            $this->model->verify((int)$paymentId, $payload->sub);
            $payment = $this->model->getById((int)$paymentId);
            // triggers may need to create cash movement if method was cash_... (but verified implies it wasn't cash). For bank transfers, no cash movement.
            $this->paymentService->postPaymentSideEffects($payment, $payload->sub);
            echo json_encode(['status'=>'verified']);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function listByAccount($accountId) {
        echo json_encode($this->model->listByAccount((int)$accountId));
    }
}
?>
