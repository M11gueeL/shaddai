<?php

require_once __DIR__ . '/../../config/Database.php';

class MedicalSchedulesModel {
    private $db;
    private $tableName = 'medical_preferred_schedules';

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Crea un nuevo registro de horario preferido.
     * @param array $data Datos del horario (medical_id, day_of_week, start_time, end_time, notes)
     * @return int|false El ID del nuevo registro o false en caso de error.
     */
    public function create($data) {
        $query = "INSERT INTO {$this->tableName} (
                    medical_id, day_of_week, start_time, end_time, notes
                  ) VALUES (
                    :medical_id, :day_of_week, :start_time, :end_time, :notes
                  )";
        $params = [
            ':medical_id' => $data['medical_id'],
            ':day_of_week' => $data['day_of_week'],
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time'],
            ':notes' => $data['notes'] ?? null
        ];

        if ($this->db->execute($query, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Obtiene todos los horarios preferidos, opcionalmente filtrados por médico.
     * @param int|null $medicalId ID del médico para filtrar (opcional).
     * @return array Lista de horarios.
     */
    public function getAll($medicalId = null) {
        $query = "SELECT mps.*, CONCAT(u.first_name, ' ', u.last_name) as medical_name
                  FROM {$this->tableName} mps
                  JOIN users u ON mps.medical_id = u.id";
        $params = [];

        if ($medicalId !== null) {
            $query .= " WHERE mps.medical_id = :medical_id";
            $params[':medical_id'] = $medicalId;
        }

        $query .= " ORDER BY mps.medical_id, mps.day_of_week, mps.start_time";

        return $this->db->query($query, $params);
    }

    /**
     * Obtiene un horario preferido específico por su ID.
     * @param int $id ID del registro de horario.
     * @return array|null El horario encontrado o null si no existe.
     */
    public function getById($id) {
        $query = "SELECT mps.*, CONCAT(u.first_name, ' ', u.last_name) as medical_name
                  FROM {$this->tableName} mps
                  JOIN users u ON mps.medical_id = u.id
                  WHERE mps.id = :id";
        $params = [':id' => $id];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null;
    }

    /**
     * Método que obtiene los horarios preferidos de un médico específico.
     * @param int $medicalId ID del médico.
     * @return array Lista de horarios preferidos del médico.
     */
    public function getByMedicalId($medicalId) {
        $query = "SELECT mps.*, CONCAT(u.first_name, ' ', u.last_name) as medical_name
                  FROM {$this->tableName} mps
                  JOIN users u ON mps.medical_id = u.id
                  WHERE mps.medical_id = :medical_id
                  ORDER BY mps.day_of_week, mps.start_time";
        $params = [':medical_id' => $medicalId];
        return $this->db->query($query, $params);
    }

    /**
     * Actualiza un registro de horario preferido.
     * @param int $id ID del horario a actualizar.
     * @param array $data Nuevos datos del horario.
     * @return bool True si la actualización fue exitosa, false en caso contrario.
     */
    public function update($id, $data) {
        $query = "UPDATE {$this->tableName} SET
                    medical_id = :medical_id,
                    day_of_week = :day_of_week,
                    start_time = :start_time,
                    end_time = :end_time,
                    notes = :notes
                  WHERE id = :id";
        $params = [
            ':medical_id' => $data['medical_id'],
            ':day_of_week' => $data['day_of_week'],
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time'],
            ':notes' => $data['notes'] ?? null,
            ':id' => $id
        ];
        return $this->db->execute($query, $params);
    }

    private function normalizeTime($value) {
        if ($value === null) {
            return null;
        }
        $value = trim((string)$value);
        if (preg_match('/^\d{2}:\d{2}$/', $value)) {
            return $value . ':00';
        }
        return $value;
    }

    private function timeToSeconds($time) {
        $parts = explode(':', $time);
        if (count($parts) < 2) return null;
        $h = (int)$parts[0];
        $m = (int)$parts[1];
        $s = isset($parts[2]) ? (int)$parts[2] : 0;
        return ($h * 3600) + ($m * 60) + $s;
    }

    private function existsSameStart($medicalId, $dayOfWeek, $startTime, $excludeId = null) {
        $query = "SELECT id FROM {$this->tableName}
                  WHERE medical_id = :medical_id
                    AND day_of_week = :day_of_week
                    AND start_time = :start_time";
        $params = [
            ':medical_id' => $medicalId,
            ':day_of_week' => $dayOfWeek,
            ':start_time' => $startTime
        ];

        if ($excludeId !== null) {
            $query .= " AND id <> :exclude_id";
            $params[':exclude_id'] = (int)$excludeId;
        }

        $query .= ' LIMIT 1';
        $result = $this->db->query($query, $params);
        return !empty($result);
    }

    private function hasOverlap($medicalId, $dayOfWeek, $startTime, $endTime, $excludeId = null) {
        $query = "SELECT id FROM {$this->tableName}
                  WHERE medical_id = :medical_id
                    AND day_of_week = :day_of_week
                    AND start_time < :end_time
                    AND end_time > :start_time";
        $params = [
            ':medical_id' => $medicalId,
            ':day_of_week' => $dayOfWeek,
            ':start_time' => $startTime,
            ':end_time' => $endTime
        ];

        if ($excludeId !== null) {
            $query .= " AND id <> :exclude_id";
            $params[':exclude_id'] = (int)$excludeId;
        }

        $query .= ' LIMIT 1';
        $result = $this->db->query($query, $params);
        return !empty($result);
    }

    /**
     * Elimina un registro de horario preferido por su ID.
     * @param int $id ID del horario a eliminar.
     * @return bool True si la eliminación fue exitosa, false en caso contrario.
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->tableName} WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }

     /**
     * Valida que los datos básicos para crear/actualizar un horario estén presentes.
     * @param array $data Datos del horario.
     * @throws Exception Si falta algún campo requerido.
     */
    public function validateData($data, $excludeId = null) {
        $requiredFields = ['medical_id', 'day_of_week', 'start_time', 'end_time'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new Exception("El campo '$field' es obligatorio.");
            }
        }

        // Validación adicional (opcional)
        if (!is_numeric($data['day_of_week']) || $data['day_of_week'] < 1 || $data['day_of_week'] > 7) {
             throw new Exception("El campo 'day_of_week' debe ser un número entre 1 y 7.");
        }
        $startTime = $this->normalizeTime($data['start_time']);
        $endTime = $this->normalizeTime($data['end_time']);

        if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', (string)$startTime)) {
            throw new Exception('La hora de inicio tiene un formato inválido. Use HH:MM.');
        }
        if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', (string)$endTime)) {
            throw new Exception('La hora de fin tiene un formato inválido. Use HH:MM.');
        }

        $startSeconds = $this->timeToSeconds($startTime);
        $endSeconds = $this->timeToSeconds($endTime);

        if ($startSeconds === null || $endSeconds === null) {
            throw new Exception('No se pudo interpretar el rango horario.');
        }

        if ($endSeconds <= $startSeconds) {
            throw new Exception('La hora de fin debe ser mayor que la hora de inicio.');
        }

        if (($endSeconds - $startSeconds) < 900) {
            throw new Exception('El horario debe tener una duración mínima de 15 minutos.');
        }

        $medicalId = (int)$data['medical_id'];
        $dayOfWeek = (int)$data['day_of_week'];

        if ($this->existsSameStart($medicalId, $dayOfWeek, $startTime, $excludeId)) {
            throw new Exception('Ya existe un horario para este médico, día y hora de inicio.');
        }

        if ($this->hasOverlap($medicalId, $dayOfWeek, $startTime, $endTime, $excludeId)) {
            throw new Exception('El rango horario se solapa con otro horario existente del médico en ese día.');
        }

        $data['start_time'] = $startTime;
        $data['end_time'] = $endTime;
    }
}
?>