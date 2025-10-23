<?php

require_once __DIR__ . '/../../config/Database.php';

class AppointmentsModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createAppointment($data) {
        $this->db->beginTransaction();

        $mainFields = [
            'patient_id', 'doctor_id', 'appointment_date', 'appointment_time',
            'office_number', 'specialty_id', 'duration', 'status', 'appointment_type', 'created_by'
        ];
        $values = [];
        foreach ($mainFields as $f) $values[$f] = $data[$f] ?? null;

        $sql = "INSERT INTO appointments (
            patient_id, doctor_id, appointment_date, appointment_time, office_number,
            specialty_id, duration, status, appointment_type, created_by
        ) VALUES (
            :patient_id, :doctor_id, :appointment_date, :appointment_time, :office_number,
            :specialty_id, :duration, :status, :appointment_type, :created_by
        )";
        $params = [];
        foreach ($mainFields as $f) $params[":$f"] = $values[$f];

        $result = $this->db->execute($sql, $params);
        if (!$result) { $this->db->rollBack(); return false; }
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

    public function deleteAppointment($id) {
        $query = "DELETE FROM appointments WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }

    
}
