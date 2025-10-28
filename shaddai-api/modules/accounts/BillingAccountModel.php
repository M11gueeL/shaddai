<?php
require_once __DIR__ . '/../../config/Database.php';

class BillingAccountModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function create($data) {
        $sql = 'INSERT INTO billing_accounts (patient_id, payer_patient_id, appointment_id, status, total_usd, total_bs, exchange_rate_id, created_by, created_at) VALUES (:patient_id, :payer_patient_id, :appointment_id, "pending", 0, 0, :exchange_rate_id, :created_by, NOW())';
        $params = [
            ':patient_id' => $data['patient_id'],
            ':payer_patient_id' => $data['payer_patient_id'],
            ':appointment_id' => $data['appointment_id'] ?? null,
            ':exchange_rate_id' => $data['exchange_rate_id'],
            ':created_by' => $data['created_by']
        ];
        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }

    public function getAccount($id) {
        $sql = 'SELECT ba.*, der.rate_bcv, p.full_name as patient_name, payer.full_name as payer_name FROM billing_accounts ba 
                INNER JOIN daily_exchange_rates der ON der.id = ba.exchange_rate_id
                INNER JOIN patients p ON p.id = ba.patient_id
                INNER JOIN patients payer ON payer.id = ba.payer_patient_id
                WHERE ba.id = :id';
        $acc = $this->db->query($sql, [':id'=>$id]);
        if (!$acc) return null;
        $acc = $acc[0];
        $details = $this->db->query('SELECT d.*, s.name as service_name FROM billing_account_details d INNER JOIN services s ON s.id = d.service_id WHERE d.account_id = :id ORDER BY d.id ASC', [':id'=>$id]);
        $payments = $this->db->query('SELECT * FROM payments WHERE account_id = :id ORDER BY id ASC', [':id'=>$id]);
        $acc['details'] = $details;
        $acc['payments'] = $payments;
        return $acc;
    }

    public function list($filters = []) {
        $where = [];
        $params = [];
        if (!empty($filters['patient_id'])) { $where[] = 'ba.patient_id = :pid'; $params[':pid'] = (int)$filters['patient_id']; }
        if (!empty($filters['payer_patient_id'])) { $where[] = 'ba.payer_patient_id = :ppid'; $params[':ppid'] = (int)$filters['payer_patient_id']; }
        if (!empty($filters['status'])) { $where[] = 'ba.status = :st'; $params[':st'] = $filters['status']; }
        if (!empty($filters['from'])) { $where[] = 'ba.created_at >= :from'; $params[':from'] = $filters['from'] . ' 00:00:00'; }
        if (!empty($filters['to'])) { $where[] = 'ba.created_at <= :to'; $params[':to'] = $filters['to'] . ' 23:59:59'; }
        $sql = 'SELECT ba.*, p.full_name as patient_name, payer.full_name as payer_name FROM billing_accounts ba 
                INNER JOIN patients p ON p.id = ba.patient_id
                INNER JOIN patients payer ON payer.id = ba.payer_patient_id';
        if ($where) { $sql .= ' WHERE ' . implode(' AND ', $where); }
        $sql .= ' ORDER BY ba.created_at DESC, ba.id DESC';
        return $this->db->query($sql, $params);
    }

    public function getAccountWithRate($id) {
        $sql = 'SELECT ba.*, der.rate_bcv FROM billing_accounts ba INNER JOIN daily_exchange_rates der ON der.id = ba.exchange_rate_id WHERE ba.id = :id';
        $res = $this->db->query($sql, [':id'=>$id]);
        return $res[0] ?? null;
    }

    public function addDetail($accountId, $serviceId, $description, $quantity, $priceUsd, $priceBs) {
        $sql = 'INSERT INTO billing_account_details (account_id, service_id, description, quantity, price_usd, price_bs) VALUES (:aid, :sid, :desc, :qty, :pu, :pb)';
        $params = [
            ':aid' => $accountId,
            ':sid' => $serviceId,
            ':desc' => $description,
            ':qty' => $quantity,
            ':pu' => $priceUsd,
            ':pb' => $priceBs
        ];
        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }

    public function removeDetail($detailId) {
        return $this->db->execute('DELETE FROM billing_account_details WHERE id = :id', [':id'=>$detailId]);
    }

    public function updateStatus($accountId, $status) {
        return $this->db->execute('UPDATE billing_accounts SET status = :st WHERE id = :id', [':st'=>$status, ':id'=>$accountId]);
    }
}
?>
