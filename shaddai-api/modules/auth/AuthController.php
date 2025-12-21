<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../../vendor/autoload.php';

require_once __DIR__ . '/AuthModel.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/../../services/EmailServive.php';

class AuthController {
    private $model;
    private $emailService;

    public function __construct() {
        $this->model = new AuthModel();
        $this->emailService = new EmailService();
    }

    // LOGIN
    public function login() {
        
        $data = $_POST;     
        $recaptchaToken = $data['recaptchaToken'] ?? ($data['recaptcha_token'] ?? null);
        $recaptchaResult = $this->verifyRecaptchaToken($recaptchaToken);
        if (!$recaptchaResult['valid']) {
            http_response_code($recaptchaResult['status']);
            echo json_encode(['error' => $recaptchaResult['message']]);
            return;
        }

        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Correo y contraseña son requeridos']);
            return;
        }

        $user = $this->model->findUserByEmailAnyStatus($data['email']);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Este correo no se encuentra registrado']);
            return;
        }

        if (!$user['active']) {
            http_response_code(403);
            echo json_encode(['error' => 'Este usuario está inactivo. Contacta al administrador.']);
            return;
        }

        if (!password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Contraseña incorrecta']);
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
            'exp' => time() + 86400 // 24 horas
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

    public function getRecaptchaSiteKey() {
        $siteKey = $_ENV['VITE_RECAPTCHA_SITE_KEY'] ?? ($_ENV['RECAPTCHA_SITE_KEY'] ?? null);
        if (!$siteKey) {
            http_response_code(404);
            echo json_encode(['error' => 'Clave pública de reCAPTCHA no configurada.']);
            return;
        }

        echo json_encode(['site_key' => $siteKey]);
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

    private function verifyRecaptchaToken(?string $token): array {
        $secret = $_ENV['RECAPTCHA_SECRET_KEY'] ?? null;
        if (!$secret) {
            error_log('RECAPTCHA_SECRET_KEY is not configured.');
            return [
                'valid' => false,
                'status' => 500,
                'message' => 'Error al verificar el reCAPTCHA.'
            ];
        }

        if (!$token) {
            return [
                'valid' => false,
                'status' => 400,
                'message' => 'Captcha requerido.'
            ];
        }

        $endpoint = 'https://www.google.com/recaptcha/api/siteverify';
        $payload = http_build_query([
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? null
        ]);

        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $payload,
                'timeout' => 5
            ]
        ]);

        $response = @file_get_contents($endpoint, false, $context);
        if ($response === false) {
            error_log('No response from reCAPTCHA verification endpoint.');
            return [
                'valid' => false,
                'status' => 500,
                'message' => 'Error al verificar el reCAPTCHA.'
            ];
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded) || empty($decoded['success'])) {
            if (!empty($decoded['error-codes'])) {
                error_log('reCAPTCHA error codes: ' . json_encode($decoded['error-codes']));
            }
            return [
                'valid' => false,
                'status' => 400,
                'message' => 'Captcha inválido, intenta nuevamente.'
            ];
        }

        return [
            'valid' => true,
            'status' => 200,
            'message' => ''
        ];
    }

    // GETPROFILE
    public function getProfile() {
        
        $payload = $_REQUEST['jwt_payload'] ?? null;
        
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            return;
        }
        
        $userProfile = $this->model->getUserProfile($payload->sub);
        
        if (!$userProfile) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado']);
            return;
        }

        // Esta lógica ya está en tu getUserProfile, pero la mantenemos por consistencia
        $roles = $this->model->getUserRoles($userProfile['id']);
        unset($userProfile['password']); 
        $userProfile['roles'] = array_column($roles, 'name');
        echo json_encode($userProfile);
    }
    
    // LISTSESSIONS
    public function listSessions() {
        $payload = $_REQUEST['jwt_payload'] ?? null;
        
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            return;
        }
        
        // Validar que tenga rol admin (Tu lógica existente)
        if (!in_array('admin', $payload->roles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado, solo admin pueder ver las sesiones']);
        }

        $sessions = $this->model->getAllSessions();
        echo json_encode($sessions);
    }


    // --- INICIO DE MÉTODOS PARA RESET DE CONTRASEÑA ---

    /**
     * Paso 1: Solicitar reseteo.
     * Recibe un JSON: { "email": "..." }
     * Usamos json_decode aquí
     */
    public function requestPasswordReset() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email inválido.']);
            return;
        }

        $user = $this->model->findUserByEmailAnyStatus($data->email);

        // Si no está registrado
        if (!$user) {
            http_response_code(200);
            echo json_encode(['message' => 'Este correo no está registrado.']);
            return;
        }

        // Si está registrado pero inactivo
        if (!$user['active']) {
            http_response_code(200);
            echo json_encode(['message' => 'Usuario inactivo. Contacta al administrador.']);
            return;
        }

        // --- Si el usuario es válido y activo, procedemos ---
        try {
            $token = bin2hex(random_bytes(32)); // El token que enviamos por email
            $hashed_token = hash('sha256', $token); // El token que guardamos en BD
            $expires_at = date('Y-m-d H:i:s', time() + 3600); // 1 hora de validez

            // Usamos el nuevo método del modelo
            $this->model->savePasswordResetToken($user['id'], $hashed_token, $expires_at);

            $resetLink = ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173') . "/reset-password/" . $token;
            $userName = $user['first_name'] . ' ' . $user['last_name'];

            // Usar EmailService para enviar el correo con la plantilla profesional
            $sent = $this->emailService->sendPasswordReset($user['email'], $userName, $resetLink);

            if ($sent) {
                http_response_code(200);
                echo json_encode(['message' => 'Se ha enviado un correo con instrucciones para restablecer la contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).']);
            } else {
                throw new Exception('No se pudo enviar el correo.');
            }

        } catch (Exception $e) {
            // Si falla el email, logueamos el error y devolvemos el mismo mensaje para el usuario
            error_log("PHPMailer Error: " . ($mail->ErrorInfo ?? $e->getMessage()));
            http_response_code(200);
            echo json_encode(['message' => 'Se ha enviado un correo con instrucciones para restablecer la contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).']);
        }
    }

    /**
     * Paso 2: Restablecer la contraseña.
     * Recibe un JSON: { "token": "...", "new_password": "..." }
     */
    public function resetPassword() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->token) || empty($data->new_password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Token y nueva contraseña son requeridos.']);
            return;
        }

        if (strlen($data->new_password) < 8) {
             http_response_code(400);
             echo json_encode(['error' => 'La contraseña debe tener al menos 8 caracteres.']);
             return;
        }

        $hashed_token = hash('sha256', $data->token);

        // Usamos el nuevo método del modelo
        $resetRequest = $this->model->findValidResetToken($hashed_token);

        if (!$resetRequest) {
            http_response_code(400);
            echo json_encode(['error' => 'Token inválido o expirado.']);
            return;
        }

        try {
            // Hasheamos la nueva contraseña
            $new_password_hash = password_hash($data->new_password, PASSWORD_DEFAULT);
            $user_id = $resetRequest['user_id'];

            // Actualizamos la contraseña del usuario
            $this->model->updateUserPassword($user_id, $new_password_hash);

            // Borramos el token para que no se reutilice
            $this->model->deleteResetToken($hashed_token);

            http_response_code(200);
            echo json_encode(['message' => 'Contraseña actualizada con éxito.']);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno del servidor.']);
            error_log('Error al resetear password: ' . $e->getMessage());
        }
    }
}
?>