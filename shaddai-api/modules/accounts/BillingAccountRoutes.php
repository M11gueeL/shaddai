<?php
require_once __DIR__ . '/BillingAccountController.php';

class BillingAccountRoutes {
    public static function register($router) {
        $c = new BillingAccountController();
        // create account (receptionist or admin)
        $router->add('POST', 'accounts', [$c, 'createAccount'], ['auth','role:admin,recepcionista']);
        // list and get
        $router->add('GET', 'accounts', [$c, 'listAccounts'], ['auth','role:admin,recepcionista']);
        $router->add('GET', 'accounts/{id}', [$c, 'getAccountById'], ['auth','role:admin,recepcionista']);
        // details
        $router->add('POST', 'accounts/{id}/details', [$c, 'addDetailToAccount'], ['auth','role:admin,recepcionista']);
        $router->add('DELETE', 'accounts/details/{detailId}', [$c, 'removeDetail'], ['auth','role:admin,recepcionista']);
    // supplies
    $router->add('POST', 'accounts/{id}/supplies', [$c, 'addSupplyToAccount'], ['auth','role:admin,recepcionista']);
    $router->add('DELETE', 'accounts/supplies/{supplyId}', [$c, 'removeSupply'], ['auth','role:admin,recepcionista']);
        // cancel
        $router->add('POST', 'accounts/{id}/cancel', [$c, 'cancelAccount'], ['auth','role:admin']);
    }
}
?>
