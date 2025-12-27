<?php
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    
    echo "Iniciando actualización de base de datos para Marcas/Laboratorios...\n";

    // 1. Crear tabla inventory_brands
    $sqlCreate = "CREATE TABLE IF NOT EXISTS inventory_brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->execute($sqlCreate);
    echo "- Tabla 'inventory_brands' creada o verificada.\n";

    // 2. Insertar marca Genérico por defecto
    $check = $db->query("SELECT id FROM inventory_brands WHERE name = 'Genérico'");
    if (empty($check)) {
        $db->execute("INSERT INTO inventory_brands (name, description) VALUES ('Genérico', 'Marca por defecto para insumos sin laboratorio específico')");
        echo "- Marca 'Genérico' insertada.\n";
    }

    // 3. Añadir columna brand_id a inventory_items si no existe
    try {
        $db->query("SELECT brand_id FROM inventory_items LIMIT 1");
        echo "- Columna 'brand_id' ya existe en 'inventory_items'.\n";
    } catch (Exception $e) {
        // Si falla el select, asumimos que no existe
        $db->execute("ALTER TABLE inventory_items ADD COLUMN brand_id INT NULL AFTER name");
        $db->execute("ALTER TABLE inventory_items ADD CONSTRAINT fk_inventory_items_brand FOREIGN KEY (brand_id) REFERENCES inventory_brands(id) ON DELETE SET NULL");
        
        // Actualizar items existentes a Genérico
        $genericId = $db->query("SELECT id FROM inventory_brands WHERE name = 'Genérico'")[0]['id'];
        $db->execute("UPDATE inventory_items SET brand_id = :id WHERE brand_id IS NULL", [':id' => $genericId]);
        
        echo "- Columna 'brand_id' añadida y FK creada. Items existentes actualizados a Genérico.\n";
    }

    echo "Actualización completada con éxito.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
