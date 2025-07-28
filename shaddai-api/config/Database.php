<?php
class Database {
    private $pdo;

    // Constructor que inicializa la conexión a la base de datos
    public function __construct($config) {
        $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        // Intentar establecer la conexión a la base de datos
        try {
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], $options);
        } catch (PDOException $e) {
            throw new RuntimeException("Error de conexión: " . $e->getMessage());
        }
    }
    // Métodos para interactuar con la base de datos
    
    // Este método ejecuta una consulta SQL y devuelve el resultado
    // Si hay un error, lanza una excepción con el mensaje de error
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new RuntimeException("Error en la consulta: " . $e->getMessage());
        }
    }
    
    // Este método devuelve el último ID insertado en la base de datos
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    // Este método cierra la conexión a la base de datos
    public function close() {
        $this->pdo = null;
    }

    // Método para obtener la conexión PDO
    public function getConnection() {
        return $this->pdo;
    }
    
    // Métodos para realizar consultas y obtener resultados
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

}