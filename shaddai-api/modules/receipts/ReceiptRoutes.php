<?php
require_once __DIR__ . '/ReceiptController.php';

class ReceiptRoutes {
    public static function register($router) {
        $c = new ReceiptController();
        $router->add('GET', 'receipts/generate/{account_id}', [$c, 'generateReceipt'], ['auth','role:admin,recepcionista']);
        $router->add('GET', 'receipts/patient/{patient_id}', [$c, 'listReceiptsByPatient'], ['auth','role:admin,recepcionista']);
    }
}
?>
