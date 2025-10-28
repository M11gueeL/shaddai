<?php
require_once __DIR__ . '/ServiceController.php';

class ServiceRoutes {
    public static function register($router) {
        $c = new ServiceController();
        // Read endpoints (auth required for listing, any role)
        $router->add('GET', 'services', [$c, 'list'], ['auth']);
        $router->add('GET', 'services/{id}', [$c, 'get'], ['auth']);

        // Write endpoints restricted to admin
        $router->add('POST', 'services', [$c, 'create'], ['auth', 'role:admin']);
        $router->add('PUT', 'services/{id}', [$c, 'update'], ['auth', 'role:admin']);
        $router->add('DELETE', 'services/{id}', [$c, 'delete'], ['auth', 'role:admin']);
    }
}
?>
