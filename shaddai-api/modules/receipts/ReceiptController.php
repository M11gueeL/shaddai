<?php
require_once __DIR__ . '/ReceiptModel.php';
require_once __DIR__ . '/../../modules/accounts/BillingAccountModel.php';
require_once __DIR__ . '/../../services/ReceiptService.php';

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
}
?>
