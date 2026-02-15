<?php
require_once __DIR__ . '/ReminderHistoryController.php';

class ReminderHistoryRoutes {
    public static function register($router) {
        $controller = new ReminderHistoryController();
        
        // Ruta GET para consultar el historial
        // Puedes agregar middlewares de autenticación aquí si lo deseas (ej: ['auth', 'role:admin'])
        $router->add('GET', 'notifications/history', [$controller, 'getHistory'], ['auth']);
    }
}
