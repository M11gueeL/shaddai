<?php
require_once __DIR__ . '/RateController.php';

class RateRoutes {
    public static function register($router) {
        $c = new RateController();
        $router->add('POST', 'rates', [$c, 'create'], ['auth','role:admin,recepcionista']);
        $router->add('GET', 'rates/today', [$c, 'getToday'], ['auth']);
        $router->add('GET', 'rates', [$c, 'list'], ['auth']);
    }
}
?>
