<?php
require_once __DIR__ . '/ServiceModel.php';

class ServiceController {
    private $model;

    public function __construct() {
        $this->model = new ServiceModel();
    }

    public function list() {
        try {
            $onlyActive = !isset($_GET['all']) || $_GET['all'] != '1';
            echo json_encode($this->model->getAll($onlyActive));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function get($id) {
        try {
            $s = $this->model->getById($id);
            if ($s) echo json_encode($s); else { http_response_code(404); echo json_encode(['error'=>'Service not found']); }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');

            $data = $_POST;
            if (empty($data['name']) || !isset($data['price_usd'])) {
                http_response_code(400);
                echo json_encode(['error' => 'name and price_usd are required']);
                return;
            }
            $data['created_by'] = $payload->sub;
            $id = $this->model->create($data);
            http_response_code(201);
            echo json_encode(['id' => (int)$id]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = $_POST;
            if (empty($data['name']) || !isset($data['price_usd'])) {
                http_response_code(400);
                echo json_encode(['error' => 'name and price_usd are required']);
                return;
            }
            $ok = $this->model->update($id, $data);
            echo json_encode(['updated' => (bool)$ok]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $ok = $this->model->delete($id);
            echo json_encode(['deleted' => (bool)$ok]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>
