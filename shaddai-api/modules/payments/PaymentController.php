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
        if (class_exists('finfo')) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);
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
            $payment_date = $data['payment_date'] ?? null;

            if (!$payment_method || !$amount || !$currency) { http_response_code(400); echo json_encode(['error'=>'payment_method, amount and currency are required']); return; }
            if (!in_array($payment_method, ['cash_usd','cash_bs','transfer_bs','mobile_payment_bs'])) { http_response_code(400); echo json_encode(['error'=>'Invalid payment_method']); return; }
            if (!in_array($currency, ['USD','BS'])) { http_response_code(400); echo json_encode(['error'=>'Invalid currency']); return; }

            // Validate custom date if provided
            $finalDate = null;
            if ($payment_date && in_array($payment_method, ['transfer_bs','mobile_payment_bs'])) {
                // strict validation Y-m-d
                $d = DateTime::createFromFormat('Y-m-d', $payment_date);
                if (!$d || $d->format('Y-m-d') !== $payment_date) {
                    http_response_code(400); echo json_encode(['error'=>'Formato de fecha inválido. Use YYYY-MM-DD']); return;
                }
                $today = new DateTime('now');
                $today->setTime(0, 0, 0); // start of today
                $inputDate = new DateTime($payment_date);
                $inputDate->setTime(0, 0, 0);

                if ($inputDate > $today) {
                    http_response_code(400); echo json_encode(['error'=>'La fecha de pago no puede ser futura']); return;
                }

                // If date is today, check if we should just use NOW() (backend time) or keep 00:00:00
                // If it is in the past, maybe set to 12:00:00 to avoid timezone edge cases
                if ($inputDate == $today) {
                   $finalDate = date('Y-m-d H:i:s'); // Use current time for "Today"
                } else {
                   $finalDate = $payment_date . ' 12:00:00'; // Midday for past dates
                }
            }

            $todayRate = $this->rateService->getTodayOrFail();

            // [NEW] Strict overpayment check requested by user:
            // "lo preferible es que un cuenta no se marque como PAGADA por automatico ... lo que si obviamente es que si el monto pagado es igual al monto total no permitir mas pagos"
            // We check if account is already effectively paid (Status might be 'partially_paid' due to manual closure requirement, but if math says full, stop payments).
            
            $paidSoFar = $this->billingService->getAccountPaymentUsdSum((int)$accountId);
            $isPaidMath = ($paidSoFar + 0.0001 >= (float)$account['total_usd']);
            if ($isPaidMath) {
                 // But wait, if they create a payment because they plan to delete another?
                 // User said: "no permitir mas pagos a menos que se elimine uno".
                 // So if it's already full, we BLOCK.
                 http_response_code(400); 
                 echo json_encode(['error'=>'La cuenta ya cubre el monto total. No se permiten más pagos a menos que elimine uno existente.']); 
                 return;
            }

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
            // Optional attachment for transfer/mobile
            // if (in_array($payment_method, ['transfer_bs','mobile_payment_bs']) && !$attachment_path) {
            //    http_response_code(400); echo json_encode(['error'=>'El comprobante es obligatorio para transferencias o pago móvil']); return;
            // }

            // Validaciones de sobrepago:
            // $paidSoFar calculado previamente al inicio
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

            // [NEW] Consolidation Logic: Update existing cash payment if exists today
            if ($isCash) {
                // Look for an existing verify payment for this account, method, currency, AND created today
                $sqlCheck = "SELECT id, amount, amount_usd_equivalent, notes, currency FROM payments 
                             WHERE account_id = :aid 
                             AND payment_method = :pm 
                             AND currency = :curr 
                             AND status = 'verified' 
                             AND DATE(payment_date) = CURDATE() 
                             AND deleted_at IS NULL
                             ORDER BY id DESC LIMIT 1";
                
                $existing = $this->model->db()->query($sqlCheck, [
                    ':aid' => $accountId,
                    ':pm'  => $payment_method,
                    ':curr'=> $currency
                ]);

                if (!empty($existing)) {
                    $old = $existing[0];
                    $newTotalAmount = (float)$old['amount'] + (float)$finalAmount;
                    $newTotalUsd = (float)$old['amount_usd_equivalent'] + (float)$finalUsdEq;
                    $newNotes = trim($old['notes'] . ' | ' . ($notes ?? 'Adición: ' . $finalAmount));

                    $this->model->db()->execute(
                        "UPDATE payments SET amount = :amt, amount_usd_equivalent = :usd, notes = :notes WHERE id = :id",
                        [':amt' => $newTotalAmount, ':usd' => $newTotalUsd, ':notes' => $newNotes, ':id' => $old['id']]
                    );
                    
                    // Side effects (triggers) might need to run but usually they update account totals.
                    // Recalculating totals is safe.
                    $updatedPayment = $this->model->getById($old['id']);
                    $this->paymentService->postPaymentSideEffects($updatedPayment, $payload->sub);

                    http_response_code(200);
                    echo json_encode(['id' => (int)$old['id'], 'message' => 'Payment consolidated']);
                    return;
                }
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
                'payment_date' => $finalDate,
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

    public function downloadAttachment($paymentId) {
        try {
            // Auth check (middleware usually handles this, but we need payload for extra checks if needed)
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');

            $payment = $this->model->getById((int)$paymentId);
            if (!$payment || empty($payment['attachment_path'])) {
                http_response_code(404); echo "Archivo no encontrado"; return;
            }

            // Path Cleaning
            // stored: /uploads/payments/202501/xxx.jpg
            $relPath = ltrim($payment['attachment_path'], '/');
            // base: modules/payments/../../public/
            $fullPath = realpath(__DIR__ . '/../../public/' . $relPath);

            if (!$fullPath || !file_exists($fullPath)) {
                http_response_code(404); echo "Archivo físico no encontrado"; return;
            }

            $mime = mime_content_type($fullPath);
            $filename = basename($fullPath);

            if (ob_get_level()) ob_end_clean();
            header('Content-Type: ' . $mime);
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($fullPath));
            readfile($fullPath);
            exit;
        } catch (Exception $e) {
            http_response_code(400); echo $e->getMessage();
        }
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

