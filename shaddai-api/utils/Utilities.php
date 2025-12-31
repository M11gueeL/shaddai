<?php

class Utilities {

    // Configuración de header comunes
    public static function setHeaders() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        // No fuerces JSON para endpoints binarios (p.ej., descargas de PDF)
        // Detectamos la ruta solicitada y si coincide con descargas, evitamos fijar Content-Type aquí.
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        $basePath = ($_ENV['API_BASE_PATH'] ?? '/shaddai/shaddai-api/public');
        $path = parse_url($requestUri, PHP_URL_PATH) ?? '';
        if (strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        $binaryRoutes = [
            '@^/receipts/\d+/download$@',
            '@^/system/database/export$@',
            '@^/medicalrecords/attachments/\d+/download$@'
        ];

        $isBinary = false;
        foreach ($binaryRoutes as $pattern) {
            if (preg_match($pattern, $path)) {
                $isBinary = true;
                break;
            }
        }
        if (!$isBinary) {
            header("Content-Type: application/json; charset=UTF-8");
        }
    }

    // Manejo de preflight OPTIONS
    public static function handleOption() {
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    // Inicialización de la base de datos
    public static function initDatabase() {
        require_once __DIR__ . '/../config/Database.php';
        try {
            Database::getInstance();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
            exit;
        }
    }

    // Registro de rutas
    public static function registerRoutes($router) {
        $routesPaths = glob(__DIR__ . '/../modules/*/*Routes.php');
        foreach ($routesPaths as $file) {
            require_once $file;
            $className = basename($file, '.php');
            if (class_exists($className) && method_exists($className, 'register')) {
                $className::register($router);
            }
        }
    }

    // Manejo de entrada JSON
    public static function handleJsonInput() {
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
            $input = json_decode(file_get_contents('php://input'), true);
            if (is_array($input)) {
                $_POST = array_merge($_POST, $input);
            } 
        }
    }

    // Obtención de la ruta solicitada
    public static function getRequestPath() {
        $requestUri = $_SERVER['REQUEST_URI'];
        $basePath = ($_ENV['API_BASE_PATH'] ?? '/shaddai/shaddai-api/public');
        $path = parse_url($requestUri, PHP_URL_PATH);
        if (strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        return $path;
    }

    // Cargar los middlewares creados
    public static function loadMiddlewares() {
        $middlewaresPath = __DIR__ . '/../middlewares/';
        foreach (glob($middlewaresPath . '*.php') as $file) {
            require_once $file;
        }
    }

}