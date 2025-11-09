<?php

require_once __DIR__ . '/../../services/DatabaseExportService.php';

class DatabaseExportController {
    private $service;

    public function __construct() {
        $this->service = new DatabaseExportService();
    }

    public function exportDatabase(): void {
        try {
            $dump = $this->service->generateDump();
            $fileName = 'shaddai_backup_' . date('Ymd_His') . '.sql';

            header('Content-Type: application/sql; charset=UTF-8');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            header('Cache-Control: no-store, no-cache, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
            header('Content-Length: ' . strlen($dump));

            echo $dump;
            exit;
        } catch (\Throwable $exception) {
            http_response_code(500);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode([
                'error' => 'No se pudo generar la copia de seguridad',
                'message' => $exception->getMessage()
            ]);
            exit;
        }
    }
}
