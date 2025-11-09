<?php
require_once __DIR__ . '/PaymentController.php';

class PaymentRoutes {
    public static function register($router) {
        $c = new PaymentController();
        $router->add('POST', 'accounts/{id}/payments', [$c, 'createPayment'], ['auth','role:recepcionista,admin']);
        $router->add('GET', 'accounts/{id}/payments', [$c, 'listByAccount'], ['auth','role:recepcionista,admin']);
        $router->add('PUT', 'payments/{id}/verify', [$c, 'verifyPayment'], ['auth','role:admin']);
        $router->add('DELETE', 'payments/{id}', [$c, 'deletePayment'], ['auth','role:admin']);
            // Admin pending list
            $router->add('GET', 'payments/admin/pending', [$c, 'listPendingAdmin'], ['auth','role:admin']);
    }
}
?>
