<?php
require_once __DIR__ . '/PaymentModel.php';
require_once __DIR__ . '/../../services/RateService.php';
require_once __DIR__ . '/../../services/PaymentService.php';
require_once __DIR__ . '/../../services/BillingService.php';
require_once __DIR__ . '/../cashregister/CashRegisterSessionModel.php';
require_once __DIR__ . '/../../modules/accounts/BillingAccountModel.php';

class PaymentController {
    private $model;
    private $rateService;
    private $paymentService;
    private $billingService;
    private $accountModel;
    private $cashSessionModel;

    public function __construct() {
        $this->model = new PaymentModel();
        $this->rateService = new RateService();
        $this->paymentService = new PaymentService();
    $this->accountModel = new BillingAccountModel();
    $this->cashSessionModel = new CashRegisterSessionModel();
    $this->billingService = new BillingService();
    }

    // Save attachment to disk and return the public relative path
    private function saveAttachment($file) {
        if (!$file || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;
        // Validate size (<= 8MB)
        $max = 8 * 1024 * 1024; // 8MB
        if (!empty($file['size']) && (int)$file['size'] > $max) {
            throw new Exception('El archivo excede el tamaño máximo permitido (8MB)');
        }
        // Validate mime
        $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','application/pdf'=>'pdf'];
        $mime = null;
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = $finfo ? finfo_file($finfo, $file['tmp_name']) : null;
            if ($finfo) finfo_close($finfo);
        }
        if (!$mime || !isset($allowed[$mime])) {
            throw new Exception('Tipo de archivo no permitido. Solo JPG, PNG, WEBP o PDF');
        }
        $ext = $allowed[$mime];
        $baseDir = __DIR__ . '/../../public/uploads/payments/' . date('Ym');
        if (!is_dir($baseDir)) { @mkdir($baseDir, 0775, true); }
        $name = uniqid('pay_', true) . '.' . $ext;
        $dest = $baseDir . '/' . $name;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new Exception('No se pudo guardar el archivo');
        }
        // Return public path relative for frontend
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

            // file upload (multipart) -> save to disk and keep path in DB
            $attachment_path = null;
            if (!empty($_FILES['attachment'])) {
                $attachment_path = $this->saveAttachment($_FILES['attachment']);
            }
            // Require attachment for transfer/mobile
            if (in_array($payment_method, ['transfer_bs','mobile_payment_bs']) && !$attachment_path) {
                http_response_code(400); echo json_encode(['error'=>'El comprobante es obligatorio para transferencias o pago móvil']); return;
            }

            // Validaciones de sobrepago:
            $paidSoFar = $this->billingService->getAccountPaymentUsdSum((int)$accountId);
            $saldoUsd = max(0, (float)$account['total_usd'] - $paidSoFar);
            $epsilon = 0.01;
            $isElectronic = in_array($payment_method, ['transfer_bs','mobile_payment_bs']);
            if ($isElectronic && $usdEq > $saldoUsd + $epsilon) {
                // Rechazar inmediatamente sobrepago electrónico
                http_response_code(400); echo json_encode(['error'=>'El monto excede el saldo disponible para este método (transferencia/pago móvil)']); return;
            }
            $isCash = in_array($payment_method, ['cash_usd','cash_bs']);
            $finalAmount = $amount; // podría ajustarse si decidimos limitar efectivo
            $finalUsdEq = $usdEq;
            if ($isCash && $usdEq > $saldoUsd + $epsilon) {
                // Permitir sobrepago en efectivo, pero registrar únicamente el saldo como pago real
                // (el vuelto se maneja fuera de esta lógica si se requiere movimiento adicional)
                $finalUsdEq = $saldoUsd; // limitar equivalencia
                if ($currency === 'USD') {
                    $finalAmount = $saldoUsd; // guardamos solo lo necesario
                } else { // BS
                    $finalAmount = round($saldoUsd * (float)$todayRate['rate_bcv'], 2);
                }
                $notes = trim(($notes ?? '') . ' Sobrepago en efectivo, monto ingresado: ' . $amount . ' ' . $currency . ', registrado: ' . $finalAmount . ' ' . $currency);
            }

            $paymentId = $this->model->create([
                'account_id' => (int)$accountId,
                'payment_method' => $payment_method,
                'amount' => $finalAmount,
                'currency' => $currency,
                'exchange_rate_id' => $todayRate['id'],
                'amount_usd_equivalent' => $finalUsdEq,
                'reference_number' => $reference,
                'attachment_path' => $attachment_path,
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

    public function listPendingAdmin() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if(!$payload) throw new Exception('No autorizado');
            // Could enforce role check via middleware already
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
            echo json_encode($this->model->listPending($limit));
        } catch(Exception $e){ http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function deletePayment($paymentId) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $payment = $this->model->getById((int)$paymentId);
            if (!$payment) { http_response_code(404); echo json_encode(['error'=>'Pago no encontrado']); return; }

            // Si el pago ya estaba verificado en efectivo, eliminar el movimiento de caja asociado
            $isCash = in_array($payment['payment_method'], ['cash_usd','cash_bs']);
            if ($isCash && $payment['status'] === 'verified') {
                // Eliminar movimientos ligados a este pago
                $this->paymentService->deleteCashMovementsForPayment((int)$payment['id']);
            }

            // Eliminar el pago
            $this->model->delete((int)$paymentId);

            // Recalcular estado de la cuenta tras la eliminación
            $this->billingService->refreshAccountStatusByPayments($payment['account_id']);

            echo json_encode(['status'=>'deleted']);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }
}
?>
