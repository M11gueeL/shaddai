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

    public function exportPatientReport() {
        try {
            $patientId = $_GET['patient_id'] ?? null;
            $startDate = $_GET['start_date'] ?? date('Y-m-d');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            $status = $_GET['status'] ?? 'todos';
            $format = $_GET['format'] ?? 'pdf';

            if (!$patientId) {
                throw new Exception('Patient ID is required');
            }

            // Obtener usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            $generatedBy = 'Sistema';
            if ($jwtPayload && isset($jwtPayload->sub)) {
                $generatedBy = $this->model->getUserName($jwtPayload->sub);
            }

            $data = $this->model->getAppointmentsByPatientAndDateRange($patientId, $startDate, $endDate, $status);
            
            // Obtener nombre del paciente para el archivo
            $patientName = !empty($data) ? $data[0]['patient_name'] : 'Paciente';
            $filename = 'reporte_citas_' . str_replace(' ', '_', strtolower($patientName)) . '_' . $startDate;

            if ($format === 'excel') {
                $this->reportService->generateExcel($data, $startDate, $endDate, $filename, $generatedBy);
            } elseif ($format === 'csv') {
                $this->reportService->generateCsv($data, $filename);
            } else {
                $this->reportService->generatePdf($data, $startDate, $endDate, $filename, $generatedBy);
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function exportDoctorReport() {
        try {
            $doctorId = $_GET['doctor_id'] ?? null;
            $startDate = $_GET['start_date'] ?? date('Y-m-d');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            $status = $_GET['status'] ?? 'todos';
            $format = $_GET['format'] ?? 'pdf';

            if (!$doctorId) {
                throw new Exception('Doctor ID is required');
            }

            // Obtener usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            $generatedBy = 'Sistema';
            if ($jwtPayload && isset($jwtPayload->sub)) {
                $generatedBy = $this->model->getUserName($jwtPayload->sub);
            }

            $data = $this->model->getAppointmentsByDoctorAndDateRange($doctorId, $startDate, $endDate, $status);
            
            $doctorName = !empty($data) ? $data[0]['doctor_name'] : 'Medico';
            $filename = 'reporte_citas_' . str_replace(' ', '_', strtolower($doctorName)) . '_' . $startDate;

            if ($format === 'excel') {
                $this->reportService->generateExcel($data, $startDate, $endDate, $filename, $generatedBy);
            } elseif ($format === 'csv') {
                $this->reportService->generateCsv($data, $filename);
            } else {
                $this->reportService->generatePdf($data, $startDate, $endDate, $filename, $generatedBy);
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function exportSpecialtyReport() {
        try {
            $specialtyId = $_GET['specialty_id'] ?? null;
            $startDate = $_GET['start_date'] ?? date('Y-m-d');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            $status = $_GET['status'] ?? 'todos';
            $format = $_GET['format'] ?? 'pdf';

            if (!$specialtyId) {
                throw new Exception('Specialty ID is required');
            }

            // Obtener usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            $generatedBy = 'Sistema';
            if ($jwtPayload && isset($jwtPayload->sub)) {
                $generatedBy = $this->model->getUserName($jwtPayload->sub);
            }

            $data = $this->model->getAppointmentsBySpecialtyAndDateRange($specialtyId, $startDate, $endDate, $status);
            
            $specialtyName = !empty($data) ? $data[0]['specialty_name'] : 'Especialidad';
            $filename = 'reporte_citas_' . str_replace(' ', '_', strtolower($specialtyName)) . '_' . $startDate;

            if ($format === 'excel') {
                $this->reportService->generateExcel($data, $startDate, $endDate, $filename, $generatedBy);
            } elseif ($format === 'csv') {
                $this->reportService->generateCsv($data, $filename);
            } else {
                $this->reportService->generatePdf($data, $startDate, $endDate, $filename, $generatedBy);
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
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
                echo json_encode(['error' => 'Cita no encontrada']);
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
                echo json_encode(['message' => 'Cita creada exitosamente', 'id' => $result]);
            } else {
                throw new Exception('Error al crear la cita');
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
            
            $this->validateAppointmentData($data, true);
            
            $result = $this->model->updateAppointment($id, $data);
            if ($result) {
                echo json_encode(['message' => 'Cita actualizada exitosamente']);
            } else {
                throw new Exception('Error al actualizar la cita');
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
                throw new Exception('El estado es requerido');
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
                echo json_encode(['message' => 'Estado de la cita actualizado exitosamente']);
            } else {
                throw new Exception('Error al actualizar el estado de la cita');
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
                echo json_encode(['message' => 'Cita eliminada exitosamente']);
            } else {
                throw new Exception('Error al eliminar la cita');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function validateAppointmentData($data, $isUpdate = false) {
        if (empty($data['patient_id'])) {
            throw new Exception('El ID del paciente es requerido');
        }
        
        if (empty($data['doctor_id'])) {
            throw new Exception('El ID del médico es requerido');
        }
        
        if (empty($data['appointment_date'])) {
            throw new Exception('La fecha de la cita es requerida');
        }
        
        if (empty($data['appointment_time'])) {
            throw new Exception('La hora de la cita es requerida');
        }
        
        if (empty($data['office_number']) || !in_array($data['office_number'], [1, 2, 3])) {
            throw new Exception('El número de consultorio debe ser válido (1, 2 o 3)');
        }
        
        if (empty($data['specialty_id'])) {
            throw new Exception('El ID de la especialidad es requerido');
        }

        // Validar fecha no sea en el pasado (usando timezone actual del servidor)
        $today = (new DateTime('now'))->format('Y-m-d');
        // Permitir el mismo día; solo fechas estrictamente menores se consideran pasado
        // Si es una actualización, permitimos fechas pasadas (para corregir citas viejas)
        if (!$isUpdate && !empty($data['appointment_date']) && $data['appointment_date'] < $today) {
            throw new Exception('No se pueden agendar citas en fechas pasadas');
        }

        // Validar tipos de cita
        $validTypes = ['primera_vez', 'control', 'emergencia', 'urgencia'];
        if (!empty($data['appointment_type']) && !in_array($data['appointment_type'], $validTypes)) {
            throw new Exception('Tipo de cita inválido');
        }

        // Validar estados
        $validStatuses = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_se_presento'];
        if (!empty($data['status']) && !in_array($data['status'], $validStatuses)) {
            throw new Exception('Estado de cita inválido');
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

    public function getAdvancedStatistics() {
        try {
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;
            $type = $_GET['type'] ?? null;

            if (!$startDate || !$endDate || !$type) {
                throw new Exception('Fecha de inicio, fecha de fin y tipo son requeridos');
            }

            // Validar rango mínimo de 7 días
            $start = new DateTime($startDate);
            $end = new DateTime($endDate);
            $interval = $start->diff($end);

            if ($interval->days < 6) { // 6 porque la diferencia entre el mismo día es 0, pero queremos al menos 7 días inclusivos
                throw new Exception('El rango de fechas debe ser de al menos 7 días');
            }

            $stats = $this->model->getAdvancedStatistics($startDate, $endDate, $type);
            
            http_response_code(200);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($stats);

        } catch (Exception $e) {
            http_response_code(400);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function exportPerformanceReport() {
        try {
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;
            $type = $_GET['type'] ?? null;

            if (!$startDate || !$endDate || !$type) {
                throw new Exception('Fecha de inicio, fecha de fin y tipo son requeridos');
            }

            // Validar rango mínimo de 7 días
            $start = new DateTime($startDate);
            $end = new DateTime($endDate);
            $interval = $start->diff($end);

            if ($interval->days < 6) {
                throw new Exception('El rango de fechas debe ser de al menos 7 días');
            }

            // Obtener usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            $generatedBy = 'Sistema';
            if ($jwtPayload && isset($jwtPayload->sub)) {
                $generatedBy = $this->model->getUserName($jwtPayload->sub);
            }

            $data = $this->model->getAdvancedStatistics($startDate, $endDate, $type);
            
            $filename = 'reporte_rendimiento_' . $type . '_' . $startDate . '_' . $endDate;
            
            $this->reportService->generatePerformancePdf($data, $startDate, $endDate, $type, $filename, $generatedBy);

        } catch (Exception $e) {
            http_response_code(400);
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

            // Obtener usuario autenticado desde JWT
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            $generatedBy = 'Sistema';
            if ($jwtPayload && isset($jwtPayload->sub)) {
                $generatedBy = $this->model->getUserName($jwtPayload->sub);
            }

            // 4. Delegar la creación del archivo al Servicio
            switch ($format) {
                case 'pdf':
                    $this->reportService->generatePdf($appointments, $startDate, $endDate, $filename, $generatedBy);
                    break;
                case 'excel':
                    $this->reportService->generateExcel($appointments, $startDate, $endDate, $filename, $generatedBy);
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
