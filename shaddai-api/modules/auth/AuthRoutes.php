<?php

require_once __DIR__ . '/AuthController.php';

use Middlewares\RoleMiddleware;

class AuthRoutes {

    public static function register($router) {
    
        $authController = new AuthController();

        $router->add('POST', 'auth/login', [$authController, 'login']);
        $router->add('GET', 'auth/recaptcha-site-key', [$authController, 'getRecaptchaSiteKey']);
        $router->add('POST', 'auth/logout', [$authController, 'logout'], 'auth');
        $router->add('GET', 'auth/profile', [$authController, 'getProfile'], 'auth');
        $router->add('GET', 'auth/sessions', [$authController, 'listSessions'], ['auth', 'role:admin']);

        // --- RUTAS PARA RESET DE CONTRASEÑA ---

        // Ruta para solicitar el correo de reseteo
        $router->add('POST', 'auth/request-reset', [$authController, 'requestPasswordReset']);

        // Ruta para enviar el token y la nueva clave
        $router->add('POST', 'auth/reset-password', [$authController, 'resetPassword']);

    }
}
?>

