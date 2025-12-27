<?php

require_once __DIR__ . '/../../config/Database.php';

class InventoryModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

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

    public function create($data, $userId = null) {
        $sql = 'INSERT INTO inventory_items (code, name, description, stock_quantity, unit_of_measure, reorder_level, price_usd, is_active) 
                VALUES (:code, :name, :description, :stock_quantity, :unit_of_measure, :reorder_level, :price_usd, :is_active)';
        
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

        try {
            $this->db->beginTransaction();
            $this->db->execute($sql, $params);
            $id = (int)$this->db->lastInsertId();
            $this->db->commit();
            return $id;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function update($id, $data, $userId = null) {
        $sql = 'UPDATE inventory_items SET code = :code, name = :name, description = :description, unit_of_measure = :unit_of_measure, reorder_level = :reorder_level, price_usd = :price_usd, is_active = :is_active WHERE id = :id';
        
        $params = [
            ':code' => $data['code'] ?? null,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':unit_of_measure' => $data['unit_of_measure'] ?? 'unidad',
            ':reorder_level' => isset($data['reorder_level']) ? (int)$data['reorder_level'] : 5,
            ':price_usd' => $data['price_usd'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':id' => $id
        ];

        return $this->db->execute($sql, $params);
    }

    public function delete($id) {
        return $this->db->execute('UPDATE inventory_items SET is_active = 0 WHERE id = :id', [':id' => $id]);
    }

    /**
     * NUEVO RESTOCK: Crea un lote y actualiza el padre.
     */
    public function restock($id, $quantity, $userId, $expirationDate, $batchNumber = null, $notes = null) {
        if ($quantity <= 0) throw new Exception('La cantidad debe ser mayor a 0');
        
        try {
            $this->db->beginTransaction();

            // 1. Insertar el Lote
            $sqlBatch = 'INSERT INTO inventory_batches (item_id, batch_number, quantity, expiration_date) VALUES (:item_id, :batch_number, :quantity, :expiration_date)';
            $this->db->execute($sqlBatch, [
                ':item_id' => $id,
                ':batch_number' => $batchNumber,
                ':quantity' => $quantity,
                ':expiration_date' => !empty($expirationDate) ? $expirationDate : null // Allow NULL
            ]);

            // 2. Registrar Movimiento (Historial)
            $expText = !empty($expirationDate) ? "Vence: $expirationDate." : "Sin vencimiento.";
            $this->recordMovement($id, 'in_restock', $quantity, $userId, "Lote: $batchNumber. $expText $notes");

            // 3. Sincronizar Stock Total y Próximo Vencimiento en la tabla items
            $this->syncItemStats($id);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * CONSUMO INTELIGENTE (FEFO): Descuenta de los lotes más viejos.
     */
    public function registerOutflow($id, $quantity, $userId, $movementType = 'out_billed', $notes = null) {
        if ($quantity <= 0) throw new Exception('Quantity must be > 0');
        
        $item = $this->getById($id);
        if (!$item || (int)$item['stock_quantity'] < $quantity) {
            throw new Exception("Stock insuficiente. Disponible: " . ($item['stock_quantity'] ?? 0));
        }

        try {
            $inTransaction = $this->db->inTransaction(); 
            if (!$inTransaction) $this->db->beginTransaction();

            $remaining = $quantity;

            // 1. Obtener lotes con stock positivo ordenados por fecha de vencimiento (ASC)
            // Prioriza los que vencen antes (FEFO) o los más viejos si no hay fecha (NULL last)
            $batches = $this->db->query("SELECT * FROM inventory_batches WHERE item_id = :id AND quantity > 0 ORDER BY expiration_date ASC FOR UPDATE", [':id' => $id]);

            foreach ($batches as $batch) {
                if ($remaining <= 0) break;

                $deduct = min($remaining, $batch['quantity']);
                
                // Actualizar lote
                $this->db->execute("UPDATE inventory_batches SET quantity = quantity - :deduct WHERE id = :bid", [
                    ':deduct' => $deduct, 
                    ':bid' => $batch['id']
                ]);

                $remaining -= $deduct;
            }

            if ($remaining > 0) {
                // Si llegamos aquí y falta stock, es que inventory_items tenía un número incorrecto (desincronizado).
                // Forzamos el ajuste.
                throw new Exception("Error de integridad de stock en lotes.");
            }

            // 2. Registrar el movimiento global
            $this->recordMovement($id, $movementType, $quantity, $userId, $notes);

            // 3. Recalcular totales en el item padre
            $this->syncItemStats($id);

            if (!$inTransaction) $this->db->commit();
            return true;
        } catch (Exception $e) {
            if (isset($inTransaction) && !$inTransaction) $this->db->rollBack();
            throw $e;
        }
    }

    public function registerInflow($id, $quantity, $userId, $movementType = 'in_restock', $notes = null) {
        // Por defecto sin fecha de vencimiento si es un ajuste rápido
        return $this->restock($id, $quantity, $userId, null, 'AJUSTE-IN', $notes);
    }

    private function syncItemStats($itemId) {
        // Calcula total
        $resSum = $this->db->query("SELECT SUM(quantity) as total FROM inventory_batches WHERE item_id = :id", [':id' => $itemId]);
        $total = $resSum[0]['total'] ?? 0;

        // Ya no actualizamos expiration_date en inventory_items porque se eliminó la columna
        $this->db->execute("UPDATE inventory_items SET stock_quantity = :qty WHERE id = :id", [
            ':qty' => $total,
            ':id' => $itemId
        ]);
    }

    private function recordMovement($itemId, $movementType, $quantity, $userId, $notes = null) {
        $sql = 'INSERT INTO inventory_movements (item_id, movement_type, quantity, notes, created_by) VALUES (:item_id, :movement_type, :quantity, :notes, :created_by)';
        $this->db->execute($sql, [
            ':item_id' => $itemId,
            ':movement_type' => $movementType,
            ':quantity' => $quantity,
            ':notes' => $notes,
            ':created_by' => $userId
        ]);
    }

    public function getMovementsByItem($id, $limit = 100) {
        $sql = 'SELECT id, movement_type, quantity, notes, created_by, created_at FROM inventory_movements WHERE item_id = :id ORDER BY id DESC LIMIT ' . (int)$limit;
        return $this->db->query($sql, [':id' => $id]);
    }

    public function getExpiring($days = null) {
        // Consulta a inventory_batches para obtener los lotes que vencen
        $sql = "SELECT i.id, i.code, i.name, b.quantity, b.expiration_date, i.unit_of_measure, i.price_usd 
                FROM inventory_batches b
                JOIN inventory_items i ON b.item_id = i.id
                WHERE i.is_active = 1 
                AND b.quantity > 0
                AND b.expiration_date IS NOT NULL ";
        $params = [];
        if ($days !== null) {
            $sql .= "AND b.expiration_date <= DATE_ADD(CURDATE(), INTERVAL :days DAY) ";
            $params[':days'] = (int)$days;
        }
        $sql .= "ORDER BY b.expiration_date ASC";
        return $this->db->query($sql, $params);
    }
}
?>