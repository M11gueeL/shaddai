<?php
require_once __DIR__ . '/PatientsController.php';

class PatientsRoutes {
    public static function register($router) {
        $controller = new PatientsController();
        
        $router->add('GET', 'patients', [$controller, 'getAll'], 'auth');
        $router->add('GET', 'patients/{id}', [$controller, 'get'], 'auth');
        $router->add('POST', 'patients', [$controller, 'create'], 'auth');
        $router->add('PUT', 'patients/{id}', [$controller, 'update'], 'auth');
        $router->add('DELETE', 'patients/{id}', [$controller, 'delete'], 'auth');
        
        // Ruta de prueba
        $router->add('GET', 'test', function() {
            echo json_encode(['status' => 'success', 'message' => 'API is working!']);
        });
    }
}