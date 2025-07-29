<?php

class Router {
    private $routes = [];

    public function add($method, $route, $callback) {
        $this->routes[] = [
            'method' => strtoupper($method),
            'route' => trim($route, '/'),
            'callback' => $callback
        ];
    }

    public function dispatch($requestPath, $requestMethod) {
        $requestPath = trim($requestPath, '/');
        
        foreach ($this->routes as $route) {
            // Convertir ruta a patrón regex
            $pattern = $this->routeToPattern($route['route']);
            
            if ($route['method'] === $requestMethod && preg_match($pattern, $requestPath, $matches)) {
                // Extraer parámetros
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }
                
                // Llamar al callback
                $this->callCallback($route['callback'], $params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Recurso no encontrado']);
        // echo json_encode($this->getNotFoundResponse($requestMethod, $requestPath));
    }

    private function routeToPattern($route) {
        // Reemplazar {param} por regex
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^\/]+)', $route);
        return '@^' . $pattern . '$@';
    }

    private function callCallback($callback, $params) {
        if (is_callable($callback)) {
            call_user_func_array($callback, $params);
        } elseif (is_array($callback) && count($callback) === 2) {
            [$controller, $method] = $callback;
            if (method_exists($controller, $method)) {
                call_user_func_array([$controller, $method], $params);
            } else {
                http_response_code(500);
                echo json_encode([
                    'error' => 'Controller method not found',
                    'controller' => get_class($controller),
                    'method' => $method
                ]);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Invalid callback format']);
        }
    }

    public function getNotFoundResponse($requestMethod, $requestPath) {
        return [
            'error' => 'Recurso no encontrado',
            'requested' => "$requestMethod /$requestPath",
            'registered' => array_map(function($r) {
                return $r['method'] . ' /' . $r['route'];
            }, $this->routes)
        ];
    }

    public function getRoutes() {
        return $this->routes;
    }
}