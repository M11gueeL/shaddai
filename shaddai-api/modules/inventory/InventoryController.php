<?php
require_once __DIR__ . '/InventoryModel.php';

class InventoryController {
    private $model;

    public function __construct() {
        $this->model = new InventoryModel();
    }

    public function list() {
        try {
            $filters = [
                'onlyActive' => !isset($_GET['all']) || $_GET['all'] != '1',
                'low_stock' => isset($_GET['low_stock']) && $_GET['low_stock'] == '1',
                'search' => $_GET['search'] ?? null
            ];
            echo json_encode($this->model->getAll($filters));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function get($id) {
        try {
            $item = $this->model->getById($id);
            if ($item) echo json_encode($item); else { http_response_code(404); echo json_encode(['error' => 'Item not found']); }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub ?? null;

            $data = $_POST;
            if (empty($data['name']) || !isset($data['price_usd'])) {
                http_response_code(400);
                echo json_encode(['error' => 'name and price_usd are required']);
                return;
            }
            $id = $this->model->create($data, $userId);
            http_response_code(201);
            echo json_encode(['id' => (int)$id]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub ?? null;

            $data = $_POST;
            if (empty($data['name']) || !isset($data['price_usd'])) {
                http_response_code(400);
                echo json_encode(['error' => 'name and price_usd are required']);
                return;
            }
            $ok = $this->model->update($id, $data, $userId);
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

    public function restock($id) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;

            $quantity = isset($_POST['quantity']) ? (int)$_POST['quantity'] : 0;
            $notes = $_POST['notes'] ?? null;
            if ($quantity <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'quantity must be > 0']);
                return;
            }
            $newStock = $this->model->restock($id, $quantity, $userId, $notes);
            echo json_encode(['new_stock' => (int)$newStock]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function movements($id) {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            $rows = $this->model->getMovementsByItem($id, $limit);
            echo json_encode($rows);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function expiring() {
        try {
            $days = isset($_GET['days']) ? (int)$_GET['days'] : null;
            echo json_encode($this->model->getExpiring($days));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

}
?>