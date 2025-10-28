<?php
require_once __DIR__ . '/CashRegisterController.php';

class CashRegisterRoutes {
    public static function register($router) {
        $c = new CashRegisterController();
        $router->add('POST', 'cash-sessions/open', [$c, 'openSession'], ['auth','role:recepcionista,admin']);
        $router->add('GET', 'cash-sessions/status', [$c, 'status'], ['auth','role:recepcionista,admin']);
        $router->add('GET', 'cash-sessions/movements', [$c, 'listMyMovements'], ['auth','role:recepcionista,admin']);
        $router->add('POST', 'cash-sessions/close', [$c, 'closeSession'], ['auth','role:recepcionista,admin']);
        // admin
        $router->add('GET', 'cash-sessions/admin/all', [$c, 'adminListSessions'], ['auth','role:admin']);
    }
}
?>
