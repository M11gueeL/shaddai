<?php

require_once __DIR__ . '/medicalCollegesModel.php';

class medicalCollegesController {

    private $model;

    public function __construct() {
        $this->model = new MedicalCollegesModel();
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
                echo json_encode(['error' => 'Colegio medico no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = $_POST;
            
            $requiredFields = ['state_name', 'full_name', 'abbreviation'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    throw new Exception("El campo $field es obligatorio");
                }
            }
            
            // Obtener el ID del nuevo registro
            $id = $this->model->create($data);
            
            if ($id) {
                http_response_code(201);
                // Devuelve ambos: mensaje e ID
                echo json_encode([
                    'message' => 'Colegio Medico registrado',
                    'id' => $id
                ]);
            } else {
                throw new Exception('Ocurrió un error al registrar el colegio médico');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = $_POST;
            
            $requiredFields = ['state_name', 'full_name', 'abbreviation'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    throw new Exception("El campo $field es obligatorio");
                }
            }
            
            $result = $this->model->update($id, $data);
            if ($result) {
                echo json_encode([
                    'message' => 'Colegio Medico actualizado',
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
            // Verificar si el colegio médico existe
            $existing = $this->model->getById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Colegio médico no encontrado']);
                return;
            }
            
            // Intentar eliminar
            $result = $this->model->delete($id);
            if ($result) {
                echo json_encode(['message' => 'Colegio médico eliminado']);
            } else {
                throw new Exception('Ocurrió un error eliminando el registro');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

}