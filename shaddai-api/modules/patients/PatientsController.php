<?php
require_once __DIR__ . '/PatientsModel.php';

class PatientsController {
    private $model;

    public function __construct() {
        $this->model = new PatientsModel();
    }

    public function getAllPatients() {
        try {
            $patients = $this->model->getAllPatients();
            echo json_encode($patients);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getPatient($id) {
        try {
            $patient = $this->model->getPatientById($id);
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

    public function getPatientByCedula($cedula) {
        try {
            $patient = $this->model->findPatientByCedula($cedula);
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

    public function createPatient() {
        try {
            $data = $_POST;

            // Obtener el id del usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                throw new Exception('No autorizado para crear pacientes');
            }

            // Asiganar created_by automáticamente
            $data['created_by'] = $jwtPayload->sub;
            
            // Validación básica
            if (empty($data['full_name'])) {
                throw new Exception('Full name is required');
            }
            
            $result = $this->model->createPatient($data);
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

    public function updatePatient($id) {
        try {
            $data = $_POST;
            
            if (empty($data['full_name'])) {
                throw new Exception('Full name is required');
            }
            
            $result = $this->model->updatePatient($id, $data);
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

    public function deletePatient($id) {
        try {
            $result = $this->model->deletePatient($id);
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