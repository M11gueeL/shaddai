<?php

require_once __DIR__ . '/../../config/Database.php';

class SupplierModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    private function normalizeText($value) {
        $text = trim((string)$value);
        return $text === '' ? null : $text;
    }

    private function normalizePhone($value) {
        $text = $this->normalizeText($value);
        if ($text === null) return null;
        $normalized = preg_replace('/\s+/', '', $text);
        return preg_replace('/[^0-9+\-()]/', '', $normalized);
    }

    private function ensureUniqueField($field, $value, $message, $excludeId = null) {
        if ($value === null || $value === '') return;

        $sql = "SELECT id FROM inventory_suppliers WHERE $field = :value";
        $params = [':value' => $value];
        if ($excludeId !== null) {
            $sql .= ' AND id <> :id';
            $params[':id'] = (int)$excludeId;
        }
        $sql .= ' LIMIT 1';

        $exists = $this->db->query($sql, $params);
        if (!empty($exists)) {
            throw new Exception($message);
        }
    }

    private function validateSupplierData($data, $excludeId = null) {
        $name = trim((string)($data['name'] ?? ''));
        if ($name === '' || mb_strlen($name) < 2) {
            throw new Exception('El nombre del proveedor debe tener al menos 2 caracteres.');
        }

        if (mb_strlen($name) > 255) {
            throw new Exception('El nombre del proveedor es demasiado largo.');
        }

        $taxId = $this->normalizeText($data['tax_id'] ?? null);
        if ($taxId !== null && !preg_match('/^[A-Za-z0-9\-]{5,20}$/', $taxId)) {
            throw new Exception('El RIF/Cédula tiene un formato inválido.');
        }

        $phone = $this->normalizePhone($data['phone'] ?? null);
        if ($phone !== null && !preg_match('/^[0-9+\-()]{7,20}$/', $phone)) {
            throw new Exception('El teléfono tiene un formato inválido.');
        }

        $email = $this->normalizeText($data['email'] ?? null);
        if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('El correo del proveedor no es válido.');
        }

        $this->ensureUniqueField('tax_id', $taxId, 'Ya existe un proveedor con ese RIF/Cédula.', $excludeId);
        $this->ensureUniqueField('phone', $phone, 'Ya existe un proveedor con ese teléfono.', $excludeId);
        $this->ensureUniqueField('email', $email, 'Ya existe un proveedor con ese correo.', $excludeId);
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
        $this->validateSupplierData($data);

        $taxId = $this->normalizeText($data['tax_id'] ?? null);
        $contactName = $this->normalizeText($data['contact_name'] ?? null);
        $phone = $this->normalizePhone($data['phone'] ?? null);
        $email = $this->normalizeText($data['email'] ?? null);
        $address = $this->normalizeText($data['address'] ?? null);

        $sql = 'INSERT INTO inventory_suppliers (name, tax_id, contact_name, phone, email, address, is_active)
                VALUES (:name, :tax_id, :contact_name, :phone, :email, :address, :is_active)';

        $params = [
            ':name' => trim((string)$data['name']),
            ':tax_id' => $taxId,
            ':contact_name' => $contactName,
            ':phone' => $phone,
            ':email' => $email,
            ':address' => $address,
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
        $this->validateSupplierData($data, (int)$id);

        $taxId = $this->normalizeText($data['tax_id'] ?? null);
        $contactName = $this->normalizeText($data['contact_name'] ?? null);
        $phone = $this->normalizePhone($data['phone'] ?? null);
        $email = $this->normalizeText($data['email'] ?? null);
        $address = $this->normalizeText($data['address'] ?? null);

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
            ':name' => trim((string)$data['name']),
            ':tax_id' => $taxId,
            ':contact_name' => $contactName,
            ':phone' => $phone,
            ':email' => $email,
            ':address' => $address,
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
