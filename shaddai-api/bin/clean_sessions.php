<?php
/**
 * Script de limpieza de sesiones expiradas 
 */

// 1. Cargar la clase Database
require_once __DIR__ . '/../config/Database.php';

try {
    // 2. Obtener la instancia Singleton de la base de datos
    $db = Database::getInstance();
    
    /**
     * 3. Obtener el objeto PDO original.
     * Esto nos permite usar métodos nativos de PHP que no están 
     * mapeados en tu clase personalizada, como rowCount().
     */
    $pdo = $db->getConnection();
    
    // 4. Preparar la consulta SQL
    // Cerramos sesiones 'active' con una antigüedad mayor a 24 horas
    $sql = "UPDATE user_sessions 
            SET session_status = 'closed', 
                logout_time = NOW() 
            WHERE session_status = 'active' 
            AND login_time < (NOW() - INTERVAL 24 HOUR)";
    
    $stmt = $pdo->prepare($sql);
    
    // 5. Ejecutar la sentencia
    $stmt->execute();
    
    /**
     * 6. Obtener el conteo real.
     * rowCount() devuelve el número de filas afectadas por la última sentencia SQL.
     */
    $affectedRows = $stmt->rowCount();
    
    // 7. Salida de información para el log del Cron
    echo "[" . date('Y-m-d H:i:s') . "] Ejecución de limpieza finalizada.\n";
    if ($affectedRows > 0) {
        echo "Resultado: Se han cerrado con éxito " . $affectedRows . " sesiones que estaban huérfanas.\n";
    } else {
        echo "Resultado: No se encontraron sesiones expiradas para cerrar en este ciclo.\n";
    }

} catch (Exception $e) {
    // En caso de error, lo registramos en el log de PHP y lo mostramos en consola
    $errorMsg = "[" . date('Y-m-d H:i:s') . "] ERROR CRÍTICO EN CRON: " . $e->getMessage() . "\n";
    echo $errorMsg;
    error_log($errorMsg);
}