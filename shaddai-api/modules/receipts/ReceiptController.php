<?php
require_once __DIR__ . '/ReceiptModel.php';
require_once __DIR__ . '/../../modules/accounts/BillingAccountModel.php';
require_once __DIR__ . '/../../services/ReceiptService.php';
require_once __DIR__ . '/../../modules/cashregister/CashRegisterSessionModel.php';

class ReceiptController {
    private $model;
    private $accountModel;
    private $service;

    public function __construct() {
        $this->model = new ReceiptModel();
        $this->accountModel = new BillingAccountModel();
        $this->service = new ReceiptService();
    }

    public function generateReceipt($accountId) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $acc = $this->accountModel->getAccount((int)$accountId);
            if (!$acc) { http_response_code(404); echo json_encode(['error'=>'Account not found']); return; }
            if ($acc['status'] !== 'paid') { http_response_code(400); echo json_encode(['error'=>'Account is not paid']); return; }
            // If an active receipt already exists, reuse it
            $existing = $this->model->getLatestByAccount((int)$accountId);
            if ($existing) {
                echo json_encode(['receipt_id'=>(int)$existing['id'], 'receipt_number'=>$existing['receipt_number'], 'pdf_path'=>$existing['pdf_path'] ?? null]);
                return;
            }
            $created = $this->model->create((int)$accountId, null, $payload->sub);
            try { $pdf = $this->service->generatePdfForAccountReceipt((int)$created['id']); } catch (Exception $e) { $pdf = null; }
            echo json_encode(['receipt_id'=>(int)$created['id'], 'receipt_number'=>$created['receipt_number'], 'pdf_path'=>$pdf]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function listReceiptsByPatient($patientId) {
        echo json_encode($this->model->listByPatient((int)$patientId));
    }

    public function listAllReceipts() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');

            // Admin only usually, but let's check roles if critical
            $roles = $payload->roles ?? [];
            if (!in_array('admin', $roles)) {
                http_response_code(403); echo json_encode(['error'=>'Acceso denegado']); return;
            }

            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $search = $_GET['search'] ?? '';
            $status = $_GET['status'] ?? '';
            $offset = ($page - 1) * $limit;

            $data = $this->model->listAll($limit, $offset, $search, $status);
            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500); echo json_encode(['error'=>$e->getMessage()]);
        }
    }

    // Get latest receipt metadata for an account (no generation; auto handled by system)
    public function getByAccount($accountId) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $acc = $this->accountModel->getAccountWithRate((int)$accountId);
            if (!$acc) { http_response_code(404); echo json_encode(['error'=>'Account not found']); return; }
            $r = $this->model->getLatestByAccount((int)$accountId);
            if (!$r) { http_response_code(404); echo json_encode(['error'=>'Receipt not found']); return; }
            $downloadUrl = '/receipts/'.$r['id'].'/download';
            echo json_encode([
                'id' => (int)$r['id'],
                'receipt_number' => $r['receipt_number'],
                'issued_at' => $r['issued_at'],
                'status' => $r['status'],
                'pdf_path' => $r['pdf_path'] ?? null,
                'download_url' => $downloadUrl
            ]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    // Stream/download the PDF for a receipt id
    public function download($receiptId) {
        try {
            // Accept either middleware-injected payload or JWT from Authorization header
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) {
                throw new Exception('Token JWT requerido');
            }
            $id = (int)$receiptId;
            $db = Database::getInstance();
            $rows = $db->query('SELECT * FROM payment_receipts WHERE id = :id', [':id'=>$id]);
            if(!$rows){ http_response_code(404); echo json_encode(['error'=>'Not found']); return; }
            $r = $rows[0];
            $path = $r['pdf_path'] ?? null;
            if(!$path){
                try { $path = $this->service->generatePdfForAccountReceipt($id); } catch (Exception $e) { /* ignore */ }
            }
            if($path){
                $abs = __DIR__ . '/../../public' . $path;
                if(is_file($abs)){
                    // Limpieza profunda de buffers
                    while (@ob_get_level() > 0) { @ob_end_clean(); }
                    ini_set('zlib.output_compression', '0');
                    if (function_exists('apache_setenv')) {
                        @apache_setenv('no-gzip', '1');
                    }
                    ignore_user_abort(true);
                    set_time_limit(0);
                    clearstatcache(true, $abs);
                    // Reconfigurar headers para binario
                    header_remove('Content-Type');
                    header('Content-Type: application/pdf', true, 200);
                    header('Content-Transfer-Encoding: binary');
                    header('Accept-Ranges: bytes');
                    header('Content-Disposition: attachment; filename="'.basename($abs).'"');
                    header('Content-Length: '.filesize($abs));
                    header('Cache-Control: no-store, no-cache, must-revalidate');
                    header('Pragma: no-cache');
                    header('Expires: 0');
                    $fp = fopen($abs, 'rb');
                    if ($fp) {
                        while (!feof($fp)) {
                            echo fread($fp, 8192);
                            flush();
                        }
                        fclose($fp);
                    }
                    exit; // terminar inmediatamente
                }
            }
            http_response_code(404); echo json_encode(['error'=>'Archivo no disponible']);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function annul($receiptId) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');

            // 1. Role Restriction: Only admins can annul receipts
            $roles = $payload->roles ?? [];
            if (!in_array('admin', $roles)) {
                http_response_code(403); 
                echo json_encode(['error' => 'Acceso denegado. Solo administradores pueden anular recibos.']);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $reason = $input['reason'] ?? 'Sin motivo especificado';
            
            $this->voidReceipt((int)$receiptId, $payload->sub, $reason);
            echo json_encode(['message'=>'Recibo anulado correctamente']);
        } catch (Exception $e) {
            http_response_code(400); 
            echo json_encode(['error'=>$e->getMessage()]);
        }
    }

    public function voidReceipt($receiptId, $userId, $reason) {
        $db = Database::getInstance();
        try {
            if (!$db->inTransaction()) {
                $db->beginTransaction();
            }

            // 1. Validar: Verificar que el recibo existe y su status no sea ya 'annulled'.
            $sql = "SELECT id, receipt_number, status, payment_id, account_id, pdf_path FROM payment_receipts WHERE id = :id FOR UPDATE";
            $rows = $db->query($sql, [':id' => $receiptId]);
            if (empty($rows)) {
                throw new Exception("Recibo no encontrado.");
            }
            $receipt = $rows[0];

            if ($receipt['status'] === 'annulled') {
                throw new Exception("El recibo ya se encuentra anulado.");
            }

            // 2. Actualizar payment_receipts: Set status='annulled', clear pdf_path, fill annulled info
            $sqlVoid = "UPDATE payment_receipts SET status = 'annulled', pdf_path = NULL, annulled_at = NOW(), annulled_by = :uid, annulled_reason = :reason WHERE id = :id";
            $db->execute($sqlVoid, [':uid' => $userId, ':reason' => $reason, ':id' => $receiptId]);

            // Force removal of existing PDF so it regenerates with "ANULADO" watermark on next download
            if (!empty($receipt['pdf_path'])) {
                 $physicalPath = __DIR__ . '/../../public' . $receipt['pdf_path'];
                 if (is_file($physicalPath)) {
                     @unlink($physicalPath);
                 }
            }

            // 3. Obtener monto y moneda antes de anular el pago
            $amount = 0;
            $currency = 'USD'; // Default
            
            if ($receipt['payment_id']) {
                $payRows = $db->query("SELECT amount, currency, status FROM payments WHERE id = :pid", [':pid' => $receipt['payment_id']]);
                if (!empty($payRows)) {
                    $payment = $payRows[0];
                    $amount = $payment['amount'];
                    $currency = $payment['currency'];
                    
                    // 4. Actualizar tabla payments: Set status='rejected'
                    $db->execute("UPDATE payments SET status = 'rejected' WHERE id = :pid", [':pid' => $receipt['payment_id']]);
                }
            } else {
                 // Si no hay payment_id directo (ej. recibo agrupa varios), la lógica sería más compleja.
                 // Asumimos modelo actual: 1 Recibo = 1 Pago (o null).
            }

            // [NUEVO] 4.1. Reabrir la Cuenta (BillingAccount)
            // Cambiar estado a 'pending' o 'partially_paid' para permitir ediciones.
            // Al anular el pago, el saldo pendiente aumenta.
            // En este caso, lo pasaremos a 'pending' o 'partially_paid' dependiendo si quedan otros pagos.
            // Para simplificar y cumplir requerimiento de "modificarla nuevamente", 'pending' o 'partially_paid' 
            // no bloquean edición. Si hay otros pagos parciales, debería ser 'partially_paid'.
            // Verificamos si hay otros pagos válidos.
            
            $otherPayments = $db->query("SELECT COUNT(*) as c FROM payments WHERE account_id = :acc AND status = 'verified' AND id <> :pid", [
                ':acc' => $receipt['account_id'], 
                ':pid' => $receipt['payment_id'] ?? 0
            ]);
            $hasOtherPayments = ($otherPayments[0]['c'] > 0);
            
            $newAccountStatus = $hasOtherPayments ? 'partially_paid' : 'pending';
            
            $db->execute("UPDATE billing_accounts SET status = :st WHERE id = :acc", [
                ':st' => $newAccountStatus, 
                ':acc' => $receipt['account_id']
            ]);


            // 5. Insertar contra-partida en cash_register_movements
            // Validar sesión abierta
            $sessionModel = new CashRegisterSessionModel();
            $session = $sessionModel->findOpenByUser($userId);
            
            if (!$session) {
                // Si es admin y no tiene caja abierta, podríamos permitirlo (logueando sin session_id)?
                // Pero el requerimiento "Reverso de Caja" implica caja.
                // Si el admin no es cajero, esto fallará. Asumimos Admin DEBE abrir caja para anular (para registrar el movimiento).
                throw new Exception("Error: Debes tener una sesión de caja abierta para registrar el reverso contable.");
            }

            if ($amount > 0) {
                $desc = "ANULACIÓN Recibo " . $receipt['receipt_number'] . ". Motivo: " . $reason;
                $sqlMov = "INSERT INTO cash_register_movements (session_id, payment_id, movement_type, amount, currency, description, created_by, created_at) 
                           VALUES (:sess, :pid, 'reversal', :amt, :curr, :desc, :uid, NOW())";
                
                $db->execute($sqlMov, [
                    ':sess' => $session['id'],
                    ':pid'  => $receipt['payment_id'],
                    ':amt'  => $amount,
                    ':curr' => $currency,
                    ':desc' => $desc,
                    ':uid'  => $userId
                ]);
            }

            // 6. Commit
            $db->commit();
            return true;

        } catch (Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            throw $e;
        }
    }
}
?>
