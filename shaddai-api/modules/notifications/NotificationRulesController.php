<?php
require_once __DIR__ . '/NotificationRulesModel.php';

class NotificationRulesController {
    private $model;

    public function __construct() {
        $this->model = new NotificationRulesModel();
    }

    public function list() {
        try {
            $result = $this->model->getAll();
            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['name']) || !isset($data['minutes_before'])) {
                throw new Exception("Nombre y minutos de antelación son obligatorios");
            }

            if (!is_numeric($data['minutes_before']) || $data['minutes_before'] <= 0) {
                throw new Exception("Los minutos de antelación deben ser un número positivo");
            }

            $id = $this->model->create($data);
            
            http_response_code(201);
            echo json_encode(['id' => $id, 'message' => 'Regla de notificación creada']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['minutes_before']) && (!is_numeric($data['minutes_before']) || $data['minutes_before'] <= 0)) {
                throw new Exception("Los minutos de antelación deben ser un número positivo");
            }

            $success = $this->model->update($id, $data);

            if ($success) {
                echo json_encode(['message' => 'Regla actualizada correctamente']);
            } else {
                echo json_encode(['message' => 'No hubo cambios']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $this->model->delete($id);
            echo json_encode(['message' => 'Regla eliminada']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
