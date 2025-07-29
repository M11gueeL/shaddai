<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

class Database {
    private $pdo;
    private static $instance;

    // Constructor privado para Singleton
    private function __construct() {
        $dotenv = Dotenv::createImmutable(__DIR__);
        $dotenv->load();

        $host = $_ENV['DB_HOST'];
        $db   = $_ENV['DB_NAME'];
        $user = $_ENV['DB_USER'];
        $password = $_ENV['DB_PASSWORD'];
        $port = $_ENV['DB_PORT'];
        $charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;port=$port;charset=$charset";

        try {
            $this->pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            // Mejor práctica: NO mostrar detalles en producción
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    // Patrón Singleton para evitar instancias múltiples
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Ejemplo de método para consultas SELECT
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception('Query failed: ' . $e->getMessage());
        }
    }

    // Ejemplo de método para consultas UPDATE, INSERT, DELETE
    public function execute($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    // Método para obtener el último ID insertado
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    // Método para verificar si la conexión es válida
    public function isConnected() {
        try {
            $this->pdo->query("SELECT 1");
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    // Cierra la conexión (opcional)
    public function close() {
        $this->pdo = null;
    }
}
?>
