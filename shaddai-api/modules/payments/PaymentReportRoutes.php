<?php
require_once __DIR__ . '/PaymentReportController.php';

class PaymentReportRoutes {
    public static function register($router) {
        $c = new PaymentReportController();
        $router->add('GET', 'payments/reports/stats', [$c, 'getStats'], ['auth']);
        $router->add('GET', 'payments/reports/general', [$c, 'getGeneralReport'], ['auth']);
        $router->add('GET', 'payments/reports/general/pdf', [$c, 'downloadGeneralReportPdf'], ['auth']);
        $router->add('GET', 'payments/reports/debtors/pdf', [$c, 'downloadDebtorsReportPdf'], ['auth']);
        $router->add('GET', 'payments/reports/services/pdf', [$c, 'downloadServicesPerformancePdf'], ['auth']);
    }
}
