<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../modules/rates/RateModel.php';

class BillingService {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function computeTotalsForAccount($accountId) {
        // Sum details and update account
        $sum = $this->db->query('SELECT COALESCE(SUM(quantity * price_usd),0) as total_usd, COALESCE(SUM(quantity * price_bs),0) as total_bs FROM billing_account_details WHERE account_id = :id', [':id'=>$accountId]);
        $totals = $sum[0] ?? ['total_usd'=>0,'total_bs'=>0];
        $this->db->execute('UPDATE billing_accounts SET total_usd = :tu, total_bs = :tb, updated_at = NOW() WHERE id = :id', [':tu'=>$totals['total_usd'], ':tb'=>$totals['total_bs'], ':id'=>$accountId]);
        return $totals;
    }

    public function getAccountWithRate($accountId) {
        $sql = 'SELECT ba.*, der.rate_bcv FROM billing_accounts ba INNER JOIN daily_exchange_rates der ON der.id = ba.exchange_rate_id WHERE ba.id = :id';
        $res = $this->db->query($sql, [':id'=>$accountId]);
        return $res[0] ?? null;
    }

    public function getAccountPaymentUsdSum($accountId) {
        $sql = 'SELECT COALESCE(SUM(amount_usd_equivalent),0) as paid_usd FROM payments WHERE account_id = :id AND status <> "rejected"';
        $res = $this->db->query($sql, [':id'=>$accountId]);
        return (float)($res[0]['paid_usd'] ?? 0);
    }

    public function refreshAccountStatusByPayments($accountId) {
        $acc = $this->db->query('SELECT id, total_usd, status FROM billing_accounts WHERE id = :id', [':id'=>$accountId]);
        if (!$acc) return null;
        $acc = $acc[0];
        $paid = $this->getAccountPaymentUsdSum($accountId);
        $newStatus = 'pending';
        if ($paid <= 0.0001) {
            $newStatus = 'pending';
        } elseif ($paid + 0.0001 >= (float)$acc['total_usd']) { // allow tiny epsilon
            $newStatus = 'paid';
        } else {
            $newStatus = 'partially_paid';
        }
        if ($newStatus !== $acc['status']) {
            $this->db->execute('UPDATE billing_accounts SET status = :st, updated_at = NOW() WHERE id = :id', [':st'=>$newStatus, ':id'=>$accountId]);
        }
        return ['paid_usd'=>$paid, 'status'=>$newStatus];
    }
}
?>
