<?php
/** 
 * Archivo de configuración que carga las variables de entorno desde .env
 */

// Función para cargar las variables de entorno desde el archivo .env
function loadConfig() {
    // Array que almacenará nuestra configuración
    $config = [];

    // Variables de conexión a la base de datos
    $config['db'] = [
        'host' => getenv('DB_HOST') ?? 'localhost',
        'database' => getenv('DB_DATABASE') ?? '',
        'user' => getenv('DB_USER') ?? '',
        'password' => getenv('DB_PASSWORD') ?? '',
        'port' => getenv('DB_PORT') ?? '3306'
    ];

    return $config;

}

// Crear una variable global para almacenar la configuración
$config = loadConfig();

// Función helper para acceder a la configuración
function getConfig($key = null) {
    global $config;

    if ($key === null) {
        return $config;
    }

    $parts = explode('.', $key);
    $value = $config;

    foreach ($parts as $part) {
        if (isset($value[$part])) {
            $value = $value[$part];
        } else {
            return null; // Si la clave no existe, retornamos null
        }
    }

    return $value;
}
