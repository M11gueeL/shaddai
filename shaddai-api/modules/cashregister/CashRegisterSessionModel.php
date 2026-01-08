<?php
require_once __DIR__ . '/../../config/Database.php';

class CashRegisterSessionModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function findOpenByUser($userId) {
        $res = $this->db->query('SELECT * FROM cash_register_sessions WHERE user_id = :u AND status = "open" ORDER BY id DESC LIMIT 1', [':u'=>$userId]);
        return $res[0] ?? null;
    }

    public function open($userId, $usd, $bs) {
        $sql = 'INSERT INTO cash_register_sessions (user_id, start_time, start_balance_usd, start_balance_bs, status) VALUES (:u, NOW(), :usd, :bs, "open")';
        $this->db->execute($sql, [':u'=>$userId, ':usd'=>$usd, ':bs'=>$bs]);
        return $this->db->lastInsertId();
    }

    public function close($sessionId, $calcUsd, $realUsd, $calcBs, $realBs, $notes = null) {
        $sql = 'UPDATE cash_register_sessions SET end_time = NOW(), calculated_end_balance_usd = :cUsd, real_end_balance_usd = :rUsd, calculated_end_balance_bs = :cBs, real_end_balance_bs = :rBs, notes = :notes, status = "closed" WHERE id = :id';
        return $this->db->execute($sql, [
            ':cUsd'=>$calcUsd, ':rUsd'=>$realUsd, ':cBs'=>$calcBs, ':rBs'=>$realBs, ':notes'=>$notes, ':id'=>$sessionId
        ]);
    }

    public function listAll($userId = null, $status = null) {
        $where = [];$params=[];
        if ($userId) { $where[]='s.user_id = :u'; $params[':u']=$userId; }
        if ($status) { $where[]='s.status = :st'; $params[':st']=$status; }
        $sql = 'SELECT s.*, u.first_name, u.last_name FROM cash_register_sessions s INNER JOIN users u ON u.id = s.user_id';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY s.start_time DESC';
        return $this->db->query($sql, $params);
    }

    public function getFullDetails($sessionId) {
        // 1. Session Info
        $session = $this->db->query("
            SELECT s.*, u.first_name, u.last_name 
            FROM cash_register_sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = :id", 
            [':id' => $sessionId]
        )[0] ?? null;

        if (!$session) return null;

        $endTime = $session['end_time'] ?? date('Y-m-d H:i:s');

        // 2. Movements (Cash Registry)
        $cashMovements = $this->db->query("
            SELECT m.*, p.payment_method, p.reference_number
            FROM cash_register_movements m
            LEFT JOIN payments p ON m.payment_id = p.id
            WHERE m.session_id = :id
            ORDER BY m.created_at DESC
        ", [':id' => $sessionId]);

        // 2b. Non-Cash Payments (Transfers/Mobile/Zelle) in this Timeframe/User
        // These are not in cash_register_movements but belong to the session report
        $nonCashPayments = $this->db->query("
            SELECT 
                0 as id, 
                :sid as session_id, 
                id as payment_id, 
                'payment_in' as movement_type, 
                amount, 
                currency, 
                created_at, 
                registered_by as created_by, 
                notes as description,
                payment_method, 
                reference_number
            FROM payments
            WHERE registered_by = :uid
              AND created_at >= :start AND created_at <= :end
              AND payment_method NOT IN ('cash_usd', 'cash_bs')
              AND deleted_at IS NULL
            ORDER BY created_at DESC
        ", [
            ':sid' => $sessionId,
            ':uid' => $session['user_id'],
            ':start' => $session['start_time'],
            ':end' => $endTime
        ]);

        // Merge and Sort
        $movements = array_merge($cashMovements, $nonCashPayments);
        
        // Sort by created_at DESC
        usort($movements, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // 3. Opened Accounts (Created by this user in this timeframe)
        $openedAccounts = $this->db->query("
            SELECT ba.id, ba.created_at, ba.total_usd, ba.total_bs, ba.status, p.full_name, 
                   (SELECT COUNT(*) FROM billing_account_details WHERE account_id = ba.id) as items_count
            FROM billing_accounts ba
            JOIN patients p ON ba.patient_id = p.id
            WHERE ba.created_by = :uid
              AND ba.created_at >= :start AND ba.created_at <= :end
            ORDER BY ba.created_at DESC
        ", [
            ':uid' => $session['user_id'], 
            ':start' => $session['start_time'], 
            ':end' => $endTime
        ]);

        // 4. Cancelled Accounts (Updated to cancelled in this timeframe)
        $cancelledAccounts = $this->db->query("
            SELECT ba.id, ba.updated_at as cancelled_at, ba.total_usd, ba.total_bs, p.full_name
            FROM billing_accounts ba
            JOIN patients p ON ba.patient_id = p.id
            WHERE ba.status = 'cancelled'
              AND ba.updated_at >= :start AND ba.updated_at <= :end
            ORDER BY ba.updated_at DESC
        ", [':start' => $session['start_time'], ':end' => $endTime]);

        // 5. Aggregated Metrics (Calculated here for ease of use)
        // Group by Payment Method and Currency
        $metrics = [
             'USD' => ['cash' => 0, 'zelle' => 0, 'other' => 0],
             'BS' => ['cash' => 0, 'mobile_payment' => 0, 'transfer' => 0, 'card' => 0]
        ];
        
        // This can be done via SQL or Loop. Loop is fine for session scale (usually < 100 txns)
        foreach($movements as $m) {
            if($m['movement_type'] !== 'payment_in') continue; // Only count income
            
            $amt = (float)$m['amount'];
            $method = $m['payment_method'] ?? 'cash'; // Default if null (e.g. manual entry without payment link)
            
            // Normalize method names if needed, or just map exactly
            // enum: 'cash_usd','cash_bs','transfer_bs','mobile_payment_bs'
            
            if ($m['currency'] === 'USD') {
                 if(strpos($method, 'cash') !== false) $metrics['USD']['cash'] += $amt;
                 else if(strpos($method, 'zelle') !== false) $metrics['USD']['zelle'] += $amt;
                 else $metrics['USD']['other'] += $amt;
            } else {
                 if(strpos($method, 'cash') !== false) $metrics['BS']['cash'] += $amt;
                 else if(strpos($method, 'mobile') !== false) $metrics['BS']['mobile_payment'] += $amt;
                 else if(strpos($method, 'transfer') !== false) $metrics['BS']['transfer'] += $amt;
                 else $metrics['BS']['card'] += $amt;
            }
        }

        return [
            'session' => $session,
            'movements' => $movements,
            'metrics' => $metrics,
            'opened_accounts' => $openedAccounts,
            'cancelled_accounts' => $cancelledAccounts
        ];
    }
}
?>
