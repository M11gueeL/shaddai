<?php

require_once __DIR__ . '/../../config/Database.php';

class PurchaseDetailModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll($purchaseId = null) {
        $sql = 'SELECT d.id, d.purchase_id, d.item_id, i.code AS item_code, i.name AS item_name,
                       d.quantity, d.unit_cost, d.subtotal
                FROM inventory_purchase_details d
                INNER JOIN inventory_items i ON d.item_id = i.id';

        $params = [];
        if ($purchaseId !== null) {
            $sql .= ' WHERE d.purchase_id = :purchase_id';
            $params[':purchase_id'] = (int)$purchaseId;
        }

        $sql .= ' ORDER BY d.id ASC';

        return $this->db->query($sql, $params);
    }

    public function getById($id) {
        $res = $this->db->query(
            'SELECT d.id, d.purchase_id, d.item_id, i.code AS item_code, i.name AS item_name,
                    d.quantity, d.unit_cost, d.subtotal
             FROM inventory_purchase_details d
             INNER JOIN inventory_items i ON d.item_id = i.id
             WHERE d.id = :id',
            [':id' => $id]
        );

        return $res[0] ?? null;
    }

    public function create($data) {
        $sql = 'INSERT INTO inventory_purchase_details (purchase_id, item_id, quantity, unit_cost, subtotal)
                VALUES (:purchase_id, :item_id, :quantity, :unit_cost, :subtotal)';

        $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 0;
        $unitCost = isset($data['unit_cost']) ? (float)$data['unit_cost'] : 0;

        $params = [
            ':purchase_id' => (int)$data['purchase_id'],
            ':item_id' => (int)$data['item_id'],
            ':quantity' => $quantity,
            ':unit_cost' => $unitCost,
            ':subtotal' => isset($data['subtotal']) ? (float)$data['subtotal'] : ($quantity * $unitCost),
        ];

        try {
            $this->db->execute($sql, $params);
            return (int)$this->db->lastInsertId();
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function update($id, $data) {
        $sql = 'UPDATE inventory_purchase_details
                SET purchase_id = :purchase_id,
                    item_id = :item_id,
                    quantity = :quantity,
                    unit_cost = :unit_cost,
                    subtotal = :subtotal
                WHERE id = :id';

        $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 0;
        $unitCost = isset($data['unit_cost']) ? (float)$data['unit_cost'] : 0;

        $params = [
            ':purchase_id' => (int)$data['purchase_id'],
            ':item_id' => (int)$data['item_id'],
            ':quantity' => $quantity,
            ':unit_cost' => $unitCost,
            ':subtotal' => isset($data['subtotal']) ? (float)$data['subtotal'] : ($quantity * $unitCost),
            ':id' => $id,
        ];

        try {
            return $this->db->execute($sql, $params);
        } catch (Exception $e) {
            throw $e;
        }
    }
}
