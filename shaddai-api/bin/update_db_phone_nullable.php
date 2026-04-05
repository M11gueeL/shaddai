<?php
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Make phone nullable
    $query = "ALTER TABLE patients MODIFY phone VARCHAR(50) NULL;";
    $db->exec($query);
    
    echo "Successfully updated phone column to be NULLABLE.\n";
} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
