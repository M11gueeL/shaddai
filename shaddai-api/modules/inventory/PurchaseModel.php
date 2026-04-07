<?php

require_once __DIR__ . '/../../config/Database.php';

class PurchaseModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll($filters = []) {
        $sql = 'SELECT p.id, p.supplier_id, s.name AS supplier_name, p.invoice_number, p.purchase_date,
                       p.total_amount, p.currency, p.status, p.notes, p.created_by, p.created_at
                FROM inventory_purchases p
                INNER JOIN inventory_suppliers s ON p.supplier_id = s.id';

        $where = [];
        $params = [];

        if (!empty($filters['supplier_id'])) {
            $where[] = 'p.supplier_id = :supplier_id';
            $params[':supplier_id'] = (int)$filters['supplier_id'];
        }

        if (!empty($filters['status'])) {
            $where[] = 'p.status = :status';
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['start_date'])) {
            $where[] = 'p.purchase_date >= :start_date';
            $params[':start_date'] = $filters['start_date'];
        }

        if (!empty($filters['end_date'])) {
            $where[] = 'p.purchase_date <= :end_date';
            $params[':end_date'] = $filters['end_date'];
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY p.purchase_date DESC, p.id DESC';

        return $this->db->query($sql, $params);
    }

    public function getById($id) {
        $res = $this->db->query(
            'SELECT p.id, p.supplier_id, s.name AS supplier_name, p.invoice_number, p.purchase_date,
                    p.total_amount, p.currency, p.status, p.notes, p.created_by, p.created_at
             FROM inventory_purchases p
             INNER JOIN inventory_suppliers s ON p.supplier_id = s.id
             WHERE p.id = :id',
            [':id' => $id]
        );

        return $res[0] ?? null;
    }

    public function create($data) {
        $sql = 'INSERT INTO inventory_purchases
                    (supplier_id, invoice_number, purchase_date, total_amount, currency, status, notes, created_by)
                VALUES
                    (:supplier_id, :invoice_number, :purchase_date, :total_amount, :currency, :status, :notes, :created_by)';

        $params = [
            ':supplier_id' => (int)$data['supplier_id'],
            ':invoice_number' => $data['invoice_number'] ?? null,
            ':purchase_date' => $data['purchase_date'],
            ':total_amount' => isset($data['total_amount']) ? (float)$data['total_amount'] : 0,
            ':currency' => $data['currency'] ?? 'USD',
            ':status' => $data['status'] ?? 'received',
            ':notes' => $data['notes'] ?? null,
            ':created_by' => (int)$data['created_by'],
        ];

        try {
            $this->db->execute($sql, $params);
            return (int)$this->db->lastInsertId();
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function update($id, $data) {
        $sql = 'UPDATE inventory_purchases
                SET supplier_id = :supplier_id,
                    invoice_number = :invoice_number,
                    purchase_date = :purchase_date,
                    total_amount = :total_amount,
                    currency = :currency,
                    status = :status,
                    notes = :notes
                WHERE id = :id';

        $params = [
            ':supplier_id' => (int)$data['supplier_id'],
            ':invoice_number' => $data['invoice_number'] ?? null,
            ':purchase_date' => $data['purchase_date'],
            ':total_amount' => isset($data['total_amount']) ? (float)$data['total_amount'] : 0,
            ':currency' => $data['currency'] ?? 'USD',
            ':status' => $data['status'] ?? 'received',
            ':notes' => $data['notes'] ?? null,
            ':id' => $id,
        ];

        try {
            return $this->db->execute($sql, $params);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function processPurchaseTransaction($purchaseData, $purchaseDetails, $userId) {
        if (empty($purchaseData) || empty($purchaseDetails) || !is_array($purchaseDetails)) {
            throw new Exception('Datos de compra incompletos: se requiere cabecera y detalle de compra.');
        }

        try {
            $this->db->beginTransaction();

            // 1) Insert purchase header
            $purchaseSql = 'INSERT INTO inventory_purchases
                                (supplier_id, invoice_number, purchase_date, total_amount, currency, status, notes, created_by)
                            VALUES
                                (:supplier_id, :invoice_number, :purchase_date, :total_amount, :currency, :status, :notes, :created_by)';

            $purchaseParams = [
                ':supplier_id' => (int)$purchaseData['supplier_id'],
                ':invoice_number' => $purchaseData['invoice_number'] ?? null,
                ':purchase_date' => $purchaseData['purchase_date'],
                ':total_amount' => isset($purchaseData['total_amount']) ? (float)$purchaseData['total_amount'] : 0,
                ':currency' => $purchaseData['currency'] ?? 'USD',
                ':status' => $purchaseData['status'] ?? 'received',
                ':notes' => $purchaseData['notes'] ?? null,
                ':created_by' => (int)$userId,
            ];

            $this->db->execute($purchaseSql, $purchaseParams);
            $newPurchaseId = (int)$this->db->lastInsertId();

            // Prepared statements payload for detail loop
            $detailSql = 'INSERT INTO inventory_purchase_details (purchase_id, item_id, quantity, unit_cost, subtotal)
                          VALUES (:purchase_id, :item_id, :quantity, :unit_cost, :subtotal)';

            $batchSql = 'INSERT INTO inventory_batches
                            (item_id, purchase_id, batch_number, quantity, initial_quantity, expiration_date, status)
                         VALUES
                            (:item_id, :purchase_id, :batch_number, :quantity, :initial_quantity, :expiration_date, :status)';

            $updateStockSql = 'UPDATE inventory_items
                               SET stock_quantity = stock_quantity + :qty
                               WHERE id = :item_id';

            $movementSql = 'INSERT INTO inventory_movements
                                (item_id, movement_type, quantity, notes, created_by, batch_id)
                            VALUES
                                (:item_id, :movement_type, :quantity, :notes, :created_by, :batch_id)';

            // 2) Iterate details
            foreach ($purchaseDetails as $idx => $detail) {
                $line = $idx + 1;

                if (empty($detail['item_id'])) {
                    throw new Exception("Detalle #$line inválido: item_id es obligatorio.");
                }

                $qty = isset($detail['quantity']) ? (int)$detail['quantity'] : 0;
                if ($qty <= 0) {
                    throw new Exception("Detalle #$line inválido: quantity debe ser mayor a 0.");
                }

                $unitCost = isset($detail['unit_cost']) ? (float)$detail['unit_cost'] : 0;
                if ($unitCost < 0) {
                    throw new Exception("Detalle #$line inválido: unit_cost no puede ser negativo.");
                }

                $subtotal = isset($detail['subtotal']) ? (float)$detail['subtotal'] : ($qty * $unitCost);

                // 2a) Insert purchase detail
                $this->db->execute($detailSql, [
                    ':purchase_id' => $newPurchaseId,
                    ':item_id' => (int)$detail['item_id'],
                    ':quantity' => $qty,
                    ':unit_cost' => $unitCost,
                    ':subtotal' => $subtotal,
                ]);

                // 2b) Insert batch for purchased stock
                $this->db->execute($batchSql, [
                    ':item_id' => (int)$detail['item_id'],
                    ':purchase_id' => $newPurchaseId,
                    ':batch_number' => $detail['batch_number'] ?? null,
                    ':quantity' => $qty,
                    ':initial_quantity' => $qty,
                    ':expiration_date' => $detail['expiration_date'] ?? null,
                    ':status' => 'active',
                ]);

                $newBatchId = (int)$this->db->lastInsertId();

                // 2c) Update total stock in item
                $updated = $this->db->execute($updateStockSql, [
                    ':qty' => $qty,
                    ':item_id' => (int)$detail['item_id'],
                ]);

                if (!$updated) {
                    throw new Exception("No se pudo actualizar stock del item_id {$detail['item_id']} (detalle #$line).");
                }

                // 2d) Register inventory movement
                $invoiceRef = $purchaseData['invoice_number'] ?? ('COMPRA-' . $newPurchaseId);
                $note = 'Ingreso por compra #' . $newPurchaseId . ' (Factura: ' . $invoiceRef . ')';

                $this->db->execute($movementSql, [
                    ':item_id' => (int)$detail['item_id'],
                    ':movement_type' => 'in_purchase',
                    ':quantity' => $qty,
                    ':notes' => $note,
                    ':created_by' => (int)$userId,
                    ':batch_id' => $newBatchId,
                ]);
            }

            $this->db->commit();

            return [
                'purchase_id' => $newPurchaseId,
                'processed_items' => count($purchaseDetails)
            ];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw new Exception('Error al procesar abastecimiento: ' . $e->getMessage(), 0, $e);
        }
    }
}
