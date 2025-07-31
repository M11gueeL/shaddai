<?php
require_once __DIR__ . '/AuthModel.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController {
    private $model;

    public function __construct() {
        $this->model = new AuthModel();
    }

    // LOGIN
    public function login() {
        $data = $_POST;
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email y password requeridos']);
            return;
        }
        $user = $this->model->findUserByEmail($data['email']);
        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales inválidas']);
            return;
        }
        // Generar payload del JWT
        $roles = $this->model->getUserRoles($user['id']);
        $roleNames = array_column($roles, 'name');

        $payload = [
            'sub' => $user['id'],
            'email' => $user['email'],
            'roles' => $roleNames,
            'iat' => time(),
            'exp' => time() + 3600
        ];
        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        // Guardar sesión
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $device = $_SERVER['HTTP_USER_AGENT'] ?? null;
        $sessionId = $this->model->saveSession($user['id'], $jwt, $ip, $device);

        echo json_encode([
            'token' => $jwt,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'roles' => $roleNames
            ],
            'session_id' => $sessionId
        ]);
    }

    // LOGOUT
    public function logout() {
        $headers = getallheaders();
        $token = null;
        if (isset($headers['Authorization']) && preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            $token = $matches[1];
        }
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Token requerido']);
            return;
        }
        $result = $this->model->closeSession($token);
        echo json_encode(['message' => $result ? 'Sesión cerrada' : 'No se pudo cerrar sesión, ya estaba cerrada o token inválido']);
    }

    // PERFIL DEL USUARIO (requiere middleware)
    public function getProfile() {
        $payload = $_REQUEST['jwt_payload'] ?? null;
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            return;
        }
        $user = $this->model->findUserByEmail($payload->email);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado']);
            return;
        }
        $roles = $this->model->getUserRoles($user['id']);
        unset($user['password']);
        $user['roles'] = array_column($roles, 'name');
        echo json_encode($user);
    }

    // LISTAR SESIONES ACTIVAS DEL USUARIO (requiere middleware)
    public function listSessions() {
        $payload = $_REQUEST['jwt_payload'] ?? null;
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            return;
        }
        $sessions = $this->model->getSessions($payload->sub);
        echo json_encode($sessions);
    }
}
