<?php
require_once __DIR__ . '/PatientsController.php';

use Middlewares\RoleMiddleware;

class PatientsRoutes {
    public static function register($router) {
        
        $controller = new PatientsController();
        
        $adminOrReception = [RoleMiddleware::class, ['admin', 'recepcionista']];

        $router->add('GET', 'patients', [$controller, 'getAll'], ['auth', $adminOrReception]);
        $router->add('GET', 'patients/{id}', [$controller, 'get'], ['auth', $adminOrReception]);
        $router->add('POST', 'patients', [$controller, 'create'], ['auth', $adminOrReception]);
        $router->add('PUT', 'patients/{id}', [$controller, 'update'], ['auth', $adminOrReception]);
        $router->add('DELETE', 'patients/{id}', [$controller, 'delete'], ['auth', $adminOrReception]);
        
        // Ruta de prueba
        $router->add('GET', 'test', function() {
            echo json_encode(['status' => 'success', 'message' => 'API is working!']);
        });
    }
}