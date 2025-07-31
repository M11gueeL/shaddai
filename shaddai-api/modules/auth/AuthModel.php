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
}
