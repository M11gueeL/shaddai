<?php

require_once __DIR__ . '/../../config/Database.php';

class UserModel {
    private $db; 

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Crear usuario y asignar roles / medical_info / medical_specialties según rol
    public function createUser($data) {
        try {
            $this->db->execute("START TRANSACTION");

            // Insertar en users
            $query = "INSERT INTO users (
                first_name, last_name, cedula, birth_date, gender, address,
                phone, email, password, created_by
            ) VALUES (
                :first_name, :last_name, :cedula, :birth_date, :gender, :address,
                :phone, :email, :password, :created_by
            )";

            $params = [
                ':first_name' => $data['first_name'],
                ':last_name' => $data['last_name'],
                ':cedula' => $data['cedula'],
                ':birth_date' => $data['birth_date'] ?? null,
                ':gender' => $data['gender'] ?? null,
                ':address' => $data['address'] ?? null,
                ':phone' => $data['phone'],
                ':email' => $data['email'],
                ':password' => password_hash($data['password'], PASSWORD_DEFAULT),
                ':created_by' => $data['created_by'] ?? null,
            ];

            $this->db->execute($query, $params);
            $userId = $this->db->lastInsertId();

            // Insertar roles en user_roles (puede tener varios)
            foreach ($data['roles'] as $roleId) {
                $this->db->execute(
                    "INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)",
                    [':user_id' => $userId, ':role_id' => $roleId]
                );
            }

            // Si es medico (role_id = 2), insertar en user_medical_info y user_specialties
            if (in_array(2, $data['roles'])) {
                // Validar que vengan los campos requeridos para medico
                if (empty($data['mpps_code']) || empty($data['medical_college_id']) || empty($data['college_code'])) {
                    throw new Exception('Faltan datos médicos requeridos para médico');
                }

                $this->db->execute(
                    "INSERT INTO user_medical_info (user_id, mpps_code, medical_college_id, college_code) 
                     VALUES (:user_id, :mpps_code, :medical_college_id, :college_code)",
                    [
                        ':user_id' => $userId,
                        ':mpps_code' => $data['mpps_code'],
                        ':medical_college_id' => $data['medical_college_id'],
                        ':college_code' => $data['college_code'],
                    ]
                );

                // Insertar especialidades médicas: array de specialty_id
                if (!empty($data['specialties']) && is_array($data['specialties'])) {
                    foreach ($data['specialties'] as $specialtyId) {
                        $this->db->execute(
                            "INSERT INTO user_specialties (user_id, specialty_id) VALUES (:user_id, :specialty_id)",
                            [':user_id' => $userId, ':specialty_id' => $specialtyId]
                        );
                    }
                }
            }

            $this->db->execute("COMMIT");
            return $userId;
        } catch (Exception $e) {
            $this->db->execute("ROLLBACK");
            throw $e;
        }
    }

    // Obtener todos los usuarios con roles y datos médicos si es medico
    public function getAllUsers() {
        $users = $this->db->query("SELECT id, first_name, last_name, cedula, birth_date, gender, address,
                phone, email, created_by, created_at, updated_at, active FROM users");

        // Traer roles para cada usuario
        foreach ($users as &$user) {
            $user['roles'] = $this->db->query(
                "SELECT r.id, r.name FROM roles r 
                JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = :user_id",
                [':user_id' => $user['id']]
            );

            // Si tiene rol medico (id=2), agregar medical_info y specialties
            $roleIds = array_column($user['roles'], 'id');
            if (in_array(2, $roleIds)) {
                $user['medical_info'] = $this->db->query(
                    "SELECT * FROM user_medical_info WHERE user_id = :user_id",
                    [':user_id' => $user['id']]
                )[0] ?? null;

                $user['specialties'] = $this->db->query(
                    "SELECT ms.id, ms.name FROM medical_specialties ms 
                     JOIN user_specialties us ON us.specialty_id = ms.id 
                     WHERE us.user_id = :user_id",
                     [':user_id' => $user['id']]
                );
            }
        }

        return $users;
    }

    // Obtener usuario por ID con roles y datos medicos (similar a getAll pero para un usuario)
    public function getUserById($id) {
        $user = $this->db->query("SELECT id, first_name, last_name, cedula, birth_date, gender, address,
                phone, email, created_by, created_at, updated_at, active FROM users WHERE id = :id", [':id' => $id]);
        if (empty($user)) return null;

        $user = $user[0];
        $user['roles'] = $this->db->query(
            "SELECT r.id, r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = :user_id",
            [':user_id' => $id]
        );

        $roleIds = array_column($user['roles'], 'id');
        if (in_array(2, $roleIds)) {
            $user['medical_info'] = $this->db->query("SELECT * FROM user_medical_info WHERE user_id = :user_id", [':user_id' => $id])[0] ?? null;

            $user['specialties'] = $this->db->query(
                "SELECT ms.id, ms.name FROM medical_specialties ms 
                 JOIN user_specialties us ON us.specialty_id = ms.id WHERE us.user_id = :user_id",
                 [':user_id' => $id]
            );
        }

        return $user;
    }

    // Actualizar usuario y roles / medical info / specialties
    public function updateUser($id, $data) {
        try {
            $this->db->execute("START TRANSACTION");

            // Actualizar tabla users (excepto password si no viene)
            $query = "UPDATE users SET 
                first_name = :first_name, last_name = :last_name, cedula = :cedula, 
                birth_date = :birth_date, gender = :gender, address = :address, 
                phone = :phone, email = :email";

            $params = [
                ':first_name' => $data['first_name'],
                ':last_name' => $data['last_name'],
                ':cedula' => $data['cedula'],
                ':birth_date' => $data['birth_date'] ?? null,
                ':gender' => $data['gender'] ?? null,
                ':address' => $data['address'] ?? null,
                ':phone' => $data['phone'],
                ':email' => $data['email'],
                ':id' => $id
            ];

            if (!empty($data['password'])) {
                $query .= ", password = :password";
                $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            $query .= " WHERE id = :id";

            $this->db->execute($query, $params);

            // Actualizar roles
            if (isset($data['roles']) && is_array($data['roles'])) {
                // Primero borrar roles viejos
                $this->db->execute("DELETE FROM user_roles WHERE user_id = :user_id", [':user_id' => $id]);

                // Insertar nuevos
                foreach ($data['roles'] as $roleId) {
                    $this->db->execute(
                        "INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)",
                        [':user_id' => $id, ':role_id' => $roleId]
                    );
                }
            }

            // Si el usuario es medico (rol_id=2)
            if (isset($data['roles']) && in_array(2, $data['roles'])) {
                // Update o insert medical_info
                $exists = $this->db->query("SELECT 1 FROM user_medical_info WHERE user_id = :user_id", [':user_id' => $id]);
                if ($exists) {
                    $this->db->execute(
                        "UPDATE user_medical_info SET
                        mpps_code = :mpps_code,
                        medical_college_id = :medical_college_id,
                        college_code = :college_code
                        WHERE user_id = :user_id",
                        [
                            ':mpps_code' => $data['mpps_code'],
                            ':medical_college_id' => $data['medical_college_id'],
                            ':college_code' => $data['college_code'],
                            ':user_id' => $id
                        ]
                    );
                } else {
                    $this->db->execute(
                        "INSERT INTO user_medical_info (user_id, mpps_code, medical_college_id, college_code) 
                        VALUES (:user_id, :mpps_code, :medical_college_id, :college_code)",
                        [
                            ':user_id' => $id,
                            ':mpps_code' => $data['mpps_code'],
                            ':medical_college_id' => $data['medical_college_id'],
                            ':college_code' => $data['college_code']
                        ]
                    );
                }

                // Actualizar specialties (borrar todas y agregar las nuevas)
                $this->db->execute("DELETE FROM user_specialties WHERE user_id = :user_id", [':user_id' => $id]);
                if (!empty($data['specialties']) && is_array($data['specialties'])) {
                    foreach ($data['specialties'] as $specialtyId) {
                        $this->db->execute(
                            "INSERT INTO user_specialties (user_id, specialty_id) VALUES (:user_id, :specialty_id)",
                            [':user_id' => $id, ':specialty_id' => $specialtyId]
                        );
                    }
                }
            } else {
                // Si ya no es medico, borrar info medica y specialties si existian
                $this->db->execute("DELETE FROM user_medical_info WHERE user_id = :user_id", [':user_id' => $id]);
                $this->db->execute("DELETE FROM user_specialties WHERE user_id = :user_id", [':user_id' => $id]);
            }

            $this->db->execute("COMMIT");
            return $this->getUserById($id);

        } catch (Exception $e) {
            $this->db->execute("ROLLBACK");
            throw $e;
        }
    }

    // Eliminar usuario y limpieza automática gracias a foreign keys ON DELETE CASCADE
    public function deleteUser($id) {
        return $this->db->execute("DELETE FROM users WHERE id = :id", [':id' => $id]);
    }

    public function findByCedula($cedula) {
        $query = "SELECT first_name, last_name, cedula, birth_date, gender, address,
                phone, email, created_by, created_at, updated_at, active FROM users WHERE cedula = :cedula";
        $params = [':cedula' => $cedula];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null;
    }

    public function findByEmail($email) {
        $query = "SELECT first_name, last_name, cedula, birth_date, gender, address,
                phone, email, created_by, created_at, updated_at, active FROM users WHERE email = :email";
        $params = [':email' => $email];
        $result = $this->db->query($query, $params);
        return !empty($result) ? $result[0] : null;
    }

    public function getDoctors() {
        $query = "SELECT u.id, u.first_name, u.last_name, u.cedula, u.birth_date, u.gender, u.address,
                u.phone, u.email, u.created_by, u.created_at, u.updated_at, u.active
                FROM users u
                JOIN user_roles ur ON u.id = ur.user_id
                WHERE ur.role_id = 2"; // role_id 2 es medico   
        $doctors = $this->db->query($query);
        foreach ($doctors as &$doctor) {
            // Traer medical_info
            $doctor['medical_info'] = $this->db->query(
                "SELECT * FROM user_medical_info WHERE user_id = :user_id",
                [':user_id' => $doctor['id']]
            )[0] ?? null;

            // Traer specialties
            $doctor['specialties'] = $this->db->query(
                "SELECT ms.id, ms.name FROM medical_specialties ms 
                 JOIN user_specialties us ON us.specialty_id = ms.id 
                 WHERE us.user_id = :user_id",
                 [':user_id' => $doctor['id']]
            );
        }
        return $doctors;
    }

    // Metodo para activar o desactivar un usuario
    public function toggleUserStatus($id) {
        try {
            $user = $this->getUserById($id);
            if (!$user) {
                throw new Exception('Usuario no encontrado');
            }

            // en la base de datos, el campo active es un booleano y por defecto es 1 (activo)
            $newStatus = $user['active'] ? 0 : 1; // si esta activo, lo desactivo y viceversa
            $this->db->execute("UPDATE users SET active = :active WHERE id = :id", [
                ':active' => $newStatus,
                ':id' => $id
            ]);
            return $newStatus ? 'Usuario activado' : 'Usuario desactivado';

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getUserActivityStats($userId) {
        // 1. Resumen general
        $sqlSummary = "SELECT 
                        COUNT(*) as total,
                        MAX(login_time) as last_login,
                        MIN(login_time) as first_login
                    FROM user_sessions 
                    WHERE user_id = :uid";
        
        $summaryResult = $this->db->query($sqlSummary, [':uid' => $userId]);
        $summary = $summaryResult[0] ?? [];

        // 2. Conteo del mes actual
        $sqlMonth = "SELECT COUNT(*) as month_count 
                    FROM user_sessions 
                    WHERE user_id = :uid 
                    AND MONTH(login_time) = MONTH(CURRENT_DATE())
                    AND YEAR(login_time) = YEAR(CURRENT_DATE())";
                    
        $monthResult = $this->db->query($sqlMonth, [':uid' => $userId]);
        $month = $monthResult[0] ?? [];

        // 3. Historial reciente (Últimas 5 sesiones)
        $sqlHistory = "SELECT ip_address, device_info, login_time, session_status 
                    FROM user_sessions 
                    WHERE user_id = :uid 
                    ORDER BY login_time DESC 
                    LIMIT 5";
                    
        $history = $this->db->query($sqlHistory, [':uid' => $userId]);

        return [
            "summary" => [
                "total" => $summary['total'] ?? 0,
                "last_login" => $summary['last_login'],
                "first_login" => $summary['first_login'],
                "month_count" => $month['month_count'] ?? 0
            ],
            "history" => $history
        ];
    }
        
}