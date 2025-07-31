<?php

namespace Middlewares;

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class AuthMiddleware {
    public function handle() {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Token JWT requerido']);
            exit();
        }

        $authHeader = $headers['Authorization'];
        // Esperamos formato "Bearer token"
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Formato de token inválido']);
            exit();
        }

        try {
            $secret = $_ENV['JWT_SECRET'];
            $decoded = JWT::decode($jwt, new Key($secret, 'HS256'));
            // Guardar info decodificada para usar en el controller si se quiere (opcional)
            $_REQUEST['jwt_payload'] = $decoded;
        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido o expirado', 'message' => $e->getMessage()]);
            exit();
        }
    }
}
