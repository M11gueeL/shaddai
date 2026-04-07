<?php

require_once __DIR__ . '/../../config/Database.php';

class SupplierModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll($onlyActive = false) {
        $sql = 'SELECT id, name, tax_id, contact_name, phone, email, address, is_active, created_at, updated_at
                FROM inventory_suppliers';

        $params = [];
        if ($onlyActive) {
            $sql .= ' WHERE is_active = :is_active';
            $params[':is_active'] = 1;
        }

        $sql .= ' ORDER BY name ASC';
        return $this->db->query($sql, $params);
    }

    public function getById($id) {
        $res = $this->db->query(
            'SELECT id, name, tax_id, contact_name, phone, email, address, is_active, created_at, updated_at
             FROM inventory_suppliers
             WHERE id = :id',
            [':id' => $id]
        );

        return $res[0] ?? null;
    }

    public function create($data) {
        $sql = 'INSERT INTO inventory_suppliers (name, tax_id, contact_name, phone, email, address, is_active)
                VALUES (:name, :tax_id, :contact_name, :phone, :email, :address, :is_active)';

        $params = [
            ':name' => $data['name'] ?? null,
            ':tax_id' => $data['tax_id'] ?? null,
            ':contact_name' => $data['contact_name'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':email' => $data['email'] ?? null,
            ':address' => $data['address'] ?? null,
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ];

        try {
            $this->db->execute($sql, $params);
            return (int)$this->db->lastInsertId();
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function update($id, $data) {
        $sql = 'UPDATE inventory_suppliers
                SET name = :name,
                    tax_id = :tax_id,
                    contact_name = :contact_name,
                    phone = :phone,
                    email = :email,
                    address = :address,
                    is_active = :is_active,
                    updated_at = NOW()
                WHERE id = :id';

        $params = [
            ':name' => $data['name'] ?? null,
            ':tax_id' => $data['tax_id'] ?? null,
            ':contact_name' => $data['contact_name'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':email' => $data['email'] ?? null,
            ':address' => $data['address'] ?? null,
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':id' => $id,
        ];

        try {
            return $this->db->execute($sql, $params);
        } catch (Exception $e) {
            throw $e;
        }
    }
}
