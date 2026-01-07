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

        // Logic to fetch payments: Include 'rejected' ONLY if it is the payment linked to this receipt (in case of annulment)
        // or if the receipt itself is annulled, we might want to show what was attempting to be paid. 
        // Safer approach: Always show non-rejected, OR show the specific payment_id linked even if rejected.
        // UPDATE: User wants to see ALL payments (even rejected ones) if the receipt is annulled, to keep the history.
        $isAnnulled = ($receipt['status'] === 'annulled');
        
        $paySql = 'SELECT payment_date, payment_method, amount, currency, amount_usd_equivalent, reference_number, status, id 
                   FROM payments 
                   WHERE account_id = :acc AND deleted_at IS NULL ';
        
        // If NOT annulled, hide rejected payments generally (unless it's the specific linked one which is rare but safe to include)
        // If annulled, show EVERYTHING so the user sees what happened (including the payment that "disappeared").
        if (!$isAnnulled) {
             $paySql .= ' AND (status <> "rejected" OR id = :pid)';
        }
        $paySql .= ' ORDER BY id ASC';

        $payments = $this->db->query($paySql, [':acc'=>$receipt['account_id'], ':pid'=>$receipt['payment_id'] ?? 0]);

        // --- Logic to consolidate Cash payments (USD & BS) ---
        $processedPayments = [];
        $cashConsolidation = [];

        foreach($payments as $p) {
            $key = $p['payment_method'];
            
            if (in_array($key, ['cash_usd', 'cash_bs'])) {
                // Key sensitive found to status. e.g. "cash_usd_verified" vs "cash_usd_rejected"
                // We typically only find active ones, but if annulled, mixed types exist.
                $compositeKey = $key . '_' . $p['status'];
                
                if (!isset($cashConsolidation[$compositeKey])) {
                    $cashConsolidation[$compositeKey] = $p;
                    $cashConsolidation[$compositeKey]['original_count'] = 1;
                    $cashConsolidation[$compositeKey]['notes'] = $p['notes'] ?? ''; // Initialize notes
                } else {
                    $cashConsolidation[$compositeKey]['amount'] += $p['amount'];
                    $cashConsolidation[$compositeKey]['amount_usd_equivalent'] += $p['amount_usd_equivalent'];
                    // Append notes if any
                    if (!empty($p['notes'])) {
                        $existingNotes = $cashConsolidation[$compositeKey]['notes'] ?? '';
                        $separator = $existingNotes ? ' | ' : '';
                        $cashConsolidation[$compositeKey]['notes'] = $existingNotes . $separator . $p['notes'];
                    }
                    $cashConsolidation[$compositeKey]['original_count']++;
                }
            } else {
                $processedPayments[] = $p;
            }
        }

        // Merge consolidated cash back into the list
        foreach ($cashConsolidation as $c) {
            if ($c) {
                // Ensure date is valid for template (take last or keep first? First is fine)
                array_unshift($processedPayments, $c);
            }
        }
        
        // Logical sort by ID
        usort($processedPayments, function($a, $b) {
            return $a['id'] <=> $b['id'];
        });

        $payments = $processedPayments; // Replace with processed list
        // -----------------------------------------------------

        // Calculate totals logic for the view
        $paidUsdTotal = 0;
        foreach($payments as $p){
            // If payment is rejected but shown (because it's the linked one or we are listing everything in annulled receipt), 
            // we typically DO NOT add it to the "Paid" total if it is rejected, because effectively it is not paid.
            // But if the user wants to see the "snapshot" of the receipt BEFORE it was annulled, we might need to count it?
            // "el recibo anulado dice que falta dinero... claro porque el pago en pago movil se borro"
            // The user implies they want to see the totals AS THEY WERE.
            // So if the receipt is annulled, we should probably Sum even the rejected ones to reconstruct the original state?
            // OR, the PDF template should explicitly list them and maybe the total logic needs to handle "what was attempted".
            
            // DECISION: If receipt is annulled, we count rejected payments towards the total ONLY IF they were rejected 
            // likely due to this annulment? Hard to know. 
            // Simplest fix: If isAnnulled, sum everything to match the "original" view.
            if ($p['status'] !== 'rejected' || $isAnnulled) {
                $paidUsdTotal += (float)$p['amount_usd_equivalent'];
            }
        }
        // If the receipt is annulled, the total due might effectively be everything since payment was revoked.
        $saldoUsd = max(0, (float)$receipt['total_usd'] - $paidUsdTotal);

        // -- Generate HTML from Template --
        ob_start();
        // Variables $receipt, $issuerName, $services, $supplies, $payments, $paidUsdTotal, $saldoUsd are available to the template
        require __DIR__ . '/../templates/receipts/receipt_pdf.php';
        $html = ob_get_clean();

        // -- PDF Generation --
        $baseDir = __DIR__ . '/../public/uploads/receipts/' . date('Ym');
        if(!is_dir($baseDir)) { @mkdir($baseDir, 0775, true); }
        $fileName = 'receipt_' . $receipt['id'] . '_' . preg_replace('/[^0-9A-Za-z_-]/','', $receipt['receipt_number']) . '.pdf';
        $destPath = $baseDir . '/' . $fileName;
        $publicPath = '/uploads/receipts/' . date('Ym') . '/' . $fileName;

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
        
        // Save path if column exists
        try { 
            $this->db->execute('UPDATE payment_receipts SET pdf_path = :p WHERE id = :id', [':p'=>$publicPath, ':id'=>$receiptId]); 
        } catch(Exception $e) { /* column may not exist */ }
        
        return $publicPath;
    }
}
?>
