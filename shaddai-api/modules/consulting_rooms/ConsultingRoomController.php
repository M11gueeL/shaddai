<?php
require_once __DIR__ . '/ConsultingRoomModel.php';

class ConsultingRoomController {
    private $model;

    public function __construct() {
        $this->model = new ConsultingRoomModel();
    }

    public function getAll() {
        try {
            $rooms = $this->model->getAll();
            echo json_encode(['success' => true, 'data' => $rooms]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener consultorios: ' . $e->getMessage()]);
        }
    }

    public function getById($id) {
        try {
            $room = $this->model->getById($id);
            if ($room) {
                echo json_encode(['success' => true, 'data' => $room]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Consultorio no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener el consultorio: ' . $e->getMessage()]);
        }
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El nombre es obligatorio']);
            return;
        }

        try {
            $id = $this->model->create($data);
            echo json_encode(['success' => true, 'message' => 'Consultorio creado exitosamente', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al crear consultorio: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $this->model->update($id, $data);
            echo json_encode(['success' => true, 'message' => 'Consultorio actualizado exitosamente']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar consultorio: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            if ($this->model->delete($id)) {
                echo json_encode(['success' => true, 'message' => 'Consultorio eliminado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'No se pudo eliminar el consultorio']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al eliminar: ' . $e->getMessage()]);
        }
    }

    public function getBySpecialty($specialtyId) {
        try {
            $rooms = $this->model->getAvailableRoomsBySpecialty($specialtyId);
            echo json_encode(['success' => true, 'data' => $rooms]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al buscar consultorios por especialidad: ' . $e->getMessage()]);
        }
    }
}
