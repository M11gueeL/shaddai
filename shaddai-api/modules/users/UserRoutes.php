<?php

require_once __DIR__ . '/UserController.php';

class UserRoutes {
    public static function register($router) {
        $controller = new UsersController();
        
        $router->add('GET', 'users', [$controller, 'getAllUsers'], 'auth');
        $router->add('GET', 'users/{id}', [$controller, 'getUserByID'], 'auth');
        $router->add('GET', 'users/cedula/{cedula}', [$controller, 'findUserByCedula'], 'auth');
        $router->add('GET', 'users/email/{email}', [$controller, 'getUserByEmail'], 'auth');
        $router->add('POST', 'users', [$controller, 'createUser'], 'auth');
        $router->add('PUT', 'users/{id}', [$controller, 'updateUser'], 'auth');
        $router->add('DELETE', 'users/{id}', [$controller, 'deleteUser'], 'auth');
        $router->add('PATCH', 'users/{id}/status', [$controller, 'toggleUserStatus'], 'auth');
        
    }
}