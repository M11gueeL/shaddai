<?php

namespace Middlewares;

class RoleMiddleware {
    private $roles = [];

    public function __construct($roles = []) {
        if (is_string($roles)) {
            // Por ejemplo: "admin,receptionist"
            $this->roles = array_map('trim', explode(',', $roles));
        } elseif (is_array($roles)) {
            $this->roles = $roles;
        }
    }

    public function handle() {
        $payload = $_REQUEST['jwt_payload'] ?? null;

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado']);
            exit();
        }

        $userRoles = $payload->roles ?? [];

        if (in_array('admin', $userRoles)) {
            // Admin tiene acceso a todo
            return;
        }

        $allowed = false;
        foreach ($this->roles as $role) {
            if (in_array($role, $userRoles)) {
                $allowed = true;
                break;
            }
        }

        if (!$allowed) {
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado']);
            exit();
        }
    }
}
