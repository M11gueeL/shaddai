<?php

require_once __DIR__ . '/UserController.php';

use Middlewares\RoleMiddleware;

class UserRoutes {
    public static function register($router) {
        $controller = new UsersController();

        // Solo admin puede acceder
        $adminOnly = [RoleMiddleware::class, ['admin']];

        // Admin o recepcionista
        $adminOrReception = [RoleMiddleware::class, ['admin', 'recepcionista']];
        
        $router->add('GET', 'users', [$controller, 'getAllUsers'], ['auth', $adminOnly]);
        $router->add('GET', 'users/{id}', [$controller, 'getUserByID'], ['auth', $adminOnly]);
        $router->add('GET', 'users/cedula/{cedula}', [$controller, 'findUserByCedula'], ['auth', $adminOnly]);
        $router->add('GET', 'users/email/{email}', [$controller, 'getUserByEmail'], ['auth', $adminOnly]);
        $router->add('POST', 'users', [$controller, 'createUser'], ['auth', $adminOnly]);
        $router->add('PUT', 'users/{id}', [$controller, 'updateUser'], ['auth', $adminOnly]);
        $router->add('DELETE', 'users/{id}', [$controller, 'deleteUser'], ['auth', $adminOnly]);
        $router->add('PATCH', 'users/{id}/status', [$controller, 'toggleUserStatus'], ['auth', $adminOnly]);
        
    }
}