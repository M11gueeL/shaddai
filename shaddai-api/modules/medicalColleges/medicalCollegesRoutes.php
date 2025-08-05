<?php

require_once __DIR__ . '/medicalCollegesController.php';

class MedicalCollegesRoutes {

    public static function register($router) {

        $controller = new medicalCollegesController();

        $router->add('GET', 'medicalcolleges', [$controller, 'getAll'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'medicalcolleges/{id}', [$controller, 'getById'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'medicalcolleges', [$controller, 'create'], ['auth', 'role:admin,recepcionista']);
        $router->add('PUT', 'medicalcolleges/{id}', [$controller, 'update'], ['auth', 'role:admin,recepcionista']);
        $router->add('DELETE', 'medicalcolleges/{id}', [$controller, 'delete'], ['auth', 'role:admin,recepcionista']);

    }

}