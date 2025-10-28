<?php

require_once __DIR__ . '/../../config/Database.php';

class ServiceModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll($onlyActive = true) {
        $sql = 'SELECT id, name, description, price_usd, is_active, created_by, created_at, updated_at FROM services';
        $params = [];
        if ($onlyActive) {
            $sql .= ' WHERE is_active = 1';
        }
        $sql .= ' ORDER BY name ASC';
        return $this->db->query($sql, $params);
    }

    public function getById($id) {
        $result = $this->db->query('SELECT * FROM services WHERE id = :id', [':id' => $id]);
        return $result[0] ?? null;
    }

    public function create($data) {
        $sql = 'INSERT INTO services (name, description, price_usd, is_active, created_by) VALUES (:name, :description, :price_usd, :is_active, :created_by)';
        $params = [
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':price_usd' => $data['price_usd'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':created_by' => $data['created_by']
        ];
        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $sql = 'UPDATE services SET name = :name, description = :description, price_usd = :price_usd, is_active = :is_active WHERE id = :id';
        $params = [
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':price_usd' => $data['price_usd'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':id' => $id
        ];
        return $this->db->execute($sql, $params);
    }

    public function delete($id) {
        // Borrado lógico
        return $this->db->execute('UPDATE services SET is_active = 0 WHERE id = :id', [':id' => $id]);
    }
}

?>
