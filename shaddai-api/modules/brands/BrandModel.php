<?php
require_once __DIR__ . '/../../config/Database.php';

class BrandModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll($onlyActive = false) {
        $sql = "SELECT * FROM inventory_brands";
        if ($onlyActive) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY name ASC";
        return $this->db->query($sql);
    }

    public function getById($id) {
        $res = $this->db->query("SELECT * FROM inventory_brands WHERE id = :id", [':id' => $id]);
        return $res[0] ?? null;
    }

    public function create($name, $description) {
        $sql = "INSERT INTO inventory_brands (name, description) VALUES (:name, :description)";
        $this->db->execute($sql, [':name' => $name, ':description' => $description]);
        return $this->db->lastInsertId();
    }

    public function update($id, $name, $description, $isActive) {
        $sql = "UPDATE inventory_brands SET name = :name, description = :description, is_active = :active WHERE id = :id";
        return $this->db->execute($sql, [
            ':name' => $name, 
            ':description' => $description, 
            ':active' => $isActive, 
            ':id' => $id
        ]);
    }

    public function delete($id) {
        // Soft delete
        return $this->db->execute("UPDATE inventory_brands SET is_active = 0 WHERE id = :id", [':id' => $id]);
    }
}
?>
