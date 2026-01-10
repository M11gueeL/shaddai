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

    /**
     * Reporte completo y detallado de ingresos (SQL Potente)
     */
    public function getComprehensiveReport($startDate, $endDate) {
        $start = $startDate . ' 00:00:00';
        $end = $endDate . ' 23:59:59';
        $params = [':start' => $start, ':end' => $end];

        // 1. RESUMEN FINANCIERO (TOTALES)
        // Agrupamos por método y moneda para saber exactamente cuánto entró de cada cosa
        $sqlTotals = "SELECT payment_method, currency, 
                             SUM(amount) as total_amount, 
                             SUM(amount_usd_equivalent) as total_usd_equivalent,
                             COUNT(id) as transaction_count
                      FROM payments 
                      WHERE payment_date BETWEEN :start AND :end 
                      AND status IN ('verified', 'approved')
                      AND deleted_at IS NULL
                      GROUP BY payment_method, currency";
        $totalsRaw = $this->db->query($sqlTotals, $params);

        // Procesar totales para visualización fácil
        $summary = [
            'usd_cash'     => 0, // Efectivo Divisa
            'bs_cash'      => 0, // Efectivo Bolívares
            'bs_transfer'  => 0, // Transferencias BS
            'bs_mobile'    => 0, // Pago Móvil
            // 'zelle'        => 0, // Zelle (Removed as requested)
            'other_usd'    => 0, // Tarjetas internacionales, services, etc
            'total_global_usd_eq' => 0 // Suma de TODO convertido a USD
        ];

        foreach ($totalsRaw as $row) {
            $summary['total_global_usd_eq'] += $row['total_usd_equivalent'];
            
            $method = strtolower($row['payment_method']);
            $currency = strtoupper($row['currency']);
            $amt = (float)$row['total_amount'];

            // Match methods exactly as they appear in DB or by pattern
            if ($method === 'cash_usd' || ($method === 'cash' && $currency === 'USD')) {
                $summary['usd_cash'] += $amt;
            }
            elseif ($method === 'cash_bs' || ($method === 'cash' && $currency === 'BS')) {
                $summary['bs_cash'] += $amt;
            }
            elseif (strpos($method, 'transfer') !== false && $currency === 'BS') {
                $summary['bs_transfer'] += $amt;
            }
            elseif (strpos($method, 'mobile') !== false && $currency === 'BS') {
                $summary['bs_mobile'] += $amt;
            }
            // Zelle removed
            elseif ($currency === 'USD') {
                $summary['other_usd'] += $amt;
            }
        }

        // 2. LISTA DETALLADA DE TRANSACCIONES (EL "TODO")
        // Aquí traemos cada pago, quien lo hizo, referencia, estatus y paciente
        $sqlEntries = "SELECT p.id, p.payment_date, p.payment_method, p.amount, p.currency, 
                              p.amount_usd_equivalent, p.reference_number, p.status, p.notes,
                              ba.id as account_id, 
                              pat.full_name as patient_name,
                              payer.full_name as payer_name,
                              u.first_name as registered_by_name,
                              p.attachment_path
                       FROM payments p
                       INNER JOIN billing_accounts ba ON p.account_id = ba.id
                       INNER JOIN patients pat ON ba.patient_id = pat.id
                       LEFT JOIN patients payer ON ba.payer_patient_id = payer.id
                       LEFT JOIN users u ON p.registered_by = u.id
                       WHERE p.payment_date BETWEEN :start AND :end
                       AND p.deleted_at IS NULL
                       ORDER BY p.payment_date DESC, p.id DESC";
        $entries = $this->db->query($sqlEntries, $params);

        // Filtrar arrays específicos para el reporte
        $electronicPayments = array_filter($entries, function($e) {
            return in_array($e['payment_method'], ['transfer_bs', 'mobile_payment_bs', 'zelle', 'transfer_usd']);
        });

        // 3. RECIBOS (Generados y Anulados)
        $sqlReceipts = "SELECT r.id, r.receipt_number, r.issued_at, r.status, 
                               pat.full_name as patient_name,
                               u.first_name as issued_by_name,
                               r.account_id
                        FROM payment_receipts r
                        INNER JOIN billing_accounts ba ON r.account_id = ba.id
                        INNER JOIN patients pat ON ba.patient_id = pat.id
                        LEFT JOIN users u ON r.issued_by = u.id
                        WHERE r.issued_at BETWEEN :start AND :end
                        ORDER BY r.issued_at DESC";
        $receipts = $this->db->query($sqlReceipts, $params);

        $annulledReceipts = array_filter($receipts, function($r) { return $r['status'] === 'annulled'; });

        // 4. CUENTAS (Aperturadas o Pagadas en el rango)
        // Para consistencia visual, mostramos cuentas creadas en el rango
        $sqlAccounts = "SELECT ba.id, ba.created_at, ba.status, ba.total_usd,
                               pat.full_name as patient_name,
                               payer.full_name as payer_name,
                               u.first_name as created_by_name
                        FROM billing_accounts ba
                        INNER JOIN patients pat ON ba.patient_id = pat.id
                        LEFT JOIN patients payer ON ba.payer_patient_id = payer.id
                        LEFT JOIN users u ON ba.created_by = u.id
                        WHERE ba.created_at BETWEEN :start AND :end
                        ORDER BY ba.created_at DESC";
        $accounts = $this->db->query($sqlAccounts, $params);

        return [
            'meta' => [
                'startDate' => $startDate, 
                'endDate' => $endDate,
                'generatedAt' => date('Y-m-d H:i:s')
            ],
            'summary' => $summary,
            'details' => [
                'raw_totals' => $totalsRaw, // Por si el front quiere hacer sus propias gráficas
                'all_movements' => $entries, // La lista gigante (para tabla principal)
                'electronic_payments' => array_values($electronicPayments), // Para auditoría rápida de bancos
                'receipts' => $receipts,
                'annulled_receipts' => array_values($annulledReceipts), // Importante para seguridad
                'new_accounts' => $accounts
            ]
        ];
    }

    public function getDebtorsReport() {
        $sql = "SELECT ba.id, ba.created_at, ba.status, ba.total_usd,
                       p.full_name as patient_name,
                       p.cedula as patient_cedula,
                       p.phone as patient_phone,
                       COALESCE(u.first_name, 'Sistema') as created_by_name,
                       
                       (SELECT COALESCE(SUM(pay.amount_usd_equivalent), 0) 
                        FROM payments pay 
                        WHERE pay.account_id = ba.id 
                        AND pay.status IN ('verified', 'approved') 
                        AND pay.deleted_at IS NULL) as paid_usd

                FROM billing_accounts ba
                INNER JOIN patients p ON ba.patient_id = p.id
                LEFT JOIN users u ON ba.created_by = u.id
                
                WHERE ba.status NOT IN ('closed', 'annulled', 'paid') 
                AND ba.total_usd > 0
                
                HAVING total_usd > paid_usd
                ORDER BY ba.created_at ASC";
        
        return $this->db->query($sql);
    }

    public function getServicesPerformanceStats($startDate, $endDate) {
        $start = $startDate . ' 00:00:00';
        $end = $endDate . ' 23:59:59';
        
        $sql = "SELECT 
                    s.name as service_name,
                    SUM(bad.quantity) as total_quantity,
                    SUM(bad.quantity * bad.price_usd) as total_usd_generated,
                    COUNT(DISTINCT bad.account_id) as total_accounts
                FROM billing_account_details bad
                JOIN billing_accounts ba ON bad.account_id = ba.id
                JOIN services s ON bad.service_id = s.id
                WHERE ba.created_at BETWEEN :start AND :end
                AND ba.status != 'annulled'
                GROUP BY s.id, s.name
                ORDER BY total_quantity DESC";

        return $this->db->query($sql, [':start' => $start, ':end' => $end]);
    }

    public function getUserNameById($userId) {
        $sql = "SELECT first_name, last_name FROM users WHERE id = :id";
        $result = $this->db->query($sql, [':id' => $userId]);
        return isset($result[0]) ? $result[0]['first_name'] . ' ' . $result[0]['last_name'] : null;
    }
}

