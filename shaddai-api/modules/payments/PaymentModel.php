<?php
require_once __DIR__ . '/../../config/Database.php';

class PaymentModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function create($data) {
        // Build dynamic insert to support optional attachment_data/mime/name columns if present
        $columns = ['account_id','payment_date','payment_method','amount','currency','exchange_rate_id','amount_usd_equivalent','reference_number','status','notes','registered_by'];
        $params = [
            ':account_id'=>$data['account_id'],
            ':payment_method'=>$data['payment_method'],
            ':amount'=>$data['amount'],
            ':currency'=>$data['currency'],
            ':exchange_rate_id'=>$data['exchange_rate_id'],
            ':amount_usd_equivalent'=>$data['amount_usd_equivalent'],
            ':reference_number'=>$data['reference_number'] ?? null,
            ':status'=>$data['status'],
            ':notes'=>$data['notes'] ?? null,
            ':registered_by'=>$data['registered_by']
        ];

        // legacy path column
        if ($this->hasColumn('payments','attachment_path')) {
            $columns[] = 'attachment_path';
            $params[':attachment_path'] = $data['attachment_path'] ?? null;
        }
        // new blob columns (optional)
        if ($this->hasColumn('payments','attachment_data')) {
            $columns[] = 'attachment_data';
            $params[':attachment_data'] = $data['attachment_data'] ?? null;
        }
        if ($this->hasColumn('payments','attachment_mime')) {
            $columns[] = 'attachment_mime';
            $params[':attachment_mime'] = $data['attachment_mime'] ?? null;
        }
        if ($this->hasColumn('payments','attachment_name')) {
            $columns[] = 'attachment_name';
            $params[':attachment_name'] = $data['attachment_name'] ?? null;
        }

        $colsSql = implode(', ', $columns);
        // map to placeholders
        $placeholders = array_map(function($c){
            if ($c === 'payment_date') return 'NOW()';
            return ':' . $c;
        }, $columns);
        $phSql = implode(', ', $placeholders);
        $sql = "INSERT INTO payments ($colsSql) VALUES ($phSql)";
        $this->db->execute($sql, $params);
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

    private function hasColumn($table, $column) {
        try {
            $dbName = $_ENV['DB_NAME'] ?? null;
            if (!$dbName) return false;
            $sql = 'SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :tbl AND COLUMN_NAME = :col';
            $res = $this->db->query($sql, [':db'=>$dbName, ':tbl'=>$table, ':col'=>$column]);
            return (int)($res[0]['cnt'] ?? 0) > 0;
        } catch (Exception $e) { return false; }
    }
}
?>
