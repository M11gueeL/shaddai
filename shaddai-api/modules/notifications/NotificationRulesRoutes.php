<?php
require_once __DIR__ . '/NotificationRulesController.php';

class NotificationRulesRoutes {
    public static function register($router) {
        $c = new NotificationRulesController();
        
        $router->add('GET', 'notifications/rules', [$c, 'list'], ['auth', 'role:admin']);
        $router->add('POST', 'notifications/rules', [$c, 'create'], ['auth', 'role:admin']);
        $router->add('PUT', 'notifications/rules/{id}', [$c, 'update'], ['auth', 'role:admin']);
        $router->add('DELETE', 'notifications/rules/{id}', [$c, 'delete'], ['auth', 'role:admin']);
    }
}
