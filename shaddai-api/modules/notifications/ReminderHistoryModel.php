<?php
require_once __DIR__ . '/../../config/Database.php';

class ReminderHistoryModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll() {
        // Obtenemos el log uniendo con paciente, médico, especialidad y la regla de notificación usada
        $sql = "
            SELECT 
                log.id as log_id,
                log.sent_at,
                p.full_name as patient_name,
                p.email as patient_email,
                p.phone as patient_phone,
                CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
                s.name as specialty_name,
                a.appointment_date,
                a.appointment_time,
                r.name as rule_name,
                r.minutes_before
            FROM appointment_notifications_log log
            INNER JOIN appointments a ON log.appointment_id = a.id
            INNER JOIN patients p ON a.patient_id = p.id
            INNER JOIN users u ON a.doctor_id = u.id
            INNER JOIN medical_specialties s ON a.specialty_id = s.id
            INNER JOIN notification_rules r ON log.rule_id = r.id
            ORDER BY log.sent_at DESC
        ";
        
        return $this->db->query($sql);
    }
}
