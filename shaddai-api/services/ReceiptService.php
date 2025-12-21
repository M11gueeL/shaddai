<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../modules/receipts/ReceiptModel.php';
require_once __DIR__ . '/../modules/accounts/BillingAccountModel.php';

// Composer autoload (already loaded elsewhere usually, but safe)
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

use Dompdf\Dompdf;
use Dompdf\Options;

class ReceiptService {
    private $db;
    private $receiptModel;
    private $accountModel;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->receiptModel = new ReceiptModel();
        $this->accountModel = new BillingAccountModel();
    }

    public function generatePdfForAccountReceipt($receiptId) {
        $sql = 'SELECT r.*, ba.patient_id, ba.payer_patient_id, ba.total_usd, ba.total_bs, ba.exchange_rate_id, ba.created_at as account_created_at, p.full_name as patient_name, payer.full_name as payer_name, der.rate_bcv,
                u.first_name as issuer_first_name, u.last_name as issuer_last_name
                FROM payment_receipts r
                INNER JOIN billing_accounts ba ON ba.id = r.account_id
                INNER JOIN patients p ON p.id = ba.patient_id
                INNER JOIN patients payer ON payer.id = ba.payer_patient_id
                INNER JOIN daily_exchange_rates der ON der.id = ba.exchange_rate_id
                LEFT JOIN users u ON u.id = r.issued_by
                WHERE r.id = :id';
        $rows = $this->db->query($sql, [':id'=>$receiptId]);
        if(!$rows) throw new Exception('Receipt not found');
        $receipt = $rows[0];

        $issuerName = ($receipt['issuer_first_name'] ?? '') . ' ' . ($receipt['issuer_last_name'] ?? '');
        if (trim($issuerName) === '') $issuerName = 'Sistema';

        $services = $this->db->query('SELECT d.*, s.name as service_name FROM billing_account_details d INNER JOIN services s ON s.id = d.service_id WHERE d.account_id = :acc ORDER BY d.id ASC', [':acc'=>$receipt['account_id']]);
        $supplies = $this->db->query('SELECT s.*, ii.name as item_name, ii.unit_of_measure FROM billing_account_supplies s INNER JOIN inventory_items ii ON ii.id = s.item_id WHERE s.account_id = :acc ORDER BY s.id ASC', [':acc'=>$receipt['account_id']]);
        $payments = $this->db->query('SELECT payment_date, payment_method, amount, currency, amount_usd_equivalent, reference_number, status FROM payments WHERE account_id = :acc AND status <> "rejected" ORDER BY id ASC', [':acc'=>$receipt['account_id']]);

        $baseDir = __DIR__ . '/../public/uploads/receipts/' . date('Ym');
        if(!is_dir($baseDir)) { @mkdir($baseDir, 0775, true); }
        $fileName = 'receipt_' . $receipt['id'] . '_' . preg_replace('/[^0-9A-Za-z_-]/','', $receipt['receipt_number']) . '.pdf';
        $destPath = $baseDir . '/' . $fileName;
        $publicPath = '/uploads/receipts/' . date('Ym') . '/' . $fileName;

        $logoHtml = '<div style="font-size:20px;font-weight:600;letter-spacing:1px;">Centro Médico Shaddai</div>';
        $style = '<style>body{font-family:Helvetica,Arial,sans-serif;color:#111;font-size:12px;margin:16px;}\n.table{width:100%;border-collapse:collapse;margin-top:8px;}\n.table th{background:#f5f5f5;text-align:left;padding:6px;border:1px solid #ddd;font-size:11px;}\n.table td{padding:6px;border:1px solid #ddd;font-size:11px;}\n.section-title{margin-top:16px;font-weight:600;font-size:13px;border-bottom:2px solid #444;padding-bottom:3px;}\n.footer{margin-top:18px;font-size:10px;color:#666;text-align:center;}\n.badge{display:inline-block;background:#111;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:.5px;}\n</style>';

        $servicesRows = '';
        foreach($services as $s){
            $servicesRows .= '<tr><td>'.htmlspecialchars($s['service_name']).'</td><td style="text-align:right">'.(int)$s['quantity'].'</td><td style="text-align:right">USD '.number_format((float)$s['price_usd'],2).'</td><td style="text-align:right">Bs '.number_format((float)$s['price_bs'],2).'</td></tr>';
        }
        if($servicesRows==='') $servicesRows = '<tr><td colspan="4" style="text-align:center;color:#666;">Sin servicios</td></tr>';

        $suppliesRows='';
        foreach($supplies as $sp){
            $usd = (float)$sp['total_price_usd'];
            $bs = (float)$sp['total_price_bs'];
            $suppliesRows .= '<tr><td>'.htmlspecialchars($sp['description'] ?: $sp['item_name']).'</td><td style="text-align:right">'.(int)$sp['quantity'].'</td><td style="text-align:right">USD '.number_format($usd,2).'</td><td style="text-align:right">Bs '.number_format($bs,2).'</td></tr>';
        }
        if($suppliesRows==='') $suppliesRows = '<tr><td colspan="4" style="text-align:center;color:#666;">Sin insumos</td></tr>';

        $paymentsRows='';
        $paidUsdTotal=0; $rate = (float)$receipt['rate_bcv'];
        foreach($payments as $p){
            $paidUsdTotal += (float)$p['amount_usd_equivalent'];
            $labelMap = [ 'cash_usd'=>'Efectivo USD','cash_bs'=>'Efectivo Bs','transfer_bs'=>'Transferencia Bs','mobile_payment_bs'=>'Pago móvil Bs' ];
            $paymentsRows .= '<tr><td>'.($labelMap[$p['payment_method']] ?? $p['payment_method']).'</td><td style="text-align:right">'.htmlspecialchars($p['currency']).' '.number_format((float)$p['amount'],2).'</td><td style="text-align:right">USD '.number_format((float)$p['amount_usd_equivalent'],2).'</td><td>'.($p['reference_number']?htmlspecialchars($p['reference_number']):'-').'</td></tr>';
        }
        if($paymentsRows==='') $paymentsRows = '<tr><td colspan="4" style="text-align:center;color:#666;">Sin pagos</td></tr>';

        $saldoUsd = max(0, (float)$receipt['total_usd'] - $paidUsdTotal);

        $html = '<html><head>'.$style.'</head><body>' .
            '<table style="width:100%"><tr><td>'.$logoHtml.'</td><td style="text-align:right">'.
            '<span class="badge">RECIBO</span><br/><span class="small">No: '.htmlspecialchars($receipt['receipt_number']).'</span><br/>' .
            '<span class="small">Fecha emisión: '.htmlspecialchars($receipt['issued_at']).'</span><br/>' .
            '<span class="small">Generado por: '.htmlspecialchars($issuerName).'</span></td></tr></table>' .
            '<div class="section-title">Datos del Paciente / Pagador</div>' .
            '<table class="table"><tr><th>Paciente</th><th>Pagador</th><th>Total USD</th><th>Total Bs</th></tr>' .
            '<tr><td>'.htmlspecialchars($receipt['patient_name']).'</td><td>'.htmlspecialchars($receipt['payer_name']).'</td><td style="text-align:right">'. number_format((float)$receipt['total_usd'],2) .'</td><td style="text-align:right">'. number_format((float)$receipt['total_bs'],2) .'</td></tr></table>' .
            '<div class="section-title">Servicios</div>' .
            '<table class="table"><tr><th>Servicio</th><th>Cant.</th><th>Precio USD</th><th>Precio Bs</th></tr>'.$servicesRows.'</table>' .
            '<div class="section-title">Insumos</div>' .
            '<table class="table"><tr><th>Insumo</th><th>Cant.</th><th>Total USD</th><th>Total Bs</th></tr>'.$suppliesRows.'</table>' .
            '<div class="section-title">Pagos</div>' .
            '<table class="table"><tr><th>Método</th><th>Monto</th><th>Eq. USD</th><th>Referencia</th></tr>'.$paymentsRows.'</table>' .
            '<table style="width:100%;margin-top:10px"><tr><td style="width:60%"></td><td style="vertical-align:top">' .
            '<table class="table" style="width:100%"><tr><th>Total USD</th><th>Pagado USD</th><th>Saldo USD</th></tr>' .
            '<tr><td style="text-align:right">'.number_format((float)$receipt['total_usd'],2).'</td><td style="text-align:right">'.number_format($paidUsdTotal,2).'</td><td style="text-align:right">'.number_format($saldoUsd,2).'</td></tr></table>' .
            '</td></tr></table>' .
            '<div class="footer">Este recibo no constituye factura fiscal. Generado automáticamente por el sistema Shaddai.</div>' .
            '</body></html>';

        if(!class_exists(Dompdf::class)) {
            throw new Exception('Dompdf no instalado (composer require dompdf/dompdf)');
        }
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();
        if(!$output || strlen($output) < 100) {
            throw new Exception('PDF vacío o inválido');
        }
        file_put_contents($destPath, $output);
        try { $this->db->execute('UPDATE payment_receipts SET pdf_path = :p WHERE id = :id', [':p'=>$publicPath, ':id'=>$receiptId]); } catch(Exception $e) { /* column may not exist */ }
        return $publicPath;
    }
}
?>
