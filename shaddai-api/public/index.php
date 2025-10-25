<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../config');
$dotenv->safeLoad();

// Establecer zona horaria desde .env (por defecto a una zona local común)
if (!empty($_ENV['TIMEZONE'])) {
	date_default_timezone_set($_ENV['TIMEZONE']);
} else if (!ini_get('date.timezone')) {
	// Fallback para evitar desfases si no hay timezone configurada en php.ini
	date_default_timezone_set('America/Mexico_City');
}

require_once __DIR__ . '/../utils/Utilities.php';

Utilities::setHeaders();
Utilities::handleOption();
Utilities::initDatabase();
Utilities::loadMiddlewares();

require_once __DIR__ . '/../config/Router.php';
$router = new Router();

// Cargar todas las rutas automáticamente
Utilities::registerRoutes($router);

Utilities::handleJsonInput();

$requestPath = Utilities::getRequestPath();

$router->dispatch($requestPath, $_SERVER['REQUEST_METHOD']);
