<?php

require_once __DIR__ . '/../../config/Database.php';

class PurchaseModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    private function isValidDateYmd($value) {
        if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return false;
        }

        $parts = explode('-', $value);
        return checkdate((int)$parts[1], (int)$parts[2], (int)$parts[0]);
    }

    private function validatePurchaseHeader($purchaseData) {
        $supplierId = (int)($purchaseData['supplier_id'] ?? 0);
        if ($supplierId <= 0) {
            throw new Exception('Proveedor inválido.');
        }

        $supplier = $this->db->query('SELECT id, is_active FROM inventory_suppliers WHERE id = :id LIMIT 1', [':id' => $supplierId]);
        if (empty($supplier)) {
            throw new Exception('El proveedor seleccionado no existe.');
        }

        if ((int)$supplier[0]['is_active'] !== 1) {
            throw new Exception('No se puede registrar una compra con un proveedor inactivo.');
        }

        $purchaseDate = (string)($purchaseData['purchase_date'] ?? '');
        if (!$this->isValidDateYmd($purchaseDate)) {
            throw new Exception('La fecha de compra no tiene un formato válido.');
        }

        if (strtotime($purchaseDate) > strtotime(date('Y-m-d'))) {
            throw new Exception('La fecha de compra no puede estar en el futuro.');
        }

        $invoice = trim((string)($purchaseData['invoice_number'] ?? ''));
        if ($invoice !== '' && !preg_match('/^[A-Za-z0-9\-_.\/]{3,100}$/', $invoice)) {
            throw new Exception('El número de factura contiene caracteres no permitidos.');
        }

        if ($invoice !== '') {
            $existingInvoice = $this->db->query(
                'SELECT id FROM inventory_purchases WHERE supplier_id = :supplier_id AND invoice_number = :invoice_number AND status = "received" LIMIT 1',
                [
                    ':supplier_id' => $supplierId,
                    ':invoice_number' => $invoice
                ]
            );

            if (!empty($existingInvoice)) {
                throw new Exception('Ya existe una compra activa con ese número de factura para este proveedor.');
            }
        }

        $currency = strtoupper((string)($purchaseData['currency'] ?? 'USD'));
        if (!in_array($currency, ['USD', 'BS'], true)) {
            throw new Exception('La moneda seleccionada no es válida.');
        }
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

    public function getPurchaseDetails($id) {
        $purchase = $this->getById((int)$id);
        if (!$purchase) {
            return null;
        }

        $details = $this->db->query(
            'SELECT d.id, d.purchase_id, d.item_id, i.code AS item_code, i.name AS item_name,
                    d.quantity, d.unit_cost, d.subtotal
             FROM inventory_purchase_details d
             INNER JOIN inventory_items i ON i.id = d.item_id
             WHERE d.purchase_id = :purchase_id
             ORDER BY d.id ASC',
            [':purchase_id' => (int)$id]
        );

        $batches = $this->db->query(
            'SELECT b.id, b.purchase_id, b.item_id, i.name AS item_name, b.batch_number,
                    b.quantity, COALESCE(b.initial_quantity, b.quantity) AS initial_quantity,
                    b.expiration_date, b.status
             FROM inventory_batches b
             INNER JOIN inventory_items i ON i.id = b.item_id
             WHERE b.purchase_id = :purchase_id
             ORDER BY b.expiration_date ASC, b.id ASC',
            [':purchase_id' => (int)$id]
        );

        return [
            'purchase' => $purchase,
            'details' => $details,
            'batches' => $batches
        ];
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

        $this->validatePurchaseHeader($purchaseData);

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

                if ($qty > 1000000) {
                    throw new Exception("Detalle #$line inválido: cantidad demasiado alta.");
                }

                $unitCost = isset($detail['unit_cost']) ? (float)$detail['unit_cost'] : 0;
                if ($unitCost < 0) {
                    throw new Exception("Detalle #$line inválido: unit_cost no puede ser negativo.");
                }

                if ($unitCost > 100000000) {
                    throw new Exception("Detalle #$line inválido: costo unitario fuera de rango.");
                }

                $batchNumber = trim((string)($detail['batch_number'] ?? ''));
                if ($batchNumber === '') {
                    throw new Exception("Detalle #$line inválido: batch_number es obligatorio.");
                }

                if (!preg_match('/^[A-Za-z0-9._\/-]{2,50}$/', $batchNumber)) {
                    throw new Exception("Detalle #$line inválido: formato de batch_number no permitido.");
                }

                $expiration = (string)($detail['expiration_date'] ?? '');
                if (!$this->isValidDateYmd($expiration)) {
                    throw new Exception("Detalle #$line inválido: expiration_date tiene formato inválido.");
                }

                if (strtotime($expiration) < strtotime($purchaseData['purchase_date'])) {
                    throw new Exception("Detalle #$line inválido: el vencimiento no puede ser menor a la fecha de compra.");
                }

                $existingBatch = $this->db->query(
                    'SELECT id FROM inventory_batches WHERE item_id = :item_id AND batch_number = :batch_number AND status IN ("active", "suspended") LIMIT 1',
                    [
                        ':item_id' => (int)$detail['item_id'],
                        ':batch_number' => $batchNumber
                    ]
                );

                if (!empty($existingBatch)) {
                    throw new Exception("Detalle #$line inválido: ya existe un lote activo con ese número para el producto.");
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
                    ':batch_number' => $batchNumber,
                    ':quantity' => $qty,
                    ':initial_quantity' => $qty,
                    ':expiration_date' => $expiration,
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
