<?php

require_once __DIR__ . '/../../config/Database.php';

class AppointmentsModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getUserName($userId) {
        $query = "SELECT first_name, last_name FROM users WHERE id = :id";
        $result = $this->db->query($query, [':id' => $userId]);
        if ($result && count($result) > 0) {
            return $result[0]['first_name'] . ' ' . $result[0]['last_name'];
        }
        return 'Usuario Desconocido';
    }

    public function createAppointment($data) {

        // Validar disponibilidad ANTES de iniciar transacción
        $errors = $this->validateAppointmentAvailability($data);
        if (!empty($errors)) {
            throw new Exception(implode('. ', $errors));
        }

        $this->db->beginTransaction();

        $mainFields = [
            'patient_id', 'doctor_id', 'appointment_date', 'appointment_time',
            'consulting_room_id', 'specialty_id', 'duration', 'status', 'appointment_type', 'created_by'
        ];
        $values = [];
        foreach ($mainFields as $f) {
            if ($f === 'status') {
                $values[$f] = $data[$f] ?? 'programada'; 
            } elseif ($f === 'duration') {
                $values[$f] = $data[$f] ?? 30;
            } elseif ($f === 'appointment_type') {
                $values[$f] = $data[$f] ?? 'primera_vez';
            } elseif ($f === 'consulting_room_id') {
                $values[$f] = $data['consulting_room_id'] ?? $data['office_number'] ?? null;
            } else {
                $values[$f] = $data[$f] ?? null;
            }
        }

        $sql = "INSERT INTO appointments (
            patient_id, doctor_id, appointment_date, appointment_time, consulting_room_id,
            specialty_id, duration, status, appointment_type, created_by
        ) VALUES (
            :patient_id, :doctor_id, :appointment_date, :appointment_time, :consulting_room_id,
            :specialty_id, :duration, :status, :appointment_type, :created_by
        )";
        $params = [];
        foreach ($mainFields as $f) {
            $params[":$f"] = $values[$f];
        }

        $result = $this->db->execute($sql, $params);
        if (!$result) { 
            $this->db->rollBack(); 
            return false; 
        }
        
        $id = $this->db->lastInsertId();

        // crear record en información médica si hay datos
        if (!empty($data['chief_complaint']) || !empty($data['symptoms']) || !empty($data['notes'])) {
            $this->createAppointmentMedicalInfo($id, $data);
        }

        $this->db->commit();
        return $id;
    }

    public function createAppointmentMedicalInfo($appointmentId, $data) {
        $sql = "INSERT INTO appointment_medical_info
            (appointment_id, chief_complaint, symptoms, notes)
        VALUES
            (:appointment_id, :chief_complaint, :symptoms, :notes)";
        $params = [
            ':appointment_id' => $appointmentId,
            ':chief_complaint' => $data['chief_complaint'] ?? null,
            ':symptoms' => $data['symptoms'] ?? null,
            ':notes' => $data['notes'] ?? null
        ];
        $this->db->execute($sql, $params);
    }

    public function getAppointmentsByPatientAndDateRange($patientId, $startDate, $endDate, $status = null) {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.patient_id = :patient_id 
        AND a.appointment_date BETWEEN :start_date AND :end_date";

        $params = [
            ':patient_id' => $patientId,
            ':start_date' => $startDate,
            ':end_date' => $endDate
        ];

        if ($status && $status !== 'todos') {
            $query .= " AND a.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        return $this->db->query($query, $params);
    }

    public function getAppointmentsByDoctorAndDateRange($doctorId, $startDate, $endDate, $status = null) {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.doctor_id = :doctor_id 
        AND a.appointment_date BETWEEN :start_date AND :end_date";

        $params = [
            ':doctor_id' => $doctorId,
            ':start_date' => $startDate,
            ':end_date' => $endDate
        ];

        if ($status && $status !== 'todos') {
            $query .= " AND a.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        return $this->db->query($query, $params);
    }

    public function getAppointmentsBySpecialtyAndDateRange($specialtyId, $startDate, $endDate, $status = null) {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.specialty_id = :specialty_id 
        AND a.appointment_date BETWEEN :start_date AND :end_date";

        $params = [
            ':specialty_id' => $specialtyId,
            ':start_date' => $startDate,
            ':end_date' => $endDate
        ];

        if ($status && $status !== 'todos') {
            $query .= " AND a.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        return $this->db->query($query, $params);
    }

    public function getAllAppointments() {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone, p.email as patient_email,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name,
            cr.name as consulting_room_name,
            cr.color as consulting_room_color,
            CONCAT(uc.first_name, ' ', uc.last_name) as created_by_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN consulting_rooms cr ON a.consulting_room_id = cr.id
        LEFT JOIN users uc ON a.created_by = uc.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC";
        return $this->db->query($query);
    }


    public function getAppointmentById($id) {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone, p.email as patient_email,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name, u.cedula as doctor_cedula, u.email as doctor_email,
            ms.name as specialty_name,
            cr.name as consulting_room_name,
            cr.color as consulting_room_color
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        LEFT JOIN consulting_rooms cr ON a.consulting_room_id = cr.id
        WHERE a.id = :id";
        $params = [':id' => $id];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null;
    }

    public function getAppointmentHistory($id) {
        $query = "SELECT 
            h.*,
            CONCAT(u.first_name, ' ', u.last_name) as changed_by_name
        FROM appointment_status_history h
        LEFT JOIN users u ON h.changed_by = u.id
        WHERE h.appointment_id = :id
        ORDER BY h.changed_at DESC";
        
        return $this->db->query($query, [':id' => $id]);
    }


    public function getAppointmentsByDate($date) {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone, p.email as patient_email,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name, u.cedula as doctor_cedula,
            ms.name as specialty_name,
            cr.name as consulting_room_name,
            cr.color as consulting_room_color
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN consulting_rooms cr ON a.consulting_room_id = cr.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.appointment_date = :date
        ORDER BY a.appointment_time ASC";
        $params = [':date' => $date];
        return $this->db->query($query, $params);
    }

    public function getAppointmentsByPatient($patientId) {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone, p.email as patient_email,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name, u.cedula as doctor_cedula,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.patient_id = :patient_id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC";
        $params = [':patient_id' => $patientId];
        return $this->db->query($query, $params);
    }

    public function getAppointmentsByDoctor($doctorId, $date = null) {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.phone as patient_phone, p.email as patient_email,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.doctor_id = :doctor_id";
        $params = [':doctor_id' => $doctorId];
        if ($date) {
            $query .= " AND a.appointment_date = :date";
            $params[':date'] = $date;
        }
        $query .= " ORDER BY a.appointment_date DESC, a.appointment_time ASC";
        return $this->db->query($query, $params);
    }

    public function updateAppointment($id, $data, $changedBy = null) {

        // Validar disponibilidad excluyendo la cita actual
        $errors = $this->validateAppointmentAvailability($data, $id);
        if (!empty($errors)) {
            throw new Exception(implode('. ', $errors));
        }

        // Obtener estado actual antes de actualizar
        $current = $this->db->query("SELECT status FROM appointments WHERE id = :id", [':id' => $id]);
        $currentStatus = $current ? $current[0]['status'] : null;

        // Map office_number to consulting_room_id
        if (isset($data['office_number']) && !isset($data['consulting_room_id'])) {
            $data['consulting_room_id'] = $data['office_number'];
        }
        
        $fields = [
            'patient_id', 'doctor_id', 'appointment_date', 'appointment_time',
            'consulting_room_id', 'specialty_id', 'duration', 'status', 'appointment_type'
        ];
        $set = [];
        $params = [];
        foreach ($fields as $f) {
            $set[] = "$f = :$f";
            $params[":$f"] = $data[$f] ?? null;
        }
        $params[':id'] = $id;

        $sql = "UPDATE appointments SET " . implode(', ', $set) . " WHERE id = :id";
        $this->db->execute($sql, $params);

        // Registrar historial si hubo cambio de estado
        if ($changedBy && isset($data['status']) && $currentStatus !== $data['status']) {
             $this->db->execute(
                "INSERT INTO appointment_status_history 
                (appointment_id, previous_status, new_status, changed_by, change_reason)
                VALUES (:appointment_id, :prev_status, :new_status, :changed_by, :change_reason)",
                [
                    ':appointment_id' => $id,
                    ':prev_status' => $currentStatus,
                    ':new_status' => $data['status'],
                    ':changed_by' => $changedBy,
                    ':change_reason' => 'Actualización de cita'
                ]
            );
        }

        // Actualizar o crear registro en medical info
        $hasMedical = $this->db->query("SELECT 1 FROM appointment_medical_info WHERE appointment_id = :id", [':id'=>$id]);
        if ($hasMedical) {
            $sql = "UPDATE appointment_medical_info SET
                chief_complaint = :chief_complaint,
                symptoms = :symptoms,
                notes = :notes
            WHERE appointment_id = :id";
        } else {
            $sql = "INSERT INTO appointment_medical_info
                (appointment_id, chief_complaint, symptoms, notes)
            VALUES
                (:id, :chief_complaint, :symptoms, :notes)";
        }
        $mparams = [
            ':id' => $id,
            ':chief_complaint' => $data['chief_complaint'] ?? null,
            ':symptoms' => $data['symptoms'] ?? null,
            ':notes' => $data['notes'] ?? null
        ];
        $this->db->execute($sql, $mparams);
        return true;
    }

    public function updateAppointmentStatus($id, $status, $changedBy, $changeReason = null) {
        $validStatuses = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_se_presento'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception('Estado de cita inválido');
        }

        try {
            $this->db->beginTransaction();

            // Obtener estado previo
            $prev = $this->db->query("SELECT status FROM appointments WHERE id = :id", [':id' => $id]);
            $previousStatus = !empty($prev) ? $prev[0]['status'] : null;

            // Actualizar estado
            $update = $this->db->execute(
                "UPDATE appointments SET status = :status WHERE id = :id",
                [':status' => $status, ':id' => $id]
            );

            if (!$update) {
                $this->db->rollBack();
                return false;
            }

            // Insertar en historial solo si el estado cambia realmente
            if ($previousStatus !== $status) {
                $insertHist = $this->db->execute(
                    "INSERT INTO appointment_status_history 
                    (appointment_id, previous_status, new_status, changed_by, change_reason)
                    VALUES (:appointment_id, :prev_status, :new_status, :changed_by, :change_reason)",
                    [
                        ':appointment_id' => $id,
                        ':prev_status' => $previousStatus,
                        ':new_status' => $status,
                        ':changed_by' => $changedBy,
                        ':change_reason' => $changeReason
                    ]
                );

                if (!$insertHist) {
                    $this->db->rollBack();
                    return false;
                }
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Verificar disponibilidad de consultorio
     */
    public function isOfficeAvailable($date, $time, $officeNumber, $duration = 30, $excludeId = null) {
        $startTime = $time;
        $endTime = date('H:i:s', strtotime($time) + ($duration * 60));
        
        $query = "SELECT COUNT(*) as count FROM appointments 
                WHERE appointment_date = :date 
                AND consulting_room_id = :consulting_room_id 
                AND status NOT IN ('cancelada', 'no_se_presento')
                AND (
                    (appointment_time < :end_time AND ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) > :start_time)
                )";
        
        $params = [
            ':date' => $date,
            ':consulting_room_id' => $officeNumber,
            ':start_time' => $startTime,
            ':end_time' => $endTime
        ];
        
        if ($excludeId) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }
        
        $result = $this->db->query($query, $params);
        return $result[0]['count'] == 0;
    }

    /**
     * Verificar disponibilidad de médico
     */
    public function isDoctorAvailable($doctorId, $date, $time, $duration = 30, $excludeId = null) {
        $startTime = $time;
        $endTime = date('H:i:s', strtotime($time) + ($duration * 60));
        
        $query = "SELECT COUNT(*) as count FROM appointments 
                WHERE doctor_id = :doctor_id 
                AND appointment_date = :date 
                AND status NOT IN ('cancelada', 'no_se_presento')
                AND (
                    (appointment_time < :end_time AND ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) > :start_time)
                )";
        
        $params = [
            ':doctor_id' => $doctorId,
            ':date' => $date,
            ':start_time' => $startTime,
            ':end_time' => $endTime
        ];
        
        if ($excludeId) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }
        
        $result = $this->db->query($query, $params);
        return $result[0]['count'] == 0;
    }


    /**
     * Obtener consultorios disponibles para una fecha/hora específica
     */
    public function getAvailableOffices($date, $time, $duration = 30, $excludeId = null) {
        $availableOffices = [];
        $totalOffices = [1, 2, 3]; // Assuming 3 offices
        
        foreach ($totalOffices as $office) {
            if ($this->isOfficeAvailable($date, $time, $office, $duration, $excludeId)) {
                $availableOffices[] = $office;
            }
        }
        
        return $availableOffices;
    }

    /**
     * Sugerir horarios disponibles para un médico en una fecha
     */
    public function suggestAvailableTimes($doctorId, $date, $duration = 30, $startHour = 8, $endHour = 18) {
        $availableTimes = [];
        $intervalMinutes = 30; // Intervalos de 30 minutos
        
        for ($hour = $startHour; $hour < $endHour; $hour++) {
            for ($minute = 0; $minute < 60; $minute += $intervalMinutes) {
                $time = sprintf('%02d:%02d:00', $hour, $minute);
                
                if ($this->isDoctorAvailable($doctorId, $date, $time, $duration)) {
                    $availableOffices = $this->getAvailableOffices($date, $time, $duration);
                    
                    if (!empty($availableOffices)) {
                        $availableTimes[] = [
                            'time' => $time,
                            'available_offices' => $availableOffices
                        ];
                    }
                }
            }
        }
        
        return $availableTimes;
    }

    // requiero de una funcion para obtener todas las citas del dia, sin importar el status, necesitamos entregar datos como: hora, status, tipo de cita, dr y paciente.
    public function getAppointmentsForToday() {
        $today = date('Y-m-d');
        $query = "SELECT 
            a.id,
            a.appointment_time,
            a.status,
            a.appointment_type,
            p.full_name AS patient_name,
            CONCAT(u.first_name, ' ', u.last_name) AS doctor_name,
            ms.name AS specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        LEFT JOIN medical_specialties ms ON a.specialty_id = ms.id
        WHERE a.appointment_date = :today
        ORDER BY a.appointment_time ASC";
        $params = [':today' => $today];
        return $this->db->query($query, $params);
    }

    /**
     * Obtener estadísticas generales para el panel de recepción:
     * - Total de pacientes registrados
     * - Total de citas registradas (todas)
     * - Total de citas del día de hoy (todas, sin importar estado)
     * - Total de citas confirmadas (en general)
     * - Total de citas canceladas (en general)
     */
    public function getStatistics() {
        $today = date('Y-m-d');

        // Conteo de pacientes
        $patients = $this->db->query("SELECT COUNT(*) AS c FROM patients");

        // Conteo total de citas
        $appointments = $this->db->query("SELECT COUNT(*) AS c FROM appointments");

        // Conteo de citas completadas (general)
        $completed = $this->db->query(
            "SELECT COUNT(*) AS c FROM appointments WHERE status = 'completada'"
        );

        // Conteo de citas confirmadas (general)
        $confirmed = $this->db->query(
            "SELECT COUNT(*) AS c FROM appointments WHERE status = 'confirmada'"
        );

        // Conteo de citas canceladas (general)
        $canceled = $this->db->query(
            "SELECT COUNT(*) AS c FROM appointments WHERE status = 'cancelada'"
        );

        return [
            'total_patients'     => (int)($patients[0]['c'] ?? 0),
            'total_appointments'         => (int)($appointments[0]['c'] ?? 0),
            'completed_appointments'       => (int)($completed[0]['c'] ?? 0),
            'confirmed_appointments'   => (int)($confirmed[0]['c'] ?? 0),
            'canceled_appointments'    => (int)($canceled[0]['c'] ?? 0),
        ];
    }

    public function deleteAppointment($id) {
        $query = "DELETE FROM appointments WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }

    /**
     * Obtener citas para reportes con filtros dinámicos
     * @param string $startDate Fecha inicio (YYYY-MM-DD)
     * @param string $endDate Fecha fin (YYYY-MM-DD)
     * @param string|null $status Estado específico o null para 'todos'
     */
    public function getAppointmentsForReport($startDate, $endDate, $status = null) {
        $query = "SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.appointment_type,
            a.duration,
            p.full_name as patient_name, 
            p.cedula as patient_cedula,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name,
            ami.chief_complaint
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.appointment_date BETWEEN :start_date AND :end_date";

        $params = [
            ':start_date' => $startDate,
            ':end_date' => $endDate
        ];

        // Si el status no es 'todos' y no es nulo, agregamos el filtro
        if ($status && $status !== 'todos') {
            $query .= " AND a.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY a.appointment_date ASC, a.appointment_time ASC";

        return $this->db->query($query, $params);
    }

    public function getAppointmentsForDoctorReport($startDate, $endDate, $status = null, $doctorId) {
        $query = "SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.appointment_type,
            a.duration,
            p.full_name as patient_name, 
            p.cedula as patient_cedula,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name,
            ami.chief_complaint
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.appointment_date BETWEEN :start_date AND :end_date
        AND a.doctor_id = :doctor_id";

        $params = [
            ':start_date' => $startDate,
            ':end_date' => $endDate,
            ':doctor_id' => $doctorId
        ];

        if ($status && $status !== 'todos') {
            $query .= " AND a.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY a.appointment_date ASC, a.appointment_time ASC";

        return $this->db->query($query, $params);
    }

    public function getAppointmentsForSpecialtyReport($startDate, $endDate, $status = null, $specialtyId) {
        $query = "SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.appointment_type,
            a.duration,
            p.full_name as patient_name, 
            p.cedula as patient_cedula,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name,
            ami.chief_complaint
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.appointment_date BETWEEN :start_date AND :end_date
        AND a.specialty_id = :specialty_id";

        $params = [
            ':start_date' => $startDate,
            ':end_date' => $endDate,
            ':specialty_id' => $specialtyId
        ];

        if ($status && $status !== 'todos') {
            $query .= " AND a.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY a.appointment_date ASC, a.appointment_time ASC";

        return $this->db->query($query, $params);
    }

    public function getAppointmentsForPatientReport($startDate, $endDate, $status = null, $patientId) {
        $query = "SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.appointment_type,
            a.duration,
            p.full_name as patient_name, 
            p.cedula as patient_cedula,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name,
            ami.chief_complaint
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.appointment_date BETWEEN :start_date AND :end_date
        AND a.patient_id = :patient_id";

        $params = [
            ':start_date' => $startDate,
            ':end_date' => $endDate,
            ':patient_id' => $patientId
        ];

        if ($status && $status !== 'todos') {
            $query .= " AND a.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY a.appointment_date ASC, a.appointment_time ASC";

        return $this->db->query($query, $params);
    }

    public function getAdvancedStatistics($startDate, $endDate, $type) {
        $groupBy = '';
        $selectName = '';
        $join = '';

        switch ($type) {
            case 'specialty':
                $selectName = 'ms.name as name';
                $groupBy = 'a.specialty_id';
                $join = 'INNER JOIN medical_specialties ms ON a.specialty_id = ms.id';
                break;
            case 'doctor':
                $selectName = "CONCAT(u.first_name, ' ', u.last_name) as name";
                $groupBy = 'a.doctor_id';
                $join = 'INNER JOIN users u ON a.doctor_id = u.id';
                break;
            case 'patient':
                $selectName = 'p.full_name as name';
                $groupBy = 'a.patient_id';
                $join = 'INNER JOIN patients p ON a.patient_id = p.id';
                break;
            default:
                throw new Exception("Invalid statistics type");
        }

        $query = "SELECT 
            $selectName,
            COUNT(*) as total_appointments,
            SUM(CASE WHEN a.status = 'completada' THEN 1 ELSE 0 END) as completed_appointments,
            SUM(CASE WHEN a.status = 'cancelada' THEN 1 ELSE 0 END) as canceled_appointments,
            SUM(CASE WHEN a.status NOT IN ('completada', 'cancelada') THEN 1 ELSE 0 END) as other_appointments
        FROM appointments a
        $join
        WHERE a.appointment_date BETWEEN :start_date AND :end_date
        GROUP BY $groupBy
        ORDER BY total_appointments DESC";

        $params = [
            ':start_date' => $startDate,
            ':end_date' => $endDate
        ];

        return $this->db->query($query, $params);
    }

    public function getDailyAppointmentsByDoctor($doctorId, $date) {
        $query = "SELECT 
            a.*,
            p.full_name as patient_name, 
            p.cedula as patient_cedula, 
            p.phone as patient_phone,
            p.email as patient_email,
            ms.name as specialty_name,
            ami.chief_complaint, 
            ami.notes
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        LEFT JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.doctor_id = :doctor_id 
        AND a.appointment_date = :date
        ORDER BY a.appointment_time ASC";
        
        return $this->db->query($query, [
            ':doctor_id' => $doctorId,
            ':date' => $date
        ]);
    }
    
    public function validateAppointmentAvailability($data, $excludeId = null) {
        $errors = [];
        // Validar reglas aquí:

        $consultingRoomId = $data['consulting_room_id'] ?? $data['office_number'] ?? null;
        
        if(!$consultingRoomId) {
             $errors[] = "El consultorio es obligatorio";
        }
        
        $date = $data['appointment_date'];
        $time = $data['appointment_time'];
        $duration = $data['duration'] ?? 30;
        $doctorId = $data['doctor_id'] ?? null;
        $specialtyId = $data['specialty_id'] ?? null;

        if ($consultingRoomId) {
            // Verificar especialidad
            if ($specialtyId && !$this->checkRoomSpecialty($consultingRoomId, $specialtyId)) {
                $errors[] = "El consultorio seleccionado no admite la especialidad indicada.";
            }

            // Verificar disponibilidad horario consultorio
            if (!$this->isRoomAvailable($consultingRoomId, $date, $time, $duration, $excludeId)) {
                $errors[] = "El consultorio ya se encuentra ocupado en ese horario.";
            }
        }
        
        // Verificar disponibilidad de médico
        if ($doctorId && !$this->isDoctorAvailable($doctorId, $date, $time, $duration, $excludeId)) {
            $errors[] = "El médico no está disponible en esa fecha y hora";
        }

        return $errors; 
    }

    public function isRoomAvailable($roomId, $date, $time, $durationMinutes = 30, $excludeId = null) {
        // Calcular hora fin de la nueva cita
        $startTime = strtotime("$date $time");
        $endTime = $startTime + ($durationMinutes * 60);
        $endTimeFormatted = date('H:i:s', $endTime);

        $sql = "SELECT COUNT(*) as count FROM appointments 
                WHERE consulting_room_id = :room_id
                AND appointment_date = :date 
                AND status NOT IN ('cancelada', 'no_se_presento')
                AND (
                    (appointment_time < :end_time AND ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) > :start_time)
                )";
        
        $params = [
            ':room_id' => $roomId,
            ':date' => $date,
            ':end_time' => $endTimeFormatted,
            ':start_time' => $time
        ];

        if ($excludeId) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }

        $result = $this->db->query($sql, $params);

        return ($result[0]['count'] == 0);
    }

    public function checkRoomSpecialty($roomId, $specialtyId) {
        $sql = "SELECT COUNT(*) as count FROM room_specialties WHERE room_id = :room_id AND specialty_id = :specialty_id";
        $result = $this->db->query($sql, [':room_id' => $roomId, ':specialty_id' => $specialtyId]);
        return (!empty($result) && $result[0]['count'] > 0);
    }

}
