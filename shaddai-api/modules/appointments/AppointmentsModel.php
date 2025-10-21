<?php

require_once __DIR__ . '/../../config/Database.php';

class AppointmentsModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createAppointment($data) {
        try {
            $this->db->execute("START TRANSACTION");

            $query = "INSERT INTO appointments (
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                office_number,
                specialty_id,
                duration,
                status,
                appointment_type,
                chief_complaint,
                symptoms,
                notes,
                created_by
            ) VALUES (
                :patient_id,
                :doctor_id,
                :appointment_date,
                :appointment_time,
                :office_number,
                :specialty_id,
                :duration,
                :status,
                :appointment_type,
                :chief_complaint,
                :symptoms,
                :notes,
                :created_by
            )";

            $params = [
                ':patient_id' => $data['patient_id'],
                ':doctor_id' => $data['doctor_id'],
                ':appointment_date' => $data['appointment_date'],
                ':appointment_time' => $data['appointment_time'],
                ':office_number' => $data['office_number'],
                ':specialty_id' => $data['specialty_id'],
                ':duration' => $data['duration'] ?? 30,
                ':status' => $data['status'] ?? 'programada',
                ':appointment_type' => $data['appointment_type'] ?? 'primera_vez',
                ':chief_complaint' => $data['chief_complaint'] ?? null,
                ':symptoms' => $data['symptoms'] ?? null,
                ':notes' => $data['notes'] ?? null,
                ':created_by' => $data['created_by']
            ];

            $this->db->execute($query, $params);
            $appointmentId = $this->db->lastInsertId();

