<?php
require_once __DIR__ . '/AppointmentsModel.php';
require_once __DIR__ . '/../../services/ReportGeneratorService.php';

class AppointmentsController {
    private $model;
    private $reportService;

    public function __construct() {
        $this->model = new AppointmentsModel();
        $this->reportService = new ReportGeneratorService();
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

    public function updateStatus($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

            if (empty($data['status'])) {
                throw new Exception('Status is required');
            }

            // Obtener usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                throw new Exception('No autorizado para cambiar el estado');
            }

            $changedBy = $jwtPayload->sub;
            $changeReason = $data['change_reason'] ?? null;

            $result = $this->model->updateAppointmentStatus($id, $data['status'], $changedBy, $changeReason);
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
    
    public function checkAvailability() {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_GET;
            
            if (empty($data['doctor_id']) || empty($data['appointment_date'])) {
                throw new Exception('Doctor ID y fecha son requeridos');
            }
            
            $duration = $data['duration'] ?? 30;
            $availableTimes = $this->model->suggestAvailableTimes(
                $data['doctor_id'], 
                $data['appointment_date'], 
                $duration
            );
            
            echo json_encode([
                'available_times' => $availableTimes,
                'date' => $data['appointment_date'],
                'doctor_id' => $data['doctor_id']
            ]);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function validateSlot() {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            
            $required = ['doctor_id', 'appointment_date', 'appointment_time', 'office_number'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Campo requerido: $field");
                }
            }
            
            $errors = $this->model->validateAppointmentAvailability($data);
            
            echo json_encode([
                'available' => empty($errors),
                'errors' => $errors,
                'alternative_offices' => empty($errors) ? [] : $this->model->getAvailableOffices(
                    $data['appointment_date'], 
                    $data['appointment_time'], 
                    $data['duration'] ?? 30
                )
            ]);
            
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

        // Validar fecha no sea en el pasado (usando timezone actual del servidor)
        $today = (new DateTime('now'))->format('Y-m-d');
        // Permitir el mismo día; solo fechas estrictamente menores se consideran pasado
        if (!empty($data['appointment_date']) && $data['appointment_date'] < $today) {
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

    public function getTodaysAppointments() {
        try {
            // Obtener la fecha de hoy en formato YYYY-MM-DD
            $today = (new DateTime('now'))->format('Y-m-d');

            $appointments = $this->model->getAppointmentsByDate($today);

            // Si la consulta falló (por ejemplo retornó false), devolver error 500
            if ($appointments === false) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['error' => 'Error al obtener las citas']);
                return;
            }

            // Si no hay citas para hoy, devolver un mensaje claro
            if (empty($appointments)) {
                http_response_code(200);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['message' => 'No hay citas para hoy']);
                return;
            }

            // Responder con las citas encontradas
            http_response_code(200);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($appointments);
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getStatistics() {
        try {
            $stats = $this->model->getStatistics();
            http_response_code(200);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($stats);
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function exportReport() {
        try {
            // 1. Recoger filtros
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-t');
            $status = $_GET['status'] ?? 'todos';
            $format = $_GET['format'] ?? 'csv';

            // 2. Obtener datos (El modelo hace el trabajo de SQL)
            $appointments = $this->model->getAppointmentsForReport($startDate, $endDate, $status);
            
            // 3. Definir nombre de archivo base
            $filename = "Reporte_Citas_" . date('Ymd_His');

            // 4. Delegar la creación del archivo al Servicio
            switch ($format) {
                case 'pdf':
                    $this->reportService->generatePdf($appointments, $startDate, $endDate, $filename);
                    break;
                case 'excel':
                    $this->reportService->generateExcel($appointments, $startDate, $endDate, $filename);
                    break;
                default:
                    $this->reportService->generateCsv($appointments, $filename);
                    break;
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

}
