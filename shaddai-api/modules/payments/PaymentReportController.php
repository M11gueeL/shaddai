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

    public function getGeneralReport() {
        $startDate = $_GET['startDate'] ?? date('Y-m-d');
        $endDate = $_GET['endDate'] ?? date('Y-m-d');

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
            http_response_code(400); 
            echo json_encode(['error' => 'Formato de fecha inválido. Use YYYY-MM-DD']);
            return;
        }

        try {
            // Usamos el reporte comprensivo nuevo
            $report = $this->model->getComprehensiveReport($startDate, $endDate);
            echo json_encode($report);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function downloadGeneralReportPdf() {
        $startDate = $_GET['startDate'] ?? date('Y-m-d');
        $endDate = $_GET['endDate'] ?? date('Y-m-d');

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
            http_response_code(400); 
            echo json_encode(['error' => 'Formato de fecha inválido.']);
            return;
        }

        try {
            require_once __DIR__ . '/../../services/ReportGeneratorService.php';
            $generator = new ReportGeneratorService();
            $data = $this->model->getComprehensiveReport($startDate, $endDate);
            
            // Extract user name from token if available (standard practice in this codebase)
            $generatedBy = 'Administrador';
            if (isset($_REQUEST['jwt_payload'])) {
               // Assuming user info is in payload or we can fetch it. For now generic.
               $generatedBy = 'Usuario Sistema';
            }

            $filename = 'Reporte_General_Ingresos_' . str_replace('-', '', $startDate) . '_' . str_replace('-', '', $endDate);
            $generator->generateGeneralIncomePdf($data, $startDate, $endDate, $filename, $generatedBy);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
