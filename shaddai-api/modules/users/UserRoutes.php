<?php

require_once __DIR__ . '/UserController.php';

class UserRoutes {
    public static function register($router) {
        $controller = new UsersController();
        
        $router->add('GET', 'users', [$controller, 'getAllUsers']);
        $router->add('GET', 'users/{id}', [$controller, 'getUserByID']);
        $router->add('POST', 'users', [$controller, 'createUser']);
        $router->add('PUT', 'users/{id}', [$controller, 'updateUser']);
        $router->add('DELETE', 'users/{id}', [$controller, 'deleteUser']);
        
    }
}