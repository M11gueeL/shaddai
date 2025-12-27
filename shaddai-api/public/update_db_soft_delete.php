<?php
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    
    echo "Iniciando actualización de base de datos (Soft Delete y Limpieza)...\n";

    // 1. Añadir columna is_deleted a inventory_items
    try {
        $db->query("SELECT is_deleted FROM inventory_items LIMIT 1");
        echo "- Columna 'is_deleted' ya existe en 'inventory_items'.\n";
    } catch (Exception $e) {
        $db->execute("ALTER TABLE inventory_items ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 AFTER is_active");
        echo "- Columna 'is_deleted' añadida a 'inventory_items'.\n";
    }

    // 2. Añadir columna is_deleted a inventory_brands
    try {
        $db->query("SELECT is_deleted FROM inventory_brands LIMIT 1");
        echo "- Columna 'is_deleted' ya existe en 'inventory_brands'.\n";
    } catch (Exception $e) {
        $db->execute("ALTER TABLE inventory_brands ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 AFTER is_active");
        echo "- Columna 'is_deleted' añadida a 'inventory_brands'.\n";
    }

    // 3. Limpiar movimientos y lotes (TRUNCATE)
    // Desactivar FK checks temporalmente para truncar
    $db->execute("SET FOREIGN_KEY_CHECKS = 0");
    
    $db->execute("TRUNCATE TABLE inventory_movements");
    echo "- Tabla 'inventory_movements' vaciada.\n";
    
    $db->execute("TRUNCATE TABLE inventory_batches");
    echo "- Tabla 'inventory_batches' vaciada.\n";
    
    $db->execute("SET FOREIGN_KEY_CHECKS = 1");

    // 4. Resetear stock de items a 0
    $db->execute("UPDATE inventory_items SET stock_quantity = 0");
    echo "- Stock de todos los items reseteado a 0.\n";

    echo "Actualización y limpieza completada con éxito.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
