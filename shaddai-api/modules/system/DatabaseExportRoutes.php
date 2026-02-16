<?php

require_once __DIR__ . '/DatabaseExportController.php';

class DatabaseExportRoutes {
    public static function register($router): void {
        $controller = new DatabaseExportController();
        $router->add('GET', 'system/database/export', [$controller, 'exportDatabase'], ['auth', 'role:admin']);
        $router->add('GET', 'system/backups', [$controller, 'getHistory'], ['auth', 'role:admin']);
        $router->add('POST', 'system/restore', [$controller, 'restoreDatabase'], ['auth', 'role:admin']);
    }
}
