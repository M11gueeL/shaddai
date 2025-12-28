<?php
require_once __DIR__ . '/InventoryController.php';

class InventoryRoutes {
    public static function register($router) {
        $c = new InventoryController();
        // Lectura: cualquier usuario autenticado
        $router->add('GET', 'inventory', [$c, 'list'], ['auth']);
        $router->add('GET', 'inventory/expiring', [$c, 'expiring'], ['auth']);
        $router->add('GET', 'inventory/stats', [$c, 'stats'], ['auth']);
        $router->add('GET', 'inventory/{id}', [$c, 'get'], ['auth']);
        $router->add('GET', 'inventory/{id}/batches', [$c, 'getBatches'], ['auth']);
        $router->add('GET', 'inventory/{id}/movements', [$c, 'movements'], ['auth']);

        // Escritura: solo admin
        $router->add('POST', 'inventory', [$c, 'create'], ['auth', 'role:admin']);
        $router->add('POST', 'inventory/batches/discard', [$c, 'discardBatch'], ['auth', 'role:admin']);
        $router->add('POST', 'inventory/batches/adjust', [$c, 'adjustBatch'], ['auth', 'role:admin']);
        $router->add('POST', 'inventory/batches/status', [$c, 'toggleBatchStatus'], ['auth', 'role:admin']);
        $router->add('PUT', 'inventory/{id}', [$c, 'update'], ['auth', 'role:admin']);
        $router->add('DELETE', 'inventory/{id}', [$c, 'delete'], ['auth', 'role:admin']);
        $router->add('POST', 'inventory/{id}/restock', [$c, 'restock'], ['auth', 'role:admin']);
    }
}
?>