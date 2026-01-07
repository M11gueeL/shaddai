<?php
require_once __DIR__ . '/../../config/Database.php';

class ReceiptModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function create($accountId, $paymentId, $issuedBy) {
        try {
            if (!$this->db->inTransaction()) {
                $this->db->beginTransaction();
            }

            // Usar la función helper para generar el siguiente número
            $conn = $this->db->getConnection();
            $newNumber = $this->generateNextReceiptNumber($conn);

            $sqlInsert = 'INSERT INTO payment_receipts (receipt_number, account_id, payment_id, issued_by, issued_at, status) VALUES (:n, :acc, :pay, :by, NOW(), "active")';
            $this->db->execute($sqlInsert, [':n'=>$newNumber, ':acc'=>$accountId, ':pay'=>$paymentId, ':by'=>$issuedBy]);
            
            $id = $this->db->lastInsertId();
            $this->db->commit();

            return ['id'=>$id, 'receipt_number'=>$newNumber];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Genera el próximo número de recibo consecutivo global.
     * Formato: AAAA-MM-XXXXXXX (7 dígitos)
     */
    private function generateNextReceiptNumber($pdo) {
        // 1. Consultar el último número con bloqueo FOR UPDATE
        $stmt = $pdo->query("SELECT receipt_number FROM payment_receipts ORDER BY id DESC LIMIT 1 FOR UPDATE");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $nextSequence = 1;

        if ($row && !empty($row['receipt_number'])) {
            // 2. Extraer la parte secuencial global (últimos 7 dígitos o todo lo después del último guion)
            // Formato esperado en DB: YYYY-MM-Sequence
            $parts = explode('-', $row['receipt_number']);
            $lastSequenceStr = end($parts);
            $lastSequence = (int)$lastSequenceStr;
            
            if ($lastSequence > 0) {
                $nextSequence = $lastSequence + 1;
            }
        }

        // 3. Formatear: AAAA-MM-XXXXXXX
        // El año y mes son los actuales, pero la secuencia CONTINÚA del anterior (global)
        $prefix = date('Y-m');
        $formattedSequence = str_pad((string)$nextSequence, 7, '0', STR_PAD_LEFT);
        
        return $prefix . '-' . $formattedSequence;
    }

    public function listByPatient($patientId) {
        $sql = 'SELECT r.*, ba.patient_id, ba.payer_patient_id FROM payment_receipts r INNER JOIN billing_accounts ba ON ba.id = r.account_id WHERE ba.patient_id = :p ORDER BY r.issued_at DESC';
        return $this->db->query($sql, [':p'=>$patientId]);
    }

    public function getLatestByAccount($accountId) {
        $sql = 'SELECT * FROM payment_receipts WHERE account_id = :acc AND status = "active" ORDER BY id DESC LIMIT 1';
        $res = $this->db->query($sql, [':acc'=>$accountId]);
        return $res[0] ?? null;
    }

    public function listAll($limit = 50, $offset = 0, $search = '', $status = '') {
        $conn = $this->db->getConnection();
        $sql = "SELECT r.*, 
                       ba.patient_id, 
                       p.full_name as patient_name,
                       u.first_name as issued_by_name
                FROM payment_receipts r 
                INNER JOIN billing_accounts ba ON ba.id = r.account_id 
                INNER JOIN patients p ON p.id = ba.patient_id
                LEFT JOIN users u ON u.id = r.issued_by
                WHERE 1=1";
        
        if ($search) {
            $sql .= " AND (r.receipt_number LIKE :search OR p.full_name LIKE :search)";
        }

        if ($status && in_array($status, ['active', 'annulled'])) {
            $sql .= " AND r.status = :status";
        }
        
        $sql .= " ORDER BY r.issued_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $conn->prepare($sql);
        
        if ($search) {
            $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
        }
        
        if ($status && in_array($status, ['active', 'annulled'])) {
            $stmt->bindValue(':status', $status, PDO::PARAM_STR);
        }
        
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>
