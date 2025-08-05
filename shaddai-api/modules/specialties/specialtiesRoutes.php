<?php

require_once __DIR__ . '/specialtiesController.php';

class SpecialtiesRoutes {

    public static function register($router) {

        $controller = new SpecialtiesController();

        $router->add('GET', 'specialties', [$controller, 'getAll'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'specialties/{id}', [$controller, 'getById'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'specialties', [$controller, 'create'], ['auth', 'role:admin,recepcionista']);
        $router->add('PUT', 'specialties/{id}', [$controller, 'update'], ['auth', 'role:admin,recepcionista']);
        $router->add('DELETE', 'specialties/{id}', [$controller, 'delete'], ['auth', 'role:admin,recepcionista']);

    }

}