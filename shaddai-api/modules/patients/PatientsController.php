<?php
require_once __DIR__ . '/PatientsModel.php';

class PatientsController {
    private $model;

    public function __construct() {
        $this->model = new PatientsModel();
    }

    public function getAll() {
        try {
            $patients = $this->model->getAll();
            echo json_encode($patients);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function get($id) {
        try {
            $patient = $this->model->getById($id);
            if ($patient) {
                echo json_encode($patient);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Patient not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = $_POST;
            
            // Validación básica
            if (empty($data['full_name'])) {
                throw new Exception('Full name is required');
            }
            
            $result = $this->model->create($data);
            if ($result) {
                http_response_code(201);
                echo json_encode(['message' => 'Patient created']);
            } else {
                throw new Exception('Failed to create patient');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = $_POST;
            
            if (empty($data['full_name'])) {
                throw new Exception('Full name is required');
            }
            
            $result = $this->model->update($id, $data);
            if ($result) {
                echo json_encode(['message' => 'Patient updated']);
            } else {
                throw new Exception('Failed to update patient');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $result = $this->model->delete($id);
            if ($result) {
                echo json_encode(['message' => 'Patient deleted']);
            } else {
                throw new Exception('Failed to delete patient');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}