<?php
require_once __DIR__ . '/AppointmentsModel.php';

class AppointmentsController {
    private $model;

    public function __construct() {
        $this->model = new AppointmentsModel();
    }

    public function getAllAppointments() {
        try {
            $appointments = $this->model->getAllAppointments();
            echo json_encode($appointments);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAppointment($id) {
        try {
            $appointment = $this->model->getAppointmentById($id);
            if ($appointment) {
                echo json_encode($appointment);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Appointment not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAppointmentsByDate($date) {
        try {
            $appointments = $this->model->getAppointmentsByDate($date);
            echo json_encode($appointments);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAppointmentsByDoctor($doctorId) {
        try {
            $date = $_GET['date'] ?? null;
            $appointments = $this->model->getAppointmentsByDoctor($doctorId, $date);
            echo json_encode($appointments);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAppointmentsByPatient($patientId) {
        try {
            $appointments = $this->model->getAppointmentsByPatient($patientId);
            echo json_encode($appointments);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createAppointment() {
        try {
            // Manejar JSON
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (empty($data)) {
                $data = $_POST;
            }

            // Obtener el usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                throw new Exception('No autorizado para crear citas');
            }

            // Asignar created_by automáticamente
            $data['created_by'] = $jwtPayload->sub;
            
            // Validaciones básicas
            $this->validateAppointmentData($data);

            $result = $this->model->createAppointment($data);
            if ($result) {
                http_response_code(201);
                echo json_encode(['message' => 'Appointment created successfully', 'id' => $result]);
            } else {
                throw new Exception('Failed to create appointment');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }



    public function updateAppointment($id) {
        try {
            
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (empty($data)) {
                $data = $_POST;
            }
            
            $this->validateAppointmentData($data);
            
            $result = $this->model->updateAppointment($id, $data);
            if ($result) {
                echo json_encode(['message' => 'Appointment updated successfully']);
            } else {
                throw new Exception('Failed to update appointment');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }



    public function confirmAppointment($id) {
        try {
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                throw new Exception('No autorizado para confirmar citas');
            }

            $result = $this->model->confirmAppointment($id, $jwtPayload->sub);
            if ($result) {
                echo json_encode(['message' => 'Appointment confirmed successfully']);
            } else {
                throw new Exception('Failed to confirm appointment');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function cancelAppointment($id) {
        try {
            $data = $_POST;
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                throw new Exception('No autorizado para cancelar citas');
            }

            $reason = $data['cancellation_reason'] ?? null;
            $result = $this->model->cancelAppointment($id, $jwtPayload->sub, $reason);
            
            if ($result) {
                echo json_encode(['message' => 'Appointment cancelled successfully']);
            } else {
                throw new Exception('Failed to cancel appointment');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateStatus($id) {
        try {
            $data = $_POST;
            
            if (empty($data['status'])) {
                throw new Exception('Status is required');
            }
            
            $result = $this->model->updateAppointmentStatus($id, $data['status']);
            if ($result) {
                echo json_encode(['message' => 'Appointment status updated successfully']);
            } else {
                throw new Exception('Failed to update appointment status');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteAppointment($id) {
        try {
            $result = $this->model->deleteAppointment($id);
            if ($result) {
                echo json_encode(['message' => 'Appointment deleted successfully']);
            } else {
                throw new Exception('Failed to delete appointment');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function validateAppointmentData($data) {
        if (empty($data['patient_id'])) {
            throw new Exception('Patient ID is required');
        }
        
        if (empty($data['doctor_id'])) {
            throw new Exception('Doctor ID is required');
        }
        
        if (empty($data['appointment_date'])) {
            throw new Exception('Appointment date is required');
        }
        
        if (empty($data['appointment_time'])) {
            throw new Exception('Appointment time is required');
        }
        
        if (empty($data['office_number']) || !in_array($data['office_number'], [1, 2, 3])) {
            throw new Exception('Valid office number (1, 2, or 3) is required');
        }
        
        if (empty($data['specialty_id'])) {
            throw new Exception('Specialty ID is required');
        }

        // Validar fecha no sea en el pasado
        if (strtotime($data['appointment_date']) < strtotime(date('Y-m-d'))) {
            throw new Exception('Cannot schedule appointments in the past');
        }

        // Validar tipos de cita
        $validTypes = ['primera_vez', 'control', 'emergencia', 'urgencia'];
        if (!empty($data['appointment_type']) && !in_array($data['appointment_type'], $validTypes)) {
            throw new Exception('Invalid appointment type');
        }

        // Validar estados
        $validStatuses = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_se_presento'];
        if (!empty($data['status']) && !in_array($data['status'], $validStatuses)) {
            throw new Exception('Invalid appointment status');
        }
    }
}
