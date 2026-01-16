<?php
require_once __DIR__ . '/ConsultingRoomController.php';

class ConsultingRoomRoutes {

    public static function register($router) {
        $controller = new ConsultingRoomController();

        $router->add('GET', 'consulting-rooms', [$controller, 'getAll'], ['auth']);
        $router->add('GET', 'consulting-rooms/{id}', [$controller, 'getById'], ['auth']);
        $router->add('GET', 'consulting-rooms/specialty/{specialtyId}', [$controller, 'getBySpecialty'], ['auth']);
        $router->add('POST', 'consulting-rooms', [$controller, 'create'], ['auth', 'role:admin']);
        $router->add('PUT', 'consulting-rooms/{id}', [$controller, 'update'], ['auth', 'role:admin']);
        $router->add('DELETE', 'consulting-rooms/{id}', [$controller, 'delete'], ['auth', 'role:admin']);
    }
}
