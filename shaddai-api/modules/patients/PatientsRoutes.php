<?php
require_once __DIR__ . '/PatientsController.php';

class PatientsRoutes {
    public static function register($router) {
        $controller = new PatientsController();
        
        $router->add('GET', 'patients', [$controller, 'getAll']);
        $router->add('GET', 'patients/{id}', [$controller, 'get']);
        $router->add('POST', 'patients', [$controller, 'create']);
        $router->add('PUT', 'patients/{id}', [$controller, 'update']);
        $router->add('DELETE', 'patients/{id}', [$controller, 'delete']);
        
        // Ruta de prueba
        $router->add('GET', 'test', function() {
            echo json_encode(['status' => 'success', 'message' => 'API is working!']);
        });
    }
}