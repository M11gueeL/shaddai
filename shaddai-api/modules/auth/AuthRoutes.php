<?php

require_once __DIR__ . '/AuthController.php';

use Middlewares\RoleMiddleware;

class AuthRoutes {

    public static function register($router) {
    
        $authController = new AuthController();

        $router->add('POST', 'auth/login', [$authController, 'login']);

        $router->add('POST', 'auth/logout', [$authController, 'logout'], 'auth');
        $router->add('GET', 'auth/profile', [$authController, 'getProfile'], 'auth');
        $router->add('GET', 'auth/sessions', [$authController, 'listSessions'], ['auth', 'role:admin']);
    }
}
