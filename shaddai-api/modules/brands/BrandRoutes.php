<?php
require_once __DIR__ . '/BrandController.php';

class BrandRoutes {
    public static function register($router) {
        $c = new BrandController();
        
        $router->add('GET', 'brands', [$c, 'list'], ['auth']);
        $router->add('POST', 'brands', [$c, 'create'], ['auth', 'role:admin']);
        $router->add('PUT', 'brands/{id}', [$c, 'update'], ['auth', 'role:admin']);
        $router->add('DELETE', 'brands/{id}', [$c, 'delete'], ['auth', 'role:admin']);
    }
}
?>
