<?php
require_once __DIR__ . '/ReminderHistoryModel.php';

class ReminderHistoryController {
    private $model;

    public function __construct() {
        $this->model = new ReminderHistoryModel();
    }

    public function getHistory() {
        try {
            $history = $this->model->getAll();
            
            // Damos formato a la respuesta si es necesario, o enviamos directo
            echo json_encode($history);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener el historial',
                'message' => $e->getMessage()
            ]);
        }
    }
}
