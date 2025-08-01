<?php

require_once __DIR__ . '/UserController.php';

use Middlewares\RoleMiddleware;

class UserRoutes {
    public static function register($router) {
        $controller = new UsersController();
        
        $router->add('GET', 'users', [$controller, 'getAllUsers'], ['auth', 'role:admin']);
        $router->add('GET', 'users/{id}', [$controller, 'getUserByID'], ['auth', 'role:admin']);
        $router->add('GET', 'users/cedula/{cedula}', [$controller, 'findUserByCedula'], ['auth', 'role:admin']);
        $router->add('GET', 'users/email/{email}', [$controller, 'getUserByEmail'], ['auth', 'role:admin']);
        $router->add('POST', 'users', [$controller, 'createUser'], ['auth', 'role:admin']);
        $router->add('PUT', 'users/{id}', [$controller, 'updateUser'], ['auth', 'role:admin']);
        $router->add('DELETE', 'users/{id}', [$controller, 'deleteUser'], ['auth', 'role:admin']);
        $router->add('PATCH', 'users/{id}/status', [$controller, 'toggleUserStatus'], ['auth', 'role:admin']);
        
    }
}