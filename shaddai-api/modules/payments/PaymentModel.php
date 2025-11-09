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

    // Note: attachment is saved on disk; DB stores only attachment_path
}
?>
