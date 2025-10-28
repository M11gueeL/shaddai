<?php
require_once __DIR__ . '/PaymentController.php';

class PaymentRoutes {
    public static function register($router) {
        $c = new PaymentController();
        $router->add('POST', 'accounts/{id}/payments', [$c, 'createPayment'], ['auth','role:recepcionista,admin']);
        $router->add('GET', 'accounts/{id}/payments', [$c, 'listByAccount'], ['auth','role:recepcionista,admin']);
        $router->add('PUT', 'payments/{id}/verify', [$c, 'verifyPayment'], ['auth','role:admin']);
    }
}
?>
