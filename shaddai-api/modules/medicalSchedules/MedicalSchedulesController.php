<?php
require_once __DIR__ . '/MedicalSchedulesModel.php';

class MedicalSchedulesController {
    private $model;

    public function __construct() {
        $this->model = new MedicalSchedulesModel();
    }

    /**
     * Obtiene todos los horarios o los de un médico específico.
     * GET /schedules
     * GET /schedules/medical/{medicalId}
     */
    public function getAllSchedules($medicalId = null) {
        try {
            if ($medicalId !== null && !is_numeric($medicalId)) {
                http_response_code(400);
                echo json_encode(['error' => 'El parámetro medicalId debe ser numérico']);
                return;
            }
            $schedules = $this->model->getAll($medicalId);
            echo json_encode($schedules);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener los horarios: ' . $e->getMessage()]);
        }
    }

    /**
     * Obtiene todos los horarios de un doctor específico.
     * GET /schedules/doctor/{doctorId}
     */
    public function getSchedulesByDoctor($doctorId) {
        try {
            if (empty($doctorId) || !is_numeric($doctorId)) {
                http_response_code(400);
                echo json_encode(['error' => 'El ID de doctor es inválido']);
                return;
            }

            $schedules = $this->model->getByMedicalId((int)$doctorId);
            echo json_encode($schedules);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener los horarios del doctor: ' . $e->getMessage()]);
        }
    }

    /**
     * Obtiene un horario específico por ID.
     * GET /schedules/{id}
     */
    public function getScheduleById($id) {
        try {
            $schedule = $this->model->getById($id);
            if ($schedule) {
                echo json_encode($schedule);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Horario no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener el horario: ' . $e->getMessage()]);
        }
    }

    /**
     * Crea un nuevo horario preferido.
     * POST /schedules
     */
    public function createSchedule() {
        try {
            // Manejar entrada JSON o form-data
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            if (empty($data)) {
                $data = $_POST;
            }

            // Validar datos requeridos usando el método del modelo
            $this->model->validateData($data);

            $newId = $this->model->create($data);

            if ($newId) {
                http_response_code(201);
                echo json_encode(['message' => 'Horario preferido creado exitosamente', 'id' => $newId]);
            } else {
                throw new Exception('No se pudo crear el horario preferido.');
            }
        } catch (Exception $e) {
            http_response_code(400); // Bad request por datos inválidos o error
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Actualiza un horario preferido existente.
     * PUT /schedules/{id}
     */
    public function updateSchedule($id) {
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
             if (empty($data)) {
                $data = $_POST; // Opcional: soportar form-data también
            }

            // Validar datos requeridos
            $this->model->validateData($data);

            // Verificar si el horario existe
            $existing = $this->model->getById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Horario no encontrado para actualizar']);
                return;
            }

            $updated = $this->model->update($id, $data);

            if ($updated) {
                echo json_encode(['message' => 'Horario preferido actualizado exitosamente', 'id' => $id]);
            } else {
                // Podría ser que no hubo cambios o un error real
                 throw new Exception('No se pudo actualizar el horario preferido.');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Elimina un horario preferido.
     * DELETE /schedules/{id}
     */
    public function deleteSchedule($id) {
        try {
            // Verificar si existe antes de borrar
             $existing = $this->model->getById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Horario no encontrado para eliminar']);
                return;
            }

            $deleted = $this->model->delete($id);

            if ($deleted) {
                echo json_encode(['message' => 'Horario preferido eliminado exitosamente']);
            } else {
                throw new Exception('No se pudo eliminar el horario preferido.');
            }
        } catch (Exception $e) {
            http_response_code(500); // Error del servidor
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>