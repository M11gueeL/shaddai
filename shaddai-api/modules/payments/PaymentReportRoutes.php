<?php
require_once __DIR__ . '/PaymentReportController.php';

class PaymentReportRoutes {
    public static function register($router) {
        $c = new PaymentReportController();
        $router->add('GET', 'payments/reports/stats', [$c, 'getStats'], ['auth']);
    }
}
