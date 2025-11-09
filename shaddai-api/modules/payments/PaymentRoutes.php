<?php
require_once __DIR__ . '/PaymentController.php';

class PaymentRoutes {
    public static function register($router) {
        $c = new PaymentController();
        $router->add('POST', 'accounts/{id}/payments', [$c, 'createPayment'], ['auth','role:recepcionista,admin']);
        $router->add('GET', 'accounts/{id}/payments', [$c, 'listByAccount'], ['auth','role:recepcionista,admin']);
        $router->add('PUT', 'payments/{id}/verify', [$c, 'verifyPayment'], ['auth','role:admin']);
        // Eliminación de un pago (solo admin). Nota: esto ajusta el saldo y estado de la cuenta.
        $router->add('DELETE', 'payments/{id}', [$c, 'deletePayment'], ['auth','role:admin']);
    }
}
?>
