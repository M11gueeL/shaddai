<?php

require_once __DIR__ . '/../../config/Database.php';

class InventoryModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // desarrolla un metodo que obtenga de las tablas relacionadas al inventory los siguientes tres datos: total de items, total de stock bajo (dinmicamente segun el reorder_level) y total de valor de inventario (sumando stock_quantity * price_usd) de forma general osea todos los items
    public function getInventoryStats() {
        $sql = 'SELECT 
                    (SELECT COUNT(*) FROM inventory_items WHERE is_deleted = 0) AS total_items,
                    (SELECT COUNT(*) FROM inventory_items WHERE stock_quantity <= reorder_level AND is_deleted = 0) AS low_stock_count,
                    (SELECT SUM(stock_quantity * price_usd) FROM inventory_items WHERE is_deleted = 0) AS total_value
                ';
        $result = $this->db->query($sql);
        return $result ? $result[0] : ['total_items' => 0, 'low_stock_count' => 0, 'total_value' => 0];
    }

    public function getConsumptionAnalysisData($startDate, $endDate) {
        // Agrupamos por insumo y sumamos las cantidades según el tipo de movimiento
        // Nota: Usamos el precio actual (price_usd) para estimar el costo/valor, 
        // ya que el sistema no maneja histórico de costos por ahora.
        
        $sql = "SELECT 
                    i.code,
                    i.name as item_name,
                    i.unit_of_measure,
                    i.price_usd as unit_value,
                    
                    -- Sumar salidas facturadas
                    SUM(CASE WHEN m.movement_type = 'out_billed' THEN m.quantity ELSE 0 END) as billed_qty,
                    
                    -- Calcular dinero generado (Aprox)
                    (SUM(CASE WHEN m.movement_type = 'out_billed' THEN m.quantity ELSE 0 END) * i.price_usd) as billed_amount,
                    
                    -- Sumar salidas por uso interno
                    SUM(CASE WHEN m.movement_type = 'out_internal_use' THEN m.quantity ELSE 0 END) as internal_qty,
                    
                    -- Calcular costo operativo (Aprox - Dinero que no entró)
                    (SUM(CASE WHEN m.movement_type = 'out_internal_use' THEN m.quantity ELSE 0 END) * i.price_usd) as internal_cost_amount

                FROM inventory_movements m
                JOIN inventory_items i ON m.item_id = i.id
                WHERE DATE(m.created_at) BETWEEN :start AND :end
                GROUP BY i.id, i.name, i.price_usd
                
                -- Solo mostrar items que tuvieron movimiento
                HAVING billed_qty > 0 OR internal_qty > 0
                ORDER BY billed_amount DESC";

        return $this->db->query($sql, [
            ':start' => $startDate,
            ':end' => $endDate
        ]);
    }

    public function getAll($filters = []) {
        $sql = 'SELECT i.id, i.code, i.name, i.description, i.stock_quantity, i.unit_of_measure, i.reorder_level, i.price_usd, i.is_active, i.created_at, i.updated_at, i.brand_id,
                b.name as brand_name,
                (SELECT MIN(expiration_date) FROM inventory_batches WHERE item_id = i.id AND quantity > 0) as next_expiration
                FROM inventory_items i
                LEFT JOIN inventory_brands b ON i.brand_id = b.id';
        
        $where = ['i.is_deleted = 0'];
        $params = [];

        // Filtro general de búsqueda (Search Bar)
        if (!empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            // Usamos parámetros únicos para cada ocurrencia porque PDO::ATTR_EMULATE_PREPARES está en false
            $where[] = '(i.name LIKE :search_name OR i.code LIKE :search_code OR b.name LIKE :search_brand)';
            $params[':search_name'] = $term;
            $params[':search_code'] = $term;
            $params[':search_brand'] = $term;
        }

        // Filtros Avanzados
        if (!empty($filters['name'])) {
            $where[] = 'i.name LIKE :filter_name';
            $params[':filter_name'] = '%' . $filters['name'] . '%';
        }
        if (!empty($filters['code'])) {
            $where[] = 'i.code LIKE :filter_code';
            $params[':filter_code'] = '%' . $filters['code'] . '%';
        }
        if (!empty($filters['brand_id'])) {
            $where[] = 'i.brand_id = :filter_brand';
            $params[':filter_brand'] = $filters['brand_id'];
        }
        
        // Filtro de Estado
        if (isset($filters['status']) && $filters['status'] !== '') {
            if ($filters['status'] === 'active') {
                $where[] = 'i.is_active = 1';
            } elseif ($filters['status'] === 'inactive') {
                $where[] = 'i.is_active = 0';
            }
        } elseif (!empty($filters['onlyActive'])) {
            // Comportamiento por defecto si no se especifica status explícito
            $where[] = 'i.is_active = 1';
        }

        // Filtro de Precio
        if (!empty($filters['min_price'])) {
            $where[] = 'i.price_usd >= :min_price';
            $params[':min_price'] = $filters['min_price'];
        }
        if (!empty($filters['max_price'])) {
            $where[] = 'i.price_usd <= :max_price';
            $params[':max_price'] = $filters['max_price'];
        }

        if (!empty($filters['low_stock'])) {
            $where[] = 'i.stock_quantity <= i.reorder_level';
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        
        $sql .= ' ORDER BY i.name ASC';
        return $this->db->query($sql, $params);
    }

    public function getById($id) {
        $res = $this->db->query('SELECT i.*, b.name as brand_name FROM inventory_items i LEFT JOIN inventory_brands b ON i.brand_id = b.id WHERE i.id = :id', [':id' => $id]);
        return $res[0] ?? null;
    }

    public function create($data, $userId = null) {
        $sql = 'INSERT INTO inventory_items (code, name, description, stock_quantity, unit_of_measure, reorder_level, price_usd, is_active, brand_id) 
                VALUES (:code, :name, :description, :stock_quantity, :unit_of_measure, :reorder_level, :price_usd, :is_active, :brand_id)';
        
        $params = [
            ':code' => $data['code'] ?? null,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':stock_quantity' => isset($data['stock_quantity']) ? (int)$data['stock_quantity'] : 0,
            ':unit_of_measure' => $data['unit_of_measure'] ?? 'unidad',
            ':reorder_level' => isset($data['reorder_level']) ? (int)$data['reorder_level'] : 5,
            ':price_usd' => $data['price_usd'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':brand_id' => !empty($data['brand_id']) ? (int)$data['brand_id'] : null,
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
        $sql = 'UPDATE inventory_items SET code = :code, name = :name, description = :description, unit_of_measure = :unit_of_measure, reorder_level = :reorder_level, price_usd = :price_usd, is_active = :is_active, brand_id = :brand_id WHERE id = :id';
        
        $params = [
            ':code' => $data['code'] ?? null,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':unit_of_measure' => $data['unit_of_measure'] ?? 'unidad',
            ':reorder_level' => isset($data['reorder_level']) ? (int)$data['reorder_level'] : 5,
            ':price_usd' => $data['price_usd'],
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':brand_id' => !empty($data['brand_id']) ? (int)$data['brand_id'] : null,
            ':id' => $id
        ];

        return $this->db->execute($sql, $params);
    }

    public function delete($id) {
        return $this->db->execute('UPDATE inventory_items SET is_deleted = 1, is_active = 0 WHERE id = :id', [':id' => $id]);
    }

    public function getBatchesByItemId($itemId) {
        return $this->db->query(
            "SELECT * FROM inventory_batches WHERE item_id = :id ORDER BY expiration_date ASC, created_at ASC",
            [':id' => $itemId]
        );
    }

    public function discardBatch($batchId, $quantity, $reason, $userId) {
        return $this->discardFromBatch($batchId, $quantity, $userId, $reason);
    }

    public function registerInflow($id, $quantity, $userId, $movementType = 'in_restock', $notes = null) {
        // Por defecto sin fecha de vencimiento si es un ajuste rápido
        return $this->restock($id, $quantity, $userId, null, 'AJUSTE-IN', $notes);
    }

    private function syncItemStats($itemId) {
        // Calcula total solo de lotes ACTIVOS (excluye suspendidos, disposed, etc)
        $resSum = $this->db->query("SELECT SUM(quantity) as total FROM inventory_batches WHERE item_id = :id AND status = 'active'", [':id' => $itemId]);
        $total = $resSum[0]['total'] ?? 0;

        // Ya no actualizamos expiration_date en inventory_items porque se eliminó la columna
        $this->db->execute("UPDATE inventory_items SET stock_quantity = :qty WHERE id = :id", [
            ':qty' => $total,
            ':id' => $itemId
        ]);
    }

    public function getMovementsByItem($id, $limit = 100) {
        $sql = 'SELECT id, movement_type, quantity, notes, created_by, created_at FROM inventory_movements WHERE item_id = :id ORDER BY id DESC LIMIT ' . (int)$limit;
        return $this->db->query($sql, [':id' => $id]);
    }

    public function getExpiring($days = null) {
        // Consulta a inventory_batches para obtener los lotes que vencen
        $sql = "SELECT i.id, i.code, i.name, b.quantity, b.expiration_date, b.batch_number, i.unit_of_measure, i.price_usd 
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

    /**
     * RESTOCK: Crea lote con cantidad inicial y actual sincronizadas
     */
    public function restock($id, $quantity, $userId, $expirationDate, $batchNumber = null, $notes = null) {
        try {
            $this->db->beginTransaction();

            // 1. Insertar Lote con initial_quantity
            $sqlBatch = 'INSERT INTO inventory_batches (item_id, batch_number, quantity, initial_quantity, expiration_date, status) 
                         VALUES (:item_id, :batch_number, :quantity, :initial_quantity, :expiration_date, "active")';
            
            $this->db->execute($sqlBatch, [
                ':item_id' => $id,
                ':batch_number' => $batchNumber,
                ':quantity' => $quantity,
                ':initial_quantity' => $quantity,
                ':expiration_date' => $expirationDate
            ]);
            
            $batchId = $this->db->lastInsertId();

            // 2. Registrar Movimiento vinculado al Lote
            $this->recordMovement($id, 'in_restock', $quantity, $userId, "Entrada Lote: $batchNumber", $batchId);

            $this->syncItemStats($id);
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * CONSUMO FEFO: 
     * Si pides 10 pastillas y hay 2 lotes (uno con 3 y otro con 50),
     * crea DOS movimientos en el historial para trazabilidad exacta.
     */
    public function registerOutflow($id, $quantity, $userId, $movementType = 'out_billed', $notes = null) {
        $startedTransaction = false;
        if (!$this->db->inTransaction()) {
            $this->db->beginTransaction();
            $startedTransaction = true;
        }
        try {
            $remaining = $quantity;
            
            // Traer lotes activos ordenados por fecha (FEFO)
            $batches = $this->db->query("SELECT * FROM inventory_batches WHERE item_id = :id AND quantity > 0 AND status = 'active' ORDER BY expiration_date ASC FOR UPDATE", [':id' => $id]);

            if (empty($batches)) {
                 // Fallback si no hay lotes (integridad)
                 throw new Exception("No hay lotes disponibles para este producto.");
            }

            foreach ($batches as $batch) {
                if ($remaining <= 0) break;

                $deduct = min($remaining, $batch['quantity']);
                
                // 1. Actualizar el lote específico
                $newQty = $batch['quantity'] - $deduct;
                $newStatus = ($newQty == 0) ? 'empty' : 'active';

                $this->db->execute("UPDATE inventory_batches SET quantity = :qty, status = :status WHERE id = :id", [
                    ':qty' => $newQty, 
                    ':status' => $newStatus,
                    ':id' => $batch['id']
                ]);

                // 2. Registrar movimiento POR CADA LOTE afectado (Trazabilidad Pura)
                $batchNote = $notes . " (Del Lote: " . ($batch['batch_number'] ?? 'S/N') . ")";
                $this->recordMovement($id, $movementType, $deduct, $userId, $batchNote, $batch['id']);

                $remaining -= $deduct;
            }

            if ($remaining > 0) {
                throw new Exception("Stock insuficiente en lotes activos. Faltan $remaining unidades.");
            }

            $this->syncItemStats($id);
            if ($startedTransaction) {
                $this->db->commit();
            }
            return true;
        } catch (Exception $e) {
            if ($startedTransaction) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * DAR DE BAJA LOTE (Vencimiento, Daño, etc)
     * Aquí marcas explícitamente que el lote murió por vencimiento.
     */
    public function discardFromBatch($batchId, $quantity, $userId, $reason = 'Vencimiento') {
        try {
            $this->db->beginTransaction();

            $batchRes = $this->db->query("SELECT * FROM inventory_batches WHERE id = :id", [':id' => $batchId]);
            if (empty($batchRes)) throw new Exception("Lote no encontrado");
            $batch = $batchRes[0];

            if ($batch['quantity'] < $quantity) {
                throw new Exception("Cantidad inválida.");
            }

            // 1. Restar stock
            $newQty = $batch['quantity'] - $quantity;
            
            // Si la cantidad llega a 0 por descarte, el estado es 'disposed' (o 'empty' si prefieres, pero disposed es mas claro)
            // Si queda stock pero ya decidimos no usarlo más, podríamos forzar el estado, pero asumamos gestión por cantidad.
            $status = ($newQty === 0) ? 'disposed' : 'active';

            $this->db->execute("UPDATE inventory_batches SET quantity = :qty, status = :st WHERE id = :id", [
                ':qty' => $newQty, 
                ':st' => $status,
                ':id' => $batchId
            ]);

            // 2. Movimiento TIPO 'out_expired'
            $itemId = $batch['item_id'];
            $this->recordMovement(
                $itemId, 
                'out_expired', 
                $quantity, 
                $userId, 
                "BAJA MANUAL Lote: {$batch['batch_number']}. Razón: $reason",
                $batchId
            );

            $this->syncItemStats($itemId);
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * AJUSTAR LOTE (Corrección de inventario +/-)
     */
    public function adjustBatchQuantity($batchId, $quantityChange, $userId, $reason, $type = 'correction') {
        try {
            $this->db->beginTransaction();

            $batchRes = $this->db->query("SELECT * FROM inventory_batches WHERE id = :id", [':id' => $batchId]);
            if (empty($batchRes)) throw new Exception("Lote no encontrado");
            $batch = $batchRes[0];

            $newQty = $batch['quantity'] + $quantityChange;

            if ($newQty < 0) {
                throw new Exception("El ajuste resulta en una cantidad negativa.");
            }

            // Si es una corrección y la nueva cantidad supera la inicial registrada, actualizamos la inicial
            // para evitar porcentajes > 100% (asumiendo que fue un error de ingreso inicial)
            if ($type === 'correction' && $newQty > $batch['initial_quantity']) {
                $this->db->execute("UPDATE inventory_batches SET initial_quantity = :iq WHERE id = :id", [
                    ':iq' => $newQty,
                    ':id' => $batchId
                ]);
            }

            // Determinar estado
            $status = ($newQty === 0) ? 'empty' : 'active';
            // Si es una baja explícita (discard), usamos 'disposed' si llega a 0
            if ($type === 'discard' && $newQty === 0) $status = 'disposed';

            $this->db->execute("UPDATE inventory_batches SET quantity = :qty, status = :st WHERE id = :id", [
                ':qty' => $newQty, 
                ':st' => $status,
                ':id' => $batchId
            ]);

            // Determinar tipo de movimiento
            // Asegurar que quantityChange sea numérico
            $qtyChange = (float)$quantityChange;
            
            // Si quantityChange es positivo, es una entrada (in_adjustment). Si es negativo, salida (out_adjustment).
            $movementType = ($qtyChange >= 0) ? 'in_adjustment' : 'out_adjustment';
            
            if ($type === 'discard') $movementType = 'out_expired'; // O out_damaged

            $absQty = abs($qtyChange);
            $itemId = $batch['item_id'];
            
            // Debug: Añadir tipo de movimiento a la nota si es necesario, o confiar en la lógica
            $noteText = "AJUSTE Lote: {$batch['batch_number']}. Razón: $reason";
            
            $this->recordMovement(
                $itemId, 
                $movementType, 
                $absQty, 
                $userId, 
                $noteText,
                $batchId
            );

            $this->syncItemStats($itemId);
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function toggleBatchStatus($batchId, $status, $userId) {
        // Validar status permitido
        if (!in_array($status, ['active', 'suspended'])) {
            throw new Exception("Estado inválido");
        }
        
        // Solo permitimos cambiar entre active y suspended si quantity > 0
        // Si quantity es 0, el estado debe ser empty o disposed, no suspended/active
        $batchRes = $this->db->query("SELECT * FROM inventory_batches WHERE id = :id", [':id' => $batchId]);
        if (empty($batchRes)) throw new Exception("Lote no encontrado");
        $batch = $batchRes[0];

        if ($batch['quantity'] <= 0) {
            throw new Exception("No se puede cambiar el estado de un lote vacío o agotado.");
        }

        $this->db->execute("UPDATE inventory_batches SET status = :status WHERE id = :id", [
            ':status' => $status,
            ':id' => $batchId
        ]);

        // Registrar movimiento interno para mantener consistencia en Kardex
        // Si se suspende (active -> suspended), es una SALIDA de stock disponible
        // Si se activa (suspended -> active), es una ENTRADA de stock disponible
        if ($status === 'suspended' && $batch['status'] === 'active') {
            $this->recordMovement(
                $batch['item_id'], 
                'out_adjustment', 
                $batch['quantity'], 
                $userId, 
                "Lote suspendido/desactivado: " . $batch['batch_number'], 
                $batchId
            );
        } elseif ($status === 'active' && $batch['status'] !== 'active') {
            $this->recordMovement(
                $batch['item_id'], 
                'in_adjustment', 
                $batch['quantity'], 
                $userId, 
                "Lote reactivado: " . $batch['batch_number'], 
                $batchId
            );
        }

        // Recalcular stock total del item (para que reste/sume si se suspende/activa)
        $this->syncItemStats($batch['item_id']);
        
        return true;
    }

    // Helper actualizado para recibir batch_id
    private function recordMovement($itemId, $movementType, $quantity, $userId, $notes = null, $batchId = null) {
        $sql = 'INSERT INTO inventory_movements (item_id, movement_type, quantity, notes, created_by, batch_id) 
                VALUES (:item_id, :movement_type, :quantity, :notes, :created_by, :batch_id)';
        $this->db->execute($sql, [
            ':item_id' => $itemId,
            ':movement_type' => $movementType,
            ':quantity' => $quantity,
            ':notes' => $notes,
            ':created_by' => $userId,
            ':batch_id' => $batchId
        ]);
    }

    public function getExpirationRiskData() {
        $sql = 'SELECT 
                    i.name as item_name,
                    ib.batch_number,
                    ib.quantity as remaining_quantity,
                    ib.expiration_date,
                    DATEDIFF(ib.expiration_date, CURDATE()) as days_remaining
                FROM inventory_batches ib
                JOIN inventory_items i ON ib.item_id = i.id
                WHERE ib.quantity > 0
                ORDER BY ib.expiration_date ASC';
        
        return $this->db->query($sql);
    }

    public function getMovementKardexData($startDate, $endDate, $itemId = null) {
        // Si se selecciona un item específico, calculamos el saldo histórico
        if ($itemId) {
            // 1. Obtener stock actual
            $itemRes = $this->db->query("SELECT stock_quantity FROM inventory_items WHERE id = :id", [':id' => $itemId]);
            $currentStock = $itemRes[0]['stock_quantity'] ?? 0;

            // 2. Obtener TODOS los movimientos ordenados por fecha DESC (del más reciente al más antiguo)
            // No filtramos por fecha aún para poder calcular el saldo
            $sql = 'SELECT 
                        im.created_at,
                        CONCAT(u.first_name, " ", u.last_name) as user_name,
                        im.movement_type,
                        im.quantity as quantity_moved,
                        im.notes,
                        i.name as item_name,
                        i.code as item_code
                    FROM inventory_movements im
                    JOIN inventory_items i ON im.item_id = i.id
                    LEFT JOIN users u ON im.created_by = u.id
                    WHERE im.item_id = :item_id
                    ORDER BY im.created_at DESC, im.id DESC';
            
            $allMovements = $this->db->query($sql, [':item_id' => $itemId]);

            // 3. Calcular saldos (Working Backwards)
            // El saldo después del movimiento N es el saldo actual (si es el último)
            // Saldo Antes de Mov N = Saldo Despues - (+Cantidad)  [Si fue entrada]
            // Saldo Antes de Mov N = Saldo Despues - (-Cantidad)  [Si fue salida]
            
            $runningBalance = $currentStock;
            $processedData = [];

            foreach ($allMovements as $mov) {
                // Determinar si el movimiento SUMÓ o RESTÓ al stock
                // Tipos de entrada: in_restock, in_adjustment
                // Tipos de salida: out_adjustment, out_expired, out_damaged, out_internal_use, out_billed
                
                $isEntry = strpos($mov['movement_type'], 'in_') === 0;
                $qty = $mov['quantity_moved'];
                
                // El saldo que mostramos en la fila es el saldo RESULTANTE de ese movimiento
                $balanceAfter = $runningBalance;
                
                // Calcular el saldo ANTERIOR a este movimiento para la siguiente iteración (hacia atrás)
                if ($isEntry) {
                    // Si fue entrada, antes había MENOS
                    $runningBalance -= $qty;
                } else {
                    // Si fue salida, antes había MÁS
                    $runningBalance += $qty;
                }

                // Verificar si entra en el rango de fechas solicitado
                $movDate = date('Y-m-d', strtotime($mov['created_at']));
                if ($movDate >= $startDate && $movDate <= $endDate) {
                    $mov['balance'] = $balanceAfter;
                    $processedData[] = $mov;
                }
            }

            return $processedData;

        } else {
            // Comportamiento original para reporte general (sin saldo)
            $sql = 'SELECT 
                        im.created_at,
                        CONCAT(u.first_name, " ", u.last_name) as user_name,
                        im.movement_type,
                        im.quantity as quantity_moved,
                        im.notes,
                        i.name as item_name,
                        i.code as item_code
                    FROM inventory_movements im
                    JOIN inventory_items i ON im.item_id = i.id
                    LEFT JOIN users u ON im.created_by = u.id
                    WHERE DATE(im.created_at) BETWEEN :start_date AND :end_date
                    ORDER BY im.created_at DESC';
            
            return $this->db->query($sql, [
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);
        }
    }

    public function getPurchaseSuggestionData() {
        // Seleccionar items donde stock <= reorder_level
        // Asumiremos Nivel Óptimo = reorder_level * 2 por defecto.
        
        $sql = 'SELECT 
                    code,
                    name as item_name,
                    stock_quantity,
                    reorder_level,
                    (reorder_level * 2 - stock_quantity) as deficit
                FROM inventory_items
                WHERE stock_quantity <= reorder_level
                AND is_active = 1
                ORDER BY deficit DESC';
        
        return $this->db->query($sql);
    }

    public function getLeaksAndAdjustmentsData($startDate, $endDate) {
        $sql = 'SELECT 
                    im.created_at,
                    CONCAT(u.first_name, " ", u.last_name) as user_name,
                    im.movement_type,
                    im.quantity as quantity_adjusted,
                    im.notes,
                    i.name as item_name,
                    i.code as item_code
                FROM inventory_movements im
                JOIN inventory_items i ON im.item_id = i.id
                LEFT JOIN users u ON im.created_by = u.id
                WHERE DATE(im.created_at) BETWEEN :start_date AND :end_date
                AND im.movement_type IN ("in_adjustment", "out_adjustment")
                ORDER BY im.created_at DESC';
        
        return $this->db->query($sql, [
            ':start_date' => $startDate,
            ':end_date' => $endDate
        ]);
    }

    public function getUserNameById($id) {
        $sql = 'SELECT CONCAT(first_name, " ", last_name) as name FROM users WHERE id = :id';
        $res = $this->db->query($sql, [':id' => $id]);
        return $res[0] ?? null;
    }

    public function getDeadStockData($cutoffDate) {
        // Items con stock > 0 que no han tenido salidas (out_%) desde la fecha de corte
        // O que nunca han tenido salidas
        $sql = "SELECT 
                    i.code, 
                    i.name as item_name, 
                    b.batch_number, 
                    b.quantity as batch_quantity,
                    i.price_usd as unit_cost,
                    (b.quantity * i.price_usd) as immobilized_value,
                    MAX(m.created_at) as last_outflow_date,
                    DATEDIFF(NOW(), MAX(m.created_at)) as days_stagnant
                FROM inventory_items i
                JOIN inventory_batches b ON i.id = b.item_id
                LEFT JOIN inventory_movements m ON i.id = m.item_id AND m.batch_id = b.id AND m.movement_type LIKE 'out_%'
                WHERE i.is_deleted = 0 AND b.quantity > 0
                GROUP BY i.id, b.id
                HAVING last_outflow_date < :cutoff_date OR last_outflow_date IS NULL
                ORDER BY days_stagnant DESC";
        
        return $this->db->query($sql, [':cutoff_date' => $cutoffDate . ' 23:59:59']);
    }

    public function getInventoryValuationData() {
        $sql = "SELECT 
                    i.code,
                    i.name as item_name,
                    b.batch_number,
                    b.quantity as batch_quantity,
                    i.price_usd as unit_cost,
                    (b.quantity * i.price_usd) as total_value,
                    b.expiration_date
                FROM inventory_batches b
                JOIN inventory_items i ON b.item_id = i.id
                WHERE b.quantity > 0 AND i.is_deleted = 0
                ORDER BY i.name ASC, b.expiration_date ASC";
        
        return $this->db->query($sql);
    }
}
?>