<?php
require_once __DIR__ . '/../../config/Database.php';

class PaymentModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function create($data) {
        $sql = 'INSERT INTO payments (account_id, payment_date, payment_method, amount, currency, exchange_rate_id, amount_usd_equivalent, reference_number, attachment_path, status, notes, registered_by) VALUES
                (:account_id, NOW(), :payment_method, :amount, :currency, :exchange_rate_id, :amount_usd_equivalent, :reference_number, :attachment_path, :status, :notes, :registered_by)';
        $this->db->execute($sql, [
            ':account_id'=>$data['account_id'],
            ':payment_method'=>$data['payment_method'],
            ':amount'=>$data['amount'],
            ':currency'=>$data['currency'],
            ':exchange_rate_id'=>$data['exchange_rate_id'],
            ':amount_usd_equivalent'=>$data['amount_usd_equivalent'],
            ':reference_number'=>$data['reference_number'] ?? null,
            ':attachment_path'=>$data['attachment_path'] ?? null,
            ':status'=>$data['status'],
            ':notes'=>$data['notes'] ?? null,
            ':registered_by'=>$data['registered_by']
        ]);
        return $this->db->lastInsertId();
    }

    public function getById($id) {
        $res = $this->db->query('SELECT * FROM payments WHERE id = :id', [':id'=>$id]);
        return $res[0] ?? null;
    }

    public function listByAccount($accountId) {
        // Avoid selecting heavy blobs
        $sql = 'SELECT id, account_id, payment_date, payment_method, amount, currency, exchange_rate_id, amount_usd_equivalent, reference_number, attachment_path, status, notes, registered_by, verified_by FROM payments WHERE account_id = :id ORDER BY id ASC';
        return $this->db->query($sql, [':id'=>$accountId]);
    }

    public function verify($id, $verifiedBy) {
        return $this->db->execute('UPDATE payments SET status = "verified", verified_by = :vb WHERE id = :id', [':vb'=>$verifiedBy, ':id'=>$id]);
    }

    public function delete($id) {
        return $this->db->execute('DELETE FROM payments WHERE id = :id', [':id'=>$id]);
    }

    public function listPending($limit = 200) {
        $limit = max(1, min(500, (int)$limit));
        $sql = 'SELECT p.id, p.account_id, p.payment_date, p.payment_method, p.amount, p.currency, p.exchange_rate_id, p.amount_usd_equivalent,
                       p.reference_number, p.attachment_path, p.status, p.notes, p.registered_by, p.verified_by,
                       a.status AS account_status, a.total_usd, a.total_bs
                FROM payments p
                INNER JOIN billing_accounts a ON a.id = p.account_id
                WHERE p.status = "pending_verification"
                ORDER BY p.payment_date DESC, p.id DESC
                LIMIT ' . $limit;
        return $this->db->query($sql);
    }

    // Note: attachment is saved on disk; DB stores only attachment_path
}
?>