            $this->db->execute("COMMIT");
            return $appointmentId;

        } catch (Exception $e) {
            $this->db->execute("ROLLBACK");
            throw $e;
        }
    }

    public function getAllAppointments() {
        $query = "SELECT 
            a.*,
            p.full_name as patient_name,
            p.cedula as patient_cedula,
            p.phone as patient_phone,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name,
            CONCAT(uc.first_name, ' ', uc.last_name) as created_by_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN users uc ON a.created_by = uc.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        return $this->db->query($query);
    }

    public function getAppointmentById($id) {
        $query = "SELECT 
            a.*,
            p.full_name as patient_name,
            p.cedula as patient_cedula,
            p.phone as patient_phone,
            p.email as patient_email,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            u.cedula as doctor_cedula,
            ms.name as specialty_name,
            CONCAT(uc.first_name, ' ', uc.last_name) as created_by_name,
            CONCAT(uconf.first_name, ' ', uconf.last_name) as confirmed_by_name,
            CONCAT(ucanc.first_name, ' ', ucanc.last_name) as cancelled_by_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        LEFT JOIN users uc ON a.created_by = uc.id
        LEFT JOIN users uconf ON a.confirmed_by = uconf.id
        LEFT JOIN users ucanc ON a.cancelled_by = ucanc.id
        WHERE a.id = :id";

        $params = [':id' => $id];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null;
    }

    public function getAppointmentsByDate($date) {
        $query = "SELECT 
            a.*,
            p.full_name as patient_name,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        WHERE a.appointment_date = :date
        ORDER BY a.appointment_time ASC";

        $params = [':date' => $date];
        return $this->db->query($query, $params);
    }

    public function getAppointmentsByDoctor($doctorId, $date = null) {
        $query = "SELECT 
            a.*,
            p.full_name as patient_name,
            p.phone as patient_phone,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        WHERE a.doctor_id = :doctor_id";

        $params = [':doctor_id' => $doctorId];

        if ($date) {
            $query .= " AND a.appointment_date = :date";
            $params[':date'] = $date;
        }

        $query .= " ORDER BY a.appointment_date DESC, a.appointment_time ASC";

        return $this->db->query($query, $params);
    }

    public function getAppointmentsByPatient($patientId) {
        $query = "SELECT 
            a.*,
            CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
            ms.name as specialty_name
        FROM appointments a
        INNER JOIN users u ON a.doctor_id = u.id
        INNER JOIN medical_specialties ms ON a.specialty_id = ms.id
        WHERE a.patient_id = :patient_id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        $params = [':patient_id' => $patientId];
        return $this->db->query($query, $params);
    }

    public function updateAppointment($id, $data) {
        $query = "UPDATE appointments SET
            patient_id = :patient_id,
            doctor_id = :doctor_id,
            appointment_date = :appointment_date,
            appointment_time = :appointment_time,
            office_number = :office_number,
            specialty_id = :specialty_id,
            duration = :duration,
            status = :status,
            appointment_type = :appointment_type,
            chief_complaint = :chief_complaint,
            symptoms = :symptoms,
            notes = :notes
        WHERE id = :id";

        $params = [
            ':patient_id' => $data['patient_id'],
            ':doctor_id' => $data['doctor_id'],
            ':appointment_date' => $data['appointment_date'],
            ':appointment_time' => $data['appointment_time'],
            ':office_number' => $data['office_number'],
            ':specialty_id' => $data['specialty_id'],
            ':duration' => $data['duration'] ?? 30,
            ':status' => $data['status'],
            ':appointment_type' => $data['appointment_type'],
            ':chief_complaint' => $data['chief_complaint'] ?? null,
            ':symptoms' => $data['symptoms'] ?? null,
            ':notes' => $data['notes'] ?? null,
            ':id' => $id
        ];

        return $this->db->execute($query, $params);
    }

    public function confirmAppointment($id, $confirmedBy) {
        $query = "UPDATE appointments SET
            status = 'confirmada',
            confirmed_by = :confirmed_by,
            confirmation_date = NOW()
        WHERE id = :id";

        $params = [
            ':confirmed_by' => $confirmedBy,
            ':id' => $id
        ];

        return $this->db->execute($query, $params);
    }

    public function cancelAppointment($id, $cancelledBy, $reason = null) {
        $query = "UPDATE appointments SET
            status = 'cancelada',
            cancelled_by = :cancelled_by,
            cancellation_reason = :reason
        WHERE id = :id";

        $params = [
            ':cancelled_by' => $cancelledBy,
            ':reason' => $reason,
            ':id' => $id
        ];

        return $this->db->execute($query, $params);
    }

    public function updateAppointmentStatus($id, $status) {
        $validStatuses = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_se_presento'];
        
        if (!in_array($status, $validStatuses)) {
            throw new Exception('Estado de cita inválido');
        }

        $query = "UPDATE appointments SET status = :status WHERE id = :id";
        $params = [':status' => $status, ':id' => $id];
        
        return $this->db->execute($query, $params);
    }

    public function sendReminder($id, $reminderDate) {
        $query = "UPDATE appointments SET
            reminder_sent = 1,
            reminder_date = :reminder_date
        WHERE id = :id";

        $params = [
            ':reminder_date' => $reminderDate,
            ':id' => $id
        ];

        return $this->db->execute($query, $params);
    }

    public function deleteAppointment($id) {
        $query = "DELETE FROM appointments WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }

    // Validar disponibilidad de consultorio
    public function isOfficeAvailable($date, $time, $officeNumber, $duration = 30, $excludeId = null) {
        $endTime = date('H:i:s', strtotime($time) + ($duration * 60));
        
        $query = "SELECT COUNT(*) as count FROM appointments 
                 WHERE appointment_date = :date 
                 AND office_number = :office_number 
                 AND status NOT IN ('cancelada', 'no_se_presento')
                 AND (
                     (appointment_time <= :time AND DATE_ADD(CONCAT(appointment_date, ' ', appointment_time), INTERVAL duration MINUTE) > :time)
                     OR 
                     (appointment_time < :end_time AND appointment_time >= :time)
                 )";

        $params = [
            ':date' => $date,
            ':office_number' => $officeNumber,
            ':time' => $time,
            ':end_time' => $endTime
        ];

        if ($excludeId) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }

        $result = $this->db->query($query, $params);
        return $result[0]['count'] == 0;
    }

    // Validar disponibilidad de médico
    public function isDoctorAvailable($doctorId, $date, $time, $duration = 30, $excludeId = null) {
        $endTime = date('H:i:s', strtotime($time) + ($duration * 60));
        
        $query = "SELECT COUNT(*) as count FROM appointments 
                 WHERE doctor_id = :doctor_id 
                 AND appointment_date = :date 
                 AND status NOT IN ('cancelada', 'no_se_presento')
                 AND (
                     (appointment_time <= :time AND DATE_ADD(CONCAT(appointment_date, ' ', appointment_time), INTERVAL duration MINUTE) > :time)
                     OR 
                     (appointment_time < :end_time AND appointment_time >= :time)
                 )";

        $params = [
            ':doctor_id' => $doctorId,
            ':date' => $date,
            ':time' => $time,
            ':end_time' => $endTime
        ];

        if ($excludeId) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }

        $result = $this->db->query($query, $params);
        return $result[0]['count'] == 0;
    }
}
