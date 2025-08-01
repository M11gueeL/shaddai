<?php

namespace Middlewares;

class RoleMiddleware {
    private $allowedRoles;

    public function __construct(array $allowedRoles) {
        $this->allowedRoles = $allowedRoles;
    }

    public function handle() {
        $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
        
        if (!$jwtPayload) {
            http_response_code(401);
            echo json_encode(['error' => 'No se encontró información de autenticación']);
            exit();
        }

        $userRoles = $jwtPayload->roles ?? [];
        $hasAccess = false;

        // Verificar si el usuario tiene al menos uno de los roles permitidos
        foreach ($userRoles as $role) {
            if (in_array($role, $this->allowedRoles)) {
                $hasAccess = true;
                break;
            }
        }

        if (!$hasAccess) {
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado: Usuario no autorizado']);
            exit();
        }
    }
}