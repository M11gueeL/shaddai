<?php
require_once __DIR__ . '/../../config/Database.php';

class NotificationRulesModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll() {
        return $this->db->query("SELECT * FROM notification_rules ORDER BY minutes_before ASC");
    }

    public function getById($id) {
        $res = $this->db->query("SELECT * FROM notification_rules WHERE id = :id", [':id' => $id]);
        return $res[0] ?? null;
    }

    public function create($data) {
        $sql = "INSERT INTO notification_rules (name, minutes_before, is_active) VALUES (:name, :minutes_before, :is_active)";
        $params = [
            ':name' => $data['name'], 
            ':minutes_before' => $data['minutes_before'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ];
        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        if (isset($data['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = $data['name'];
        }
        if (isset($data['minutes_before'])) {
            $fields[] = "minutes_before = :minutes_before";
            $params[':minutes_before'] = $data['minutes_before'];
        }
        if (isset($data['is_active'])) {
             $fields[] = "is_active = :is_active";
             $params[':is_active'] = (int)$data['is_active'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE notification_rules SET " . implode(', ', $fields) . " WHERE id = :id";
        return $this->db->execute($sql, $params);
    }

    public function delete($id) {
        return $this->db->execute("DELETE FROM notification_rules WHERE id = :id", [':id' => $id]);
    }
}
