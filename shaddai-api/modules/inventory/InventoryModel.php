<?php

require_once __DIR__ . '/../../config/Database.php';

class InventoryModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Lista de items con filtros opcionales
     * @param array $filters ['onlyActive'=>bool,'low_stock'=>bool,'search'=>string]
     */
    public function getAll($filters = []) {
        $sql = 'SELECT id, code, name, description, stock_quantity, unit_of_measure, reorder_level, price_usd, is_active, created_at, updated_at FROM inventory_items';
        $where = [];
        $params = [];
        if (!empty($filters['onlyActive'])) {
            $where[] = 'is_active = 1';
        }
        if (!empty($filters['low_stock'])) {
            $where[] = 'stock_quantity <= reorder_level';
        }
        if (!empty($filters['search'])) {
            $where[] = 'name LIKE :search';
            $params[':search'] = '%' . $filters['search'] . '%';
        }
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY name ASC';
        return $this->db->query($sql, $params);
    }

    public function getById($id) {
        $res = $this->db->query('SELECT * FROM inventory_items WHERE id = :id', [':id' => $id]);
        return $res[0] ?? null;
    }

    public function create($data) {
        $sql = 'INSERT INTO inventory_items (code, name, description, stock_quantity, unit_of_measure, reorder_level, price_usd, is_active) VALUES (:code, :name, :description, :stock_quantity, :unit_of_measure, :reorder_level, :price_usd, :is_active)';
        $params = [
            ':code' => $data['code'] ?? null,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':stock_quantity' => isset($data['stock_quantity']) ? (int)$data['stock_quantity'] : 0,
            ':unit_of_measure' => $data['unit_of_measure'] ?? 'unidad',
            ':reorder_level' => isset($data['reorder_level']) ? (int)$data['reorder_level'] : 5,
            ':price_usd' => $data['price_usd'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ];
        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $sql = 'UPDATE inventory_items SET code = :code, name = :name, description = :description, stock_quantity = :stock_quantity, unit_of_measure = :unit_of_measure, reorder_level = :reorder_level, price_usd = :price_usd, is_active = :is_active WHERE id = :id';
        $params = [
            ':code' => $data['code'] ?? null,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':stock_quantity' => isset($data['stock_quantity']) ? (int)$data['stock_quantity'] : 0,
            ':unit_of_measure' => $data['unit_of_measure'] ?? 'unidad',
            ':reorder_level' => isset($data['reorder_level']) ? (int)$data['reorder_level'] : 5,
            ':price_usd' => $data['price_usd'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':id' => $id
        ];
        return $this->db->execute($sql, $params);
    }

    /** Borrado lógico */
    public function delete($id) {
        return $this->db->execute('UPDATE inventory_items SET is_active = 0 WHERE id = :id', [':id' => $id]);
    }

    /**
     * Restock (abastecer) un item: suma stock y registra movimiento.
     * @param int $id Item ID
     * @param int $quantity Cantidad a agregar (>0)
     * @param int $userId Usuario que realiza el movimiento
     * @param string|null $notes Notas opcionales
     */
    public function restock($id, $quantity, $userId, $notes = null) {
        if ($quantity <= 0) throw new Exception('Quantity must be > 0');
        $item = $this->getById($id);
        if (!$item) throw new Exception('Item not found');
        if ((int)$item['is_active'] !== 1) throw new Exception('Item inactive');

        try {
            $this->db->beginTransaction();
            // Actualizar stock
            $newStock = (int)$item['stock_quantity'] + $quantity;
            $this->db->execute('UPDATE inventory_items SET stock_quantity = :stock WHERE id = :id', [':stock' => $newStock, ':id' => $id]);
            // Insertar movimiento
            $sql = 'INSERT INTO inventory_movements (item_id, movement_type, quantity, notes, created_by) VALUES (:item_id, :movement_type, :quantity, :notes, :created_by)';
            $this->db->execute($sql, [
                ':item_id' => $id,
                ':movement_type' => 'in_restock',
                ':quantity' => $quantity,
                ':notes' => $notes,
                ':created_by' => $userId
            ]);
            $this->db->commit();
            return $newStock;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /** Lista movimientos de un item */
    public function getMovementsByItem($id, $limit = 100) {
        $sql = 'SELECT id, movement_type, quantity, notes, created_by, created_at FROM inventory_movements WHERE item_id = :id ORDER BY id DESC LIMIT ' . (int)$limit;
        return $this->db->query($sql, [':id' => $id]);
    }
}

?>