<?php
require_once __DIR__ . '/PatientsController.php';

use Middlewares\RoleMiddleware;

class PatientsRoutes {

    public static function register($router) {
        
        $controller = new PatientsController();

    $router->add('GET', 'patients', [$controller, 'getAllPatients'], ['auth']);
    // Importante: registrar rutas más específicas ANTES de las dinámicas {id}
    $router->add('GET', 'patients/search', [$controller, 'searchPatients'], ['auth']);
        $router->add('GET', 'patients/{id}', [$controller, 'getPatient'], ['auth']);
        $router->add('GET', 'patients/cedula/{cedula}', [$controller, 'getPatientByCedula'], ['auth']);
        $router->add('POST', 'patients', [$controller, 'createPatient'], ['auth']);
        $router->add('PUT', 'patients/{id}', [$controller, 'updatePatient'], ['auth']);
        $router->add('DELETE', 'patients/{id}', [$controller, 'deletePatient'], ['auth']);

        // Ruta de prueba
        $router->add('GET', 'test', function() {
            echo json_encode(['status' => 'success', 'message' => 'API is working!']);
        });
    }
}