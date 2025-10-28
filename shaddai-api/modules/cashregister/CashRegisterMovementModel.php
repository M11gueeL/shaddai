<?php
require_once __DIR__ . '/../../config/Database.php';

class CashRegisterMovementModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function create($data) {
        $sql = 'INSERT INTO cash_register_movements (session_id, payment_id, movement_type, amount, currency, description, created_by) 
                VALUES (:session_id, :payment_id, :movement_type, :amount, :currency, :description, :created_by)';
        $this->db->execute($sql, [
            ':session_id'=>$data['session_id'],
            ':payment_id'=>$data['payment_id'] ?? null,
            ':movement_type'=>$data['movement_type'],
            ':amount'=>$data['amount'],
            ':currency'=>$data['currency'],
            ':description'=>$data['description'],
            ':created_by'=>$data['created_by']
        ]);
        return $this->db->lastInsertId();
    }

    public function sumBySessionAndCurrency($sessionId, $currency) {
        $res = $this->db->query('SELECT COALESCE(SUM(CASE WHEN movement_type IN ("payment_in","adjustment_in","initial_balance") THEN amount ELSE 0 END) - SUM(CASE WHEN movement_type IN ("expense_out","adjustment_out") THEN amount ELSE 0 END),0) as total FROM cash_register_movements WHERE session_id = :id AND currency = :cur', [':id'=>$sessionId, ':cur'=>$currency]);
        return (float)($res[0]['total'] ?? 0);
    }

    public function listBySession($sessionId) {
        return $this->db->query('SELECT * FROM cash_register_movements WHERE session_id = :id ORDER BY id ASC', [':id'=>$sessionId]);
    }
}
?>
