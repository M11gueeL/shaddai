<?php
// index.php
require_once __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../config');
$dotenv->safeLoad();

require_once __DIR__ . '/../utils/Utilities.php';

Utilities::setHeaders();
Utilities::handleOption();
Utilities::initDatabase();

require_once __DIR__ . '/../config/Router.php';
$router = new Router();

// Cargar todas las rutas automáticamente
Utilities::registerRoutes($router);

Utilities::handleJsonInput();

$requestPath = Utilities::getRequestPath();

// Mostrar información de depuración
// Descomenta estas líneas para ver qué está sucediendo
// echo "Método: " . $_SERVER['REQUEST_METHOD'] . "\n";
// echo "Ruta: " . $requestPath . "\n";
// echo "Rutas registradas:\n";
// print_r($router->getRoutes());

$router->dispatch($requestPath, $_SERVER['REQUEST_METHOD']);
