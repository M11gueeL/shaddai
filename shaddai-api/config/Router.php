<?php

class Router {
    private $routes = [];

    public function add($method, $route, $callback, $middlewares = null) {
        // Normalizar middlewares a array
        if ($middlewares !== null && !is_array($middlewares)) {
            $middlewares = [$middlewares];
        }

        $this->routes[] = [
            'method' => strtoupper($method),
            'route' => trim($route, '/'),
            'callback' => $callback,
            'middlewares' => $middlewares
        ];
    }

    public function dispatch($requestPath, $requestMethod) {
        $requestPath = trim($requestPath, '/');
        
        foreach ($this->routes as $route) {
            $pattern = $this->routeToPattern($route['route']);
            
            if ($route['method'] === $requestMethod && preg_match($pattern, $requestPath, $matches)) {
                
                if (!empty($route['middlewares'])) {

                    foreach ($route['middlewares'] as $middleware) {

                        if (is_string($middleware)) {

                            if ($middleware === 'auth') {
                                $middlewareClass = 'Middlewares\\AuthMiddleware';
                                $instance = new $middlewareClass;
                                $instance->handle();
                            } elseif (str_starts_with($middleware, 'role:')) {
                                $rolesStr = substr($middleware, strlen('role:'));
                                $middlewareClass = 'Middlewares\\RoleMiddleware';
                                $instance = new $middlewareClass($rolesStr);
                                $instance->handle();
                            } else {
                                // Middleware por nombre de clase sin argumentos
                                $middlewareClass = 'Middlewares\\' . ucfirst($middleware) . 'Middleware';
                                
                                if (class_exists($middlewareClass)) {
                                    $instance = new $middlewareClass;
                                    $instance->handle();
                                }
                            }
                        } elseif (is_callable($middleware)) {
                            $middleware();
                        } elseif (is_array($middleware) && class_exists($middleware[0])) {
                            $className = $middleware[0];
                            $params = array_slice($middleware, 1);
                            $instance = new $className(...$params);
                            $instance->handle();
                        }
                    }
                }

                // Extraer parámetros y llamar callback (igual que antes)
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                $this->callCallback($route['callback'], $params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Recurso no encontrado']);
        //echo json_encode($this->getNotFoundResponse($requestMethod, $requestPath));
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