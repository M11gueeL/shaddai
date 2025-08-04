<?php

require_once __DIR__ . '/../../config/Database.php';

class PatientsModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createPatient($data) {
        $query = "INSERT INTO patients (
            full_name,
            cedula,
            birth_date,
            gender,
            marital_status,
            address,
            phone,
            email,
            created_by
            ) VALUES (
            :full_name,
            :cedula,    
            :birth_date,
            :gender,
            :marital_status,
            :address,
            :phone,
            :email,
            :created_by
            )";

        $params = [
            ':full_name' => $data['full_name'],
            ':cedula' => $data['cedula'],
            ':birth_date' => $data['birth_date'],
            ':gender' => $data['gender'],
            ':marital_status' => $data['marital_status'],
            ':address' => $data['address'],
            ':phone' => $data['phone'],
            ':email' => $data['email'],
            ':created_by' => $data['created_by']
        ];

        return $this->db->execute($query, $params);
    }

    public function getAllPatients() {
        $query = "SELECT * FROM patients";
        return $this->db->query($query);
    }
    
    public function getPatientById($id) {
        $query = "SELECT * FROM patients WHERE id = :id";
        $params = [':id' => $id];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null;
    }
    
    public function findPatientByCedula($cedula) {
        $query = "SELECT * FROM patients WHERE cedula = :cedula";
        $params = [':cedula' => $cedula];
        $result = $this->db->query($query, $params);
        return $result[0] ?? null;
    }

    public function updatePatient($id, $data) {
        $query = "UPDATE patients SET
                    full_name = :full_name,
                    cedula = :cedula,
                    birth_date = :birth_date,
                    gender = :gender,
                    marital_status = :marital_status,
                    address = :address,
                    phone = :phone,
                    email = :email
                  WHERE id = :id";

        $params = [
            ':full_name' => $data['full_name'],
            ':cedula' => $data['cedula'],
            ':birth_date' => $data['birth_date'],
            ':gender' => $data['gender'],
            ':marital_status' => $data['marital_status'],
            ':address' => $data['address'],
            ':phone' => $data['phone'],
            ':email' => $data['email'],
            ':id' => $id
        ];

        return $this->db->execute($query, $params);
    }

    public function deletePatient($id) {
        $query = "DELETE FROM patients WHERE id = :id";
        $params = [':id' => $id];
        return $this->db->execute($query, $params);
    }
    

}