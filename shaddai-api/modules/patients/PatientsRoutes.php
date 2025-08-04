<?php
require_once __DIR__ . '/PatientsController.php';

use Middlewares\RoleMiddleware;

class PatientsRoutes {

    public static function register($router) {
        
        $controller = new PatientsController();

        $router->add('GET', 'patients', [$controller, 'getAllPatients'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'patients/{id}', [$controller, 'getPatient'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'patients', [$controller, 'createPatient'], ['auth', 'role:admin,recepcionista']);
        $router->add('PUT', 'patients/{id}', [$controller, 'updatePatient'], ['auth', 'role:admin,recepcionista']);
        $router->add('DELETE', 'patients/{id}', [$controller, 'deletePatient'], ['auth', 'role:admin,recepcionista']);
        
        // Ruta de prueba
        $router->add('GET', 'test', function() {
            echo json_encode(['status' => 'success', 'message' => 'API is working!']);
        });
    }
}