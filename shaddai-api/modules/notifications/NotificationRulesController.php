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
        http_response_code(403); // Forbidden
        echo json_encode(['error' => 'No se permite crear nuevas reglas. Utilice las predefinidas.']);
    }

    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Solo procesamos is_active de manera segura
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 0;
            
            $updateData = ['is_active' => $isActive];
            $success = $this->model->update($id, $updateData);

            if ($success) {
                echo json_encode(['message' => 'Estado actualizado correctamente']);
            } else {
                echo json_encode(['message' => 'No hubo cambios']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        http_response_code(403);
        echo json_encode(['error' => 'No se permite eliminar reglas predefinidas.']);
    }
}
