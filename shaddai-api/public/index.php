<?php
// Habilitar toda la depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Obtener la ruta solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Eliminar el base path si es necesario
$basePath = '/shaddai/shaddai-api/public';
if (strpos($requestPath, $basePath) === 0) {
    $requestPath = substr($requestPath, strlen($basePath));
}

// Configuración de cabeceras
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inicializar la base de datos
require_once __DIR__ . '/../config/Database.php';
try {
    Database::getInstance();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

// Crear el enrutador
require_once __DIR__ . '/../config/Router.php';
$router = new Router();

// Registrar módulos
require_once __DIR__ . '/../modules/patients/PatientsRoutes.php';
PatientsRoutes::register($router);

// Manejar entrada JSON
if ($_SERVER['REQUEST_METHOD'] == 'POST' || $_SERVER['REQUEST_METHOD'] == 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $_POST = array_merge($_POST, $input);
    }
}

// Despachar la solicitud
$router->dispatch($requestPath, $_SERVER['REQUEST_METHOD']);