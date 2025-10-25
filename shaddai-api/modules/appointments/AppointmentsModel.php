<?php

require_once __DIR__ . '/../../config/Database.php';

class AppointmentsModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
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
            'office_number', 'specialty_id', 'duration', 'status', 'appointment_type', 'created_by'
        ];
        $values = [];
        foreach ($mainFields as $f) {
            if ($f === 'status') {
                $values[$f] = $data[$f] ?? 'programada'; 
            } elseif ($f === 'duration') {
                $values[$f] = $data[$f] ?? 30;
            } elseif ($f === 'appointment_type') {
                $values[$f] = $data[$f] ?? 'primera_vez';
            } else {
                $values[$f] = $data[$f] ?? null;
            }
        }

        $sql = "INSERT INTO appointments (
            patient_id, doctor_id, appointment_date, appointment_time, office_number,
            specialty_id, duration, status, appointment_type, created_by
        ) VALUES (
            :patient_id, :doctor_id, :appointment_date, :appointment_time, :office_number,
            :specialty_id, :duration, :status, :appointment_type, :created_by
        )";
        $params = [];
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

    public function getAllAppointments() {
        $query = "SELECT 
            a.*,
            ami.chief_complaint, ami.symptoms, ami.notes,
            p.full_name as patient_name, p.cedula as patient_cedula, p.phone as patient_phone,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name,
            CONCAT(uc.first_name, ' ', uc.last_name) as created_by_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
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
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name, u.cedula as doctor_cedula,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN appointment_medical_info ami ON a.id = ami.appointment_id
        WHERE a.id = :id";
        $params = [':id' => $id];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null;
    }


    public function getAppointmentsByDate($date) {
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

    public function updateAppointment($id, $data) {

        // Validar disponibilidad excluyendo la cita actual
        $errors = $this->validateAppointmentAvailability($data, $id);
        if (!empty($errors)) {
            throw new Exception(implode('. ', $errors));
        }
        
        $fields = [
            'patient_id', 'doctor_id', 'appointment_date', 'appointment_time',
            'office_number', 'specialty_id', 'duration', 'status', 'appointment_type'
        ];
        $set = [];
        $params = [];
        foreach ($fields as $f) {
            $set[] = "$f = :$f";
            $params[":$f"] = $data[$f];
        }
        $params[':id'] = $id;

        $sql = "UPDATE appointments SET " . implode(', ', $set) . " WHERE id = :id";
        $this->db->execute($sql, $params);

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
     * Validar disponibilidad completa antes de crear/actualizar cita
     */
    public function validateAppointmentAvailability($data, $excludeId = null) {
        $errors = [];
        
        // 1. Validar disponibilidad de consultorio
        if (!$this->isOfficeAvailable($data['appointment_date'], $data['appointment_time'], 
                                    $data['office_number'], $data['duration'] ?? 30, $excludeId)) {
            $errors[] = "El consultorio {$data['office_number']} no está disponible en esa fecha y hora";
        }
        
        // 2. Validar disponibilidad de médico
        if (!$this->isDoctorAvailable($data['doctor_id'], $data['appointment_date'], 
                                    $data['appointment_time'], $data['duration'] ?? 30, $excludeId)) {
            $errors[] = "El médico no está disponible en esa fecha y hora";
        }
        
        return $errors;
    }

    /**
     * Verificar disponibilidad de consultorio
     */
    public function isOfficeAvailable($date, $time, $officeNumber, $duration = 30, $excludeId = null) {
        $startTime = $time;
        $endTime = date('H:i:s', strtotime($time) + ($duration * 60));
        
        $query = "SELECT COUNT(*) as count FROM appointments 
                WHERE appointment_date = :date 
                AND office_number = :office_number 
                AND status NOT IN ('cancelada', 'no_se_presento')
                AND (
                    (appointment_time < :end_time AND ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) > :start_time)
                )";
        
        $params = [
            ':date' => $date,
            ':office_number' => $officeNumber,
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

        // Conteo de citas para hoy (todas sin importar estado)
        $todayAppointments = $this->db->query(
            "SELECT COUNT(*) AS c FROM appointments WHERE appointment_date = :today",
            [':today' => $today]
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
            'today_appointments'           => (int)($todayAppointments[0]['c'] ?? 0),
            'confirmed_appointments'   => (int)($confirmed[0]['c'] ?? 0),
            'canceled_appointments'    => (int)($canceled[0]['c'] ?? 0),
        ];
    }

    public function deleteAppointment($id) {
        $query = "DELETE FROM appointments WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }

    
}
