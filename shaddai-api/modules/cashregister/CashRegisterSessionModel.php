<?php
require_once __DIR__ . '/../../config/Database.php';

class CashRegisterSessionModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function findOpenByUser($userId) {
        $res = $this->db->query('SELECT * FROM cash_register_sessions WHERE user_id = :u AND status = "open" ORDER BY id DESC LIMIT 1', [':u'=>$userId]);
        return $res[0] ?? null;
    }

    public function open($userId, $usd, $bs) {
        $sql = 'INSERT INTO cash_register_sessions (user_id, start_time, start_balance_usd, start_balance_bs, status) VALUES (:u, NOW(), :usd, :bs, "open")';
        $this->db->execute($sql, [':u'=>$userId, ':usd'=>$usd, ':bs'=>$bs]);
        return $this->db->lastInsertId();
    }

    public function close($sessionId, $calcUsd, $realUsd, $calcBs, $realBs, $notes = null) {
        $sql = 'UPDATE cash_register_sessions SET end_time = NOW(), calculated_end_balance_usd = :cUsd, real_end_balance_usd = :rUsd, calculated_end_balance_bs = :cBs, real_end_balance_bs = :rBs, notes = :notes, status = "closed" WHERE id = :id';
        return $this->db->execute($sql, [
            ':cUsd'=>$calcUsd, ':rUsd'=>$realUsd, ':cBs'=>$calcBs, ':rBs'=>$realBs, ':notes'=>$notes, ':id'=>$sessionId
        ]);
    }

    public function listAll($userId = null, $status = null) {
        $where = [];$params=[];
        if ($userId) { $where[]='s.user_id = :u'; $params[':u']=$userId; }
        if ($status) { $where[]='s.status = :st'; $params[':st']=$status; }
        $sql = 'SELECT s.*, u.first_name, u.last_name FROM cash_register_sessions s INNER JOIN users u ON u.id = s.user_id';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY s.start_time DESC';
        return $this->db->query($sql, $params);
    }
}
?>
