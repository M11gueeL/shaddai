<?php

require_once __DIR__ . '/../../config/Database.php';

class SpecialtiesModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $query = "INSERT INTO medical_specialties (name) VALUES (:name)";
        $params = [':name' => $data['name']];

        if ($this->db->execute($query, $params)) {
            return $this->db->lastInsertId(); 
        }
        return false;
    }

    public function update($id, $data) {
        $query = "UPDATE medical_specialties SET name = :name WHERE id = :id";
        $params = [
            ':name' => $data['name'],
            ':id' => $id
        ];
        return $this->db->execute($query, $params);
    }

    public function getAll() {
        $query = "SELECT * FROM medical_specialties ORDER BY id ASC";
        return $this->db->query($query);
    }

    public function getById($id) {
        $query = "SELECT * FROM medical_specialties WHERE id = :id";
        $params = [':id' => $id];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null; 
    }

    // Metodo para obtener las especialidades de un medico, cometiste un error, es la tabla users y user_specialties
    public function getEspecialtiesByDoctorId($doctorId) {
        $query = "SELECT ms.* FROM medical_specialties ms
                  INNER JOIN user_specialties us ON ms.id = us.specialty_id
                  WHERE us.user_id = :doctor_id";
        $params = [':doctor_id' => $doctorId];
        return $this->db->query($query, $params);
    }

    public function delete($id) {
        $query = "DELETE FROM medical_specialties WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }
}