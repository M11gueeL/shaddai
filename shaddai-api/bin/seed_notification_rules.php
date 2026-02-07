<?php
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    
    echo "Reiniciando reglas de notificación...\n";

    // 1. Limpiar tabla existente (Desactivando check de llaves foráneas temporalmente)
    $db->execute("SET FOREIGN_KEY_CHECKS = 0");
    $db->execute("TRUNCATE TABLE notification_rules");
    $db->execute("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Definir reglas por defecto
    $defaultRules = [
        ['name' => '5 Minutos antes', 'minutes' => 5],
        ['name' => '10 Minutos antes', 'minutes' => 10],
        ['name' => '15 Minutos antes', 'minutes' => 15],
        ['name' => '30 Minutos antes', 'minutes' => 30],
        ['name' => '45 Minutos antes', 'minutes' => 45],
        ['name' => '1 Hora antes', 'minutes' => 60],
        ['name' => '3 Horas antes', 'minutes' => 180],
        ['name' => '6 Horas antes', 'minutes' => 360],
    ];

    // 3. Insertar
    $sql = "INSERT INTO notification_rules (name, minutes_before, is_active) VALUES (:name, :minutes, 0)";
    
    foreach ($defaultRules as $rule) {
        $db->execute($sql, [
            ':name' => $rule['name'],
            ':minutes' => $rule['minutes']
        ]);
        echo "Insertada: {$rule['name']}\n";
    }

    echo "Reglas establecidas correctamente.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
