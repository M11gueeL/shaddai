<?php

require_once __DIR__ . '/../../config/Database.php';

class ActivityModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getPatientsRegisteredToday($limit = 5) {
        $limit = (int)$limit;
        $sql = "SELECT id, full_name, created_at
                FROM patients
                WHERE DATE(created_at) = CURDATE()
                ORDER BY created_at DESC
                LIMIT $limit";
        return $this->db->query($sql);
    }

    public function getAppointmentsCreatedToday($limit = 5) {
        $limit = (int)$limit;
        $sql = "SELECT a.id,
                       a.created_at,
                       p.full_name AS patient_name,
                       CONCAT(u.first_name, ' ', u.last_name) AS doctor_name,
                       a.status
                FROM appointments a
                INNER JOIN patients p ON a.patient_id = p.id
                INNER JOIN users u ON a.doctor_id = u.id
                WHERE DATE(a.created_at) = CURDATE()
                ORDER BY a.created_at DESC
                LIMIT $limit";
        return $this->db->query($sql);
    }

    public function getAppointmentStatusChangesToday($limit = 5) {
        $limit = (int)$limit;
        $sql = "SELECT h.id AS history_id,
                       h.appointment_id,
                       h.new_status,
                       h.changed_at,
                       p.full_name AS patient_name,
                       CONCAT(u.first_name, ' ', u.last_name) AS doctor_name
                FROM appointment_status_history h
                INNER JOIN appointments a ON a.id = h.appointment_id
                INNER JOIN patients p ON a.patient_id = p.id
                INNER JOIN users u ON a.doctor_id = u.id
                WHERE DATE(h.changed_at) = CURDATE()
                ORDER BY h.changed_at DESC
                LIMIT $limit";
        return $this->db->query($sql);
    }

    /**
     * Build a unified activity feed for today and return the latest items.
     * We'll fetch slightly more from each source and then merge/sort/trim in PHP.
     */
    public function getTodayActivity($limit = 5) {
        // Fetch extra to allow fair merge
        $chunk = max(10, $limit * 3);
        $patients = $this->getPatientsRegisteredToday($chunk);
        $created  = $this->getAppointmentsCreatedToday($chunk);
        $status   = $this->getAppointmentStatusChangesToday($chunk);

        $items = [];

        foreach ($patients as $p) {
            $items[] = [
                'type' => 'patient_registered',
                'action' => 'Paciente registrado',
                'details' => $p['full_name'],
                'timestamp' => $p['created_at'],
                'meta' => [ 'patient_id' => (int)$p['id'] ]
            ];
        }

        foreach ($created as $a) {
            $items[] = [
                'type' => 'appointment_created',
                'action' => 'Cita agendada',
                'details' => $a['patient_name'] . ' - ' . $a['doctor_name'],
                'timestamp' => $a['created_at'],
                'meta' => [ 'appointment_id' => (int)$a['id'], 'status' => $a['status'] ]
            ];
        }

        foreach ($status as $s) {
            $label = $this->statusToLabel($s['new_status']);
            $items[] = [
                'type' => 'appointment_status',
                'action' => 'Cita ' . $label,
                'details' => $s['patient_name'] . ' - ' . $s['doctor_name'],
                'timestamp' => $s['changed_at'],
                'meta' => [
                    'appointment_id' => (int)$s['appointment_id'],
                    'new_status' => $s['new_status'],
                    'history_id' => (int)$s['history_id']
                ]
            ];
        }

        // Sort by timestamp DESC
        usort($items, function($a, $b) {
            return strtotime($b['timestamp']) <=> strtotime($a['timestamp']);
        });

        // Trim to requested limit
        return array_slice($items, 0, $limit);
    }

    private function statusToLabel($status) {
        $map = [
            'programada' => 'agendada',
            'confirmada' => 'confirmada',
            'en_progreso' => 'en progreso',
            'completada' => 'completada',
            'cancelada' => 'cancelada',
            'no_se_presento' => 'no se presentó'
        ];
        return $map[$status] ?? str_replace('_', ' ', $status);
    }
}
