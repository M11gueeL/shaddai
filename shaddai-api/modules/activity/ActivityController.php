<?php
require_once __DIR__ . '/ActivityModel.php';

class ActivityController {
    private $model;

    public function __construct() {
        $this->model = new ActivityModel();
    }

    /**
     * GET /activity/recent?limit=5
     * Returns a unified feed of today's recent actions.
     */
    public function getRecent() {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
            if ($limit <= 0) $limit = 5;
            $feed = $this->model->getTodayActivity($limit);
            http_response_code(200);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['data' => $feed]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
