<?php
require_once __DIR__ . '/../../config/Database.php';

class ReceiptModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function create($accountId, $paymentId, $issuedBy) {
        // generate sequential REC-YYYY-xxxxx
        $year = date('Y');
        $prefix = 'REC-' . $year . '-';
        $row = $this->db->query('SELECT receipt_number FROM payment_receipts WHERE receipt_number LIKE :pfx ORDER BY id DESC LIMIT 1', [':pfx'=>$prefix.'%']);
        $seq = 1;
        if ($row) {
            $last = $row[0]['receipt_number'];
            $num = (int)substr($last, strrpos($last, '-')+1);
            $seq = $num + 1;
        }
        $recNumber = $prefix . str_pad((string)$seq, 5, '0', STR_PAD_LEFT);
        $sql = 'INSERT INTO payment_receipts (receipt_number, account_id, payment_id, issued_by, issued_at, status) VALUES (:n, :acc, :pay, :by, NOW(), "active")';
        $this->db->execute($sql, [':n'=>$recNumber, ':acc'=>$accountId, ':pay'=>$paymentId, ':by'=>$issuedBy]);
        return ['id'=>$this->db->lastInsertId(), 'receipt_number'=>$recNumber];
    }

    public function listByPatient($patientId) {
        $sql = 'SELECT r.*, ba.patient_id, ba.payer_patient_id FROM payment_receipts r INNER JOIN billing_accounts ba ON ba.id = r.account_id WHERE ba.patient_id = :p ORDER BY r.issued_at DESC';
        return $this->db->query($sql, [':p'=>$patientId]);
    }
}
?>
