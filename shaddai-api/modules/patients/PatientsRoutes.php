<?php
require_once __DIR__ . '/PatientsController.php';

use Middlewares\RoleMiddleware;

class PatientsRoutes {

    public static function register($router) {
        
        $controller = new PatientsController();

        $router->add('GET', 'patients', [$controller, 'getAll'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'patients/{id}', [$controller, 'get'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'patients', [$controller, 'create'], ['auth', 'role:admin,recepcionista']);
        $router->add('PUT', 'patients/{id}', [$controller, 'update'], ['auth', 'role:admin,recepcionista']);
        $router->add('DELETE', 'patients/{id}', [$controller, 'delete'], ['auth', 'role:admin,recepcionista']);
        
        // Ruta de prueba
        $router->add('GET', 'test', function() {
            echo json_encode(['status' => 'success', 'message' => 'API is working!']);
        });
    }
}