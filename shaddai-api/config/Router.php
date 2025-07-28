<?php

class Router {
    private $routes = [];
    private $middlewareInstances = [];

    // Registrar instancias de middleware
    public function registerMiddleware($name, $middleware) {
        $this->middlewareInstances[$name] = $middleware;
    
    }
    // Este método agrega una ruta al enrutador
    public function add($method, $route, $callback, $middleware = null) {
        $this->routes[] = [
            'method' => strtoupper($method),
            'route' => $route,
            'callback' => $callback,
            'middleware' => $middleware // Nombre del middleware a aplicar
        ];
    }

    // Este método maneja la solicitud entrante y despacha la ruta correspondiente
    public function dispatch($requestUri, $requestMethod) {
        $requestUri = trim($requestUri, '/');
        
        foreach ($this->routes as $route) {
            $pattern = $this->convertToRegex($route['route']);
            
            if ($route['method'] === $requestMethod && preg_match($pattern, $requestUri, $matches)) {
                // Aplicar middleware si está definido
                if ($route['middleware'] && isset($this->middlewareInstances[$route['middleware']])) {
                    try {
                        $this->middlewareInstances[$route['middleware']]->authenticate();
                    } catch (Exception $e) {
                        http_response_code($e->getCode());
                        echo json_encode(['error' => $e->getMessage()]);
                        return;
                    }
                }
                
                // Extraer parámetros
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) $params[$key] = $value;
                }
                
                // Llamar al controlador
                call_user_func_array($route['callback'], array_values($params));
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Recurso no encontrado']);
    }

    // Convertir una ruta a una expresión regular
    private function convertToRegex($route) {
        $route = trim($route, '/');
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^\/]+)', $route);
        return '@^' . $pattern . '$@';
    }

    // Método para obtener todas las rutas registradas
    public function getRoutes() {
        return $this->routes;
    }
} 