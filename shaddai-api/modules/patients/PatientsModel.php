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

    /**
     * Búsqueda flexible de pacientes con filtros y límite
     * @param string $q Texto a buscar
     * @param array $fields Campos permitidos: id, cedula, full_name, phone, email
     * @param string|null $dob Fecha de nacimiento exacta YYYY-MM-DD
     * @param int $limit Límite de resultados (máx 50)
     */
    public function searchPatients($q, $fields = [], $dob = null, $limit = 10) {
        $allowed = ['id', 'cedula', 'full_name', 'phone', 'email'];
        $activeFields = array_values(array_intersect($fields, $allowed));
        if (empty($activeFields)) {
            $activeFields = ['cedula', 'full_name'];
        }

        $where = [];
        $params = [];

        $q = trim((string)$q);
        if ($q !== '') {
            $like = $q . '%';
            $likeAny = '%' . $q . '%';

            foreach ($activeFields as $f) {
                switch ($f) {
                    case 'id':
                        if (ctype_digit($q)) {
                            $where[] = 'id = :id_exact';
                            $params[':id_exact'] = (int)$q;
                        }
                        break;
                    case 'cedula':
                        $where[] = 'cedula LIKE :cedula_like';
                        $params[':cedula_like'] = $like;
                        break;
                    case 'full_name':
                        $where[] = 'full_name LIKE :name_like';
                        $params[':name_like'] = $likeAny;
                        break;
                    case 'phone':
                        $where[] = 'phone LIKE :phone_like';
                        $params[':phone_like'] = $like;
                        break;
                    case 'email':
                        $where[] = 'email LIKE :email_like';
                        $params[':email_like'] = $likeAny;
                        break;
                }
            }
        }

        if (!empty($dob)) {
            $where[] = 'birth_date = :dob';
            $params[':dob'] = $dob;
        }

        $sql = 'SELECT id, full_name, cedula, birth_date, phone, email FROM patients';
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' OR ', $where);
        }
        // Nota: en ausencia de created_at, ordena por id desc para recientes
        $sql .= ' ORDER BY id DESC LIMIT ' . intval($limit);

        return $this->db->query($sql, $params);
    }

}