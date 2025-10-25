<?php

require_once __DIR__ . '/../../config/Database.php';

class AuthModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function findUserByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = :email AND active = 1";
        $params = [':email' => $email];
        $users = $this->db->query($sql, $params);
        return $users[0] ?? null;
    }

    public function findUserByEmailAnyStatus($email) {
        $sql = "SELECT * FROM users WHERE email = :email";
        $params = [':email' => $email];
        $users = $this->db->query($sql, $params);
        return $users[0] ?? null;
    }

    public function getUserRoles($userId) {
        $sql = "SELECT r.name FROM roles r 
                INNER JOIN user_roles ur ON ur.role_id = r.id
                WHERE ur.user_id = :user_id";
        return $this->db->query($sql, [':user_id' => $userId]);
    }

    public function saveSession($userId, $token, $ip, $device) {
        $sessionId = bin2hex(random_bytes(32));
        $loginTime = date('Y-m-d H:i:s');
        $sql = "INSERT INTO user_sessions (id, user_id, ip_address, device_info, login_time, session_status, token)
                VALUES (:id, :user_id, :ip, :device, :login_time, 'active', :token)";
        $this->db->execute($sql, [
            ':id' => $sessionId,
            ':user_id' => $userId,
            ':ip' => $ip,
            ':device' => $device,
            ':login_time' => $loginTime,
            ':token' => $token
        ]);
        return $sessionId;
    }

    public function closeSession($token) {
        $sql = "UPDATE user_sessions SET session_status = 'closed', logout_time = NOW() WHERE token = :token AND session_status = 'active'";
        return $this->db->execute($sql, [':token' => $token]);
    }

    public function getSessions($userId) {
        $sql = "SELECT * FROM user_sessions WHERE user_id = :user_id ORDER BY login_time DESC";
        return $this->db->query($sql, [':user_id' => $userId]);
    }

    public function getAllSessions() {
        $sql = "SELECT us.*,
                       u.email 
                FROM user_sessions us
                JOIN users u ON us.user_id = u.id
                ORDER BY us.login_time DESC";
        return $this->db->query($sql);
    }

    public function getUserProfile($userId) {
        $user = $this->db->query(
            "SELECT id, first_name, last_name, cedula, birth_date, gender, address,
                    phone, email, created_by, created_at, updated_at, active
             FROM users WHERE id = :id",
            [':id' => $userId]
        );

        if (empty($user)) return null;

        $user = $user[0];

        // Traer roles del usuario
        $roles = $this->db->query(
            "SELECT r.id, r.name FROM roles r 
            JOIN user_roles ur ON ur.role_id = r.id 
            WHERE ur.user_id = :user_id",
            [':user_id' => $userId]
        );
        $user['roles'] = array_column($roles, 'name');

        // Si es medico (asumiendo rol id 2)
        $roleIds = array_column($roles, 'id');
        if (in_array(2, $roleIds)) {
            // Incluir datos del colegio médico (nombre, siglas, estado)
            $user['medical_info'] = $this->db->query(
                "SELECT umi.user_id, umi.mpps_code, umi.medical_college_id, umi.college_code,
                        mc.full_name AS college_full_name,
                        mc.abbreviation AS college_abbreviation,
                        mc.state_name AS college_state
                 FROM user_medical_info umi
                 LEFT JOIN medical_colleges mc ON mc.id = umi.medical_college_id
                 WHERE umi.user_id = :user_id",
                [':user_id' => $userId]
            )[0] ?? null;

            $user['specialties'] = $this->db->query(
                "SELECT ms.id, ms.name FROM medical_specialties ms 
                JOIN user_specialties us ON us.specialty_id = ms.id 
                WHERE us.user_id = :user_id",
                [':user_id' => $userId]
            );
        }

        unset($user['password']);
        return $user;
    }


    // --- INICIO DE MÉTODOS PARA RESET DE CONTRASEÑA ---

    /**
     * Guarda un token de reseteo en la nueva tabla 'password_resets'.
     */
    public function savePasswordResetToken($user_id, $hashed_token, $expires_at) {
        $sql = "INSERT INTO password_resets (user_id, token, expires_at)
                VALUES (:user_id, :token, :expires_at)";
        
        $params = [
            ':user_id' => $user_id,
            ':token' => $hashed_token,
            ':expires_at' => $expires_at
        ];
        
        return $this->db->execute($sql, $params);
    }

    /**
     * Busca un token de reseteo válido por su HASH.
     */
    public function findValidResetToken($hashed_token) {
        $sql = "SELECT * FROM password_resets 
                WHERE token = :token AND expires_at > NOW() 
                LIMIT 1";
        
        $params = [':token' => $hashed_token];
        $result = $this->db->query($sql, $params);
        
        return $result[0] ?? null;
    }

    /**
     * Actualiza la contraseña del usuario en la tabla 'users'.
     */
    public function updateUserPassword($user_id, $new_password_hash) {
        $sql = "UPDATE users SET password = :password WHERE id = :id";
        
        $params = [
            ':password' => $new_password_hash,
            ':id' => $user_id
        ];
        
        return $this->db->execute($sql, $params);
    }

    /**
     * Elimina un token de reseteo después de ser usado.
     */
    public function deleteResetToken($hashed_token) {
        $sql = "DELETE FROM password_resets WHERE token = :token";
        $params = [':token' => $hashed_token];
        return $this->db->execute($sql, $params);
    }
}
?>