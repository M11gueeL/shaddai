<?php
require_once __DIR__ . '/../../config/Database.php';

class RateModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function getToday() {
        $sql = 'SELECT * FROM daily_exchange_rates WHERE rate_date = CURDATE() ORDER BY id DESC LIMIT 1';
        $res = $this->db->query($sql);
        return $res[0] ?? null;
    }

    public function findByDate($date) {
        $res = $this->db->query('SELECT * FROM daily_exchange_rates WHERE rate_date = :d', [':d'=>$date]);
        return $res[0] ?? null;
    }

    public function create($rate_bcv, $created_by, $date = null) {
        $date = $date ?: date('Y-m-d');
        $sql = 'INSERT INTO daily_exchange_rates (rate_date, rate_bcv, created_by) VALUES (:d, :r, :u)';
        $this->db->execute($sql, [':d'=>$date, ':r'=>$rate_bcv, ':u'=>$created_by]);
        return $this->db->lastInsertId();
    }

    public function list($limit = 30) {
        $limit = max(1, min(200, (int)$limit));
        return $this->db->query('SELECT * FROM daily_exchange_rates ORDER BY rate_date DESC, id DESC LIMIT ' . $limit);
    }
}
?>
