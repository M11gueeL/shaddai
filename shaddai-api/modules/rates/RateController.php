<?php
require_once __DIR__ . '/RateModel.php';

class RateController {
    private $model;
    public function __construct() { $this->model = new RateModel(); }

    public function create() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $rate = isset($_POST['rate_bcv']) ? (float)$_POST['rate_bcv'] : null;
            $date = $_POST['rate_date'] ?? null; // optional backfill
            if (!$rate || $rate <= 0) { http_response_code(400); echo json_encode(['error'=>'rate_bcv must be > 0']); return; }
            $targetDate = $date ?: date('Y-m-d');
            $existing = $this->model->findByDate($targetDate);
            if ($existing) { http_response_code(409); echo json_encode(['error'=>'Rate for this date already exists','date'=>$targetDate]); return; }
            $id = $this->model->create($rate, $payload->sub, $targetDate);
            http_response_code(201);
            echo json_encode(['id'=>(int)$id,'rate_date'=>$targetDate,'rate_bcv'=>$rate]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()]); }
    }

    public function getToday() {
        $rate = $this->model->getToday();
        if ($rate) echo json_encode($rate); else { http_response_code(404); echo json_encode(['error'=>'No rate set for today']); }
    }

    public function list() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 30;
        echo json_encode($this->model->list($limit));
    }
}
?>
