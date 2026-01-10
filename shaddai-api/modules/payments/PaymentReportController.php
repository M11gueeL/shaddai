<?php
require_once __DIR__ . '/PaymentReportModel.php';

class PaymentReportController {
    private $model;

    public function __construct() {
        $this->model = new PaymentReportModel();
    }

    public function getStats() {
        $startDate = $_GET['startDate'] ?? date('Y-m-d');
        $endDate = $_GET['endDate'] ?? date('Y-m-d');

        // Simple validation
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
            http_response_code(400); 
            echo json_encode(['error' => 'Invalid date format. Use YYYY-MM-DD']);
            return;
        }

        try {
            $stats = $this->model->getRangeStats($startDate, $endDate);
            echo json_encode($stats);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
