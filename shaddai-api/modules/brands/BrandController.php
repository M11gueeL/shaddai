<?php
require_once __DIR__ . '/BrandModel.php';

class BrandController {
    private $model;

    public function __construct() {
        $this->model = new BrandModel();
    }

    public function list() {
        try {
            $onlyActive = isset($_GET['active']) && $_GET['active'] === 'true';
            echo json_encode($this->model->getAll($onlyActive));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            if (empty($data['name'])) {
                throw new Exception("El nombre es obligatorio");
            }

            $id = $this->model->create($data['name'], $data['description'] ?? '');
            http_response_code(201);
            echo json_encode(['id' => $id, 'message' => 'Marca creada']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            if (empty($data['name'])) {
                throw new Exception("El nombre es obligatorio");
            }

            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;

            $this->model->update($id, $data['name'], $data['description'] ?? '', $isActive);
            echo json_encode(['message' => 'Marca actualizada']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $this->model->delete($id);
            echo json_encode(['message' => 'Marca desactivada']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>
