<?php
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    
    echo "Actualizando esquema de base de datos (ENUM movement_type)...\n";

    // Alterar la tabla para agregar 'in_adjustment' al ENUM
    // Nota: Se deben listar TODOS los valores existentes más el nuevo.
    $sql = "ALTER TABLE inventory_movements MODIFY COLUMN movement_type 
            ENUM('in_restock','in_adjustment','out_adjustment','out_expired','out_damaged','out_internal_use','out_billed') 
            NOT NULL COMMENT 'Tipo de movimiento'";
    
    $db->execute($sql);
    echo "- Columna 'movement_type' actualizada con 'in_adjustment'.\n";

    // Limpieza de datos para reiniciar pruebas
    $db->execute("SET FOREIGN_KEY_CHECKS = 0");
    $db->execute("TRUNCATE TABLE inventory_movements");
    $db->execute("TRUNCATE TABLE inventory_batches");
    $db->execute("UPDATE inventory_items SET stock_quantity = 0");
    $db->execute("SET FOREIGN_KEY_CHECKS = 1");
    echo "- Datos de movimientos y lotes limpiados para pruebas.\n";

    echo "Actualización completada.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
