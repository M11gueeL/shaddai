<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../config');
$dotenv->safeLoad();

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
