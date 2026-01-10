<?php
require_once __DIR__ . '/../../config/Database.php';

class PaymentReportModel {
    private $db;
    public function __construct() { $this->db = Database::getInstance(); }

    public function getRangeStats($startDate, $endDate) {
        $start = $startDate . ' 00:00:00';
        $end = $endDate . ' 23:59:59';
        
        $params = [':start' => $start, ':end' => $end];

        // 1. Total Income (Sum of verified payments in USD equivalent)
        // We look at payments table for confirmed income.
        $sqlIncome = "SELECT SUM(amount_usd_equivalent) as total 
                      FROM payments 
                      WHERE payment_date BETWEEN :start AND :end 
                      AND status IN ('verified', 'approved') 
                      AND deleted_at IS NULL";
        
        // Use payment_date (date type usually) for filtering.
        // If payment_date is DATE, then BETWEEN 'Y-m-d 00:00:00' works as 'Y-m-d' compare.
        // Let's rely on standard SQL behavior.
        
        $income = $this->db->query($sqlIncome, [':start' => $startDate, ':end' => $endDate]);
        $totalIncome = $income[0]['total'] ?? 0;

        // 2. Created Receipts count
        // Assuming payment_receipts table exists as inferred from ReceiptModel
        $sqlReceipts = "SELECT COUNT(*) as total FROM payment_receipts WHERE issued_at BETWEEN :start AND :end AND status = 'active'";
        $receipts = $this->db->query($sqlReceipts, $params);
        $totalReceipts = $receipts[0]['total'] ?? 0;

        // 3. Created Accounts count
        $sqlAccounts = "SELECT COUNT(*) as total FROM billing_accounts WHERE created_at BETWEEN :start AND :end";
        $accounts = $this->db->query($sqlAccounts, $params);
        $totalAccounts = $accounts[0]['total'] ?? 0;
        
        // 4. Total Received Transactions (transfers and mobile payments)
        $sqlTransactions = "SELECT COUNT(*) as total 
                            FROM payments 
                            WHERE payment_date BETWEEN :start AND :end 
                            AND status IN ('verified', 'approved')
                            AND payment_method IN ('transfer_bs', 'mobile_payment_bs')
                            AND deleted_at IS NULL";
        // Note: Using payment_date for consistency with income
        $transactions = $this->db->query($sqlTransactions, [':start' => $startDate, ':end' => $endDate]);
        $totalTransactions = $transactions[0]['total'] ?? 0;

        return [
            'total_income' => (float)$totalIncome,
            'total_receipts' => (int)$totalReceipts,
            'total_accounts' => (int)$totalAccounts,
            'total_transactions' => (int)$totalTransactions
        ];
    }
}
