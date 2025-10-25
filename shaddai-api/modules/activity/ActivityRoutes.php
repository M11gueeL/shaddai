<?php
require_once __DIR__ . '/ActivityController.php';

class ActivityRoutes {
    public static function register($router) {
        $controller = new ActivityController();
        // Only reception/admin can view activity
        $router->add('GET', 'activity/recent', [$controller, 'getRecent'], ['auth', 'role:admin,recepcionista']);
    }
}
