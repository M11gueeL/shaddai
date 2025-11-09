<?php

require_once __DIR__ . '/ExternalServiceController.php';

class ExternalServiceRoutes {

    public static function register($router) {

        $externalServiceController = new ExternalServiceController();

        $router->add('GET', 'external/votd', [$externalServiceController, 'getVerseOfTheDay']);
    }
}