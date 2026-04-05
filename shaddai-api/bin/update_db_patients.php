<?php
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    
    // Add new columns if they do not exist
    echo "Agregando nuevas columnas...\n";
    try {
        $db->execute("ALTER TABLE patients ADD COLUMN representative_id INT NULL DEFAULT NULL");
        echo "Columna representative_id agregada.\n";
    } catch(Exception $e) { }
    
    try {
        $db->execute("ALTER TABLE patients ADD COLUMN representative_relationship VARCHAR(50) NULL DEFAULT NULL");
        echo "Columna representative_relationship agregada.\n";
    } catch(Exception $e) { }

    // Make other columns NULLable
    echo "Haciendo campos opcionales...\n";
    try { $db->execute("ALTER TABLE patients MODIFY COLUMN email VARCHAR(255) NULL DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->execute("ALTER TABLE patients MODIFY COLUMN birth_date DATE NULL DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->execute("ALTER TABLE patients MODIFY COLUMN gender ENUM('M', 'F', 'O', 'Other') NULL DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->execute("ALTER TABLE patients MODIFY COLUMN marital_status VARCHAR(50) NULL DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->execute("ALTER TABLE patients MODIFY COLUMN address TEXT NULL DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->execute("ALTER TABLE patients MODIFY COLUMN cedula VARCHAR(20) NULL DEFAULT NULL"); } catch(Exception $e) {}
    
    echo "Base de datos actualizada con exito.\n";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
