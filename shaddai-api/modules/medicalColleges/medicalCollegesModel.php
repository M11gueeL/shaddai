<?php

require_once __DIR__ . '/../../config/Database.php';

class MedicalCollegesModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $query = "INSERT INTO medical_colleges(state_name, full_name, abbreviation) VALUES (:state_name, :full_name, :abbreviation)";       
        $params = [
            ':state_name' => $data['state_name'],
            ':full_name' => $data['full_name'],
            ':abbreviation' => $data['abbreviation']
        ];

        if ($this->db->execute($query, $params)) {
            return $this->db->lastInsertId(); // Esto devuelve el ID
        }
        return false;
    }

    public function update($id, $data) {
        $query = "UPDATE medical_colleges SET state_name = :state_name, full_name = :full_name, abbreviation = :abbreviation WHERE id = :id";
        $params = [
            ':state_name' => $data['state_name'],
            ':full_name' => $data['full_name'],
            ':abbreviation' => $data['abbreviation'],
            ':id' => $id
        ];
        return $this->db->execute($query, $params);
    }

    public function getAll() {
        $query = "SELECT * FROM medical_colleges";
        return $this->db->query($query);
    }

    public function getById($id) {
        $query = "SELECT * FROM medical_colleges WHERE id = :id";
        $params = [':id' => $id];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null; 
    }

    public function delete($id) {
        $query = "DELETE FROM medical_colleges WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }
}