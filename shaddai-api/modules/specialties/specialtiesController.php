<?php

require_once __DIR__ . '/specialtiesModel.php';

class SpecialtiesController {
    private $model;

    public function __construct() {
        $this->model = new SpecialtiesModel();
    }

    public function getAll() {
        try {
            $medicalColleges = $this->model->getAll();
            echo json_encode($medicalColleges);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getById($id) {
        try {
            $medicalColleges = $this->model->getById($id);
            if ($medicalColleges) {
                echo json_encode($medicalColleges);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Especialidad médica no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getEspecialtiesByDoctorId($doctorId) {
        try {
            $specialties = $this->model->getEspecialtiesByDoctorId($doctorId);
            echo json_encode($specialties);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = $_POST;
            
            if (empty($data['name'])) {
                throw new Exception("El campo nombre es obligatorio");
            }
            
            // Obtener el ID del nuevo registro
            $id = $this->model->create($data);
            
            if ($id) {
                http_response_code(201);
                // Devuelve ambos: mensaje e ID
                echo json_encode([
                    'message' => 'Especialidad médica registrado',
                    'id' => $id
                ]);
            } else {
                throw new Exception('Ocurrió un error al registrar la especialidad médica');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = $_POST;
            
            if (empty($data['name'])) {
                throw new Exception("El campo nombre es obligatorio");
            }
            
            $result = $this->model->update($id, $data);
            if ($result) {
                echo json_encode([
                    'message' => 'Especialidad médica actualizada',
                    'id' => $id
                ]);
            } else {
                throw new Exception('Ocurrio un error actualizando el registro');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            // Verificar si existe
            $existing = $this->model->getById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Especialidad médica no encontrada']);
                return;
            }
            
            // Intentar eliminar
            $result = $this->model->delete($id);
            if ($result) {
                echo json_encode(['message' => 'Especialidad médica eliminada']);
            } else {
                throw new Exception('Ocurrió un error eliminando el registro');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}