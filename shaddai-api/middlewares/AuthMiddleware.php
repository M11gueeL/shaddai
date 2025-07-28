<?php

class AuthMiddleware {
    
    private $authModel;

    public function __construct(/*AuthModel*/ $authModel) {
        $this->authModel = $authModel;
    }

    // Método para autenticar al usuario
    public function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader)) {
            throw new Exception('Token de autenticación no proporcionado', 401);
        }

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception('Formato de token inválido', 401);
        }

        $token = $matches[1];

        if (!$this->authModel->isValidToken($token)) {
            throw new Exception('Token de autenticación inválido', 401);
        }

        // Si el token es válido, se puede continuar con la solicitud
        return true;
    }

}