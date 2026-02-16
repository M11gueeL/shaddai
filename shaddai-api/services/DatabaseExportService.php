<?php

require_once __DIR__ . '/../config/Database.php';

class DatabaseExportService {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function exportDatabase(): array {
        $dump = $this->generateDump();
        
        $backupDir = __DIR__ . '/../backups';
        if (!is_dir($backupDir)) {
            if (!mkdir($backupDir, 0755, true)) {
                throw new \Exception("No se pudo crear el directorio de backups: $backupDir");
            }
        }

        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
        $filePath = $backupDir . '/' . $filename;

        if (file_put_contents($filePath, $dump) === false) {
            throw new \Exception("No se pudo guardar el archivo de backup en: $filePath");
        }

        $fileSize = filesize($filePath);

        return [
            'filename' => $filename,
            'file_path' => $filePath,
            'file_size' => $fileSize
        ];
    }

    public function restoreDatabase(string $filePath): void {
        if (!file_exists($filePath)) {
            throw new \Exception("El archivo de respaldo no existe: $filePath");
        }

        $dbHost = $_ENV['DB_HOST'] ?? 'localhost';
        $dbName = $_ENV['DB_NAME'] ?? 'shaddai_db';
        $dbUser = $_ENV['DB_USER'] ?? 'root';
        $dbPass = $_ENV['DB_PASSWORD'] ?? '';
        $dbPort = $_ENV['DB_PORT'] ?? '3306';

        // Intento 1: Usar comando nativo mysql
        $output = [];
        $returnVar = null;
        
        // Determinar si comando mysql está disponible
        // Nota: Esto depende de la configuración del servidor y PATH.
        // En XAMPP windows suele estar en path o necesitar ruta completa.
        // Asumiremos que 'mysql' está en el PATH o intentamos localizarlo si es crítico.
        // Para simplificar, intentaremos ejecutarlo.
        
        // Construir comando (cuidado con passwords en linea de comandos en sistemas compartidos)
        $command = sprintf(
            'mysql --host=%s --port=%s --user=%s %s %s < %s',
            escapeshellarg($dbHost),
            escapeshellarg($dbPort),
            escapeshellarg($dbUser),
            $dbPass ? '--password=' . escapeshellarg($dbPass) : '',
            escapeshellarg($dbName),
            escapeshellarg($filePath)
        );

        // En Windows el path de mysql podría no estar global. 
        // Si falla exec, usamos fallback PDO.
        
        try {
            if (function_exists('exec')) {
                exec($command . ' 2>&1', $output, $returnVar);
                if ($returnVar === 0) {
                    return; // Éxito
                }
                // Si falla, loguear output si es necesario y continuar a fallback
                // error_log("Mysql exec failed: " . implode("\n", $output));
            }
        } catch (\Throwable $e) {
            // Continuar a fallback
        }

        // Intento 2: Fallback usando PDO (más lento para archivos grandes)
        $this->restoreDatabasePDO($filePath);
    }

    private function restoreDatabasePDO(string $filePath): void {
        // Desactivar chequeo de claves foráneas
        $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
        
        $sql = file_get_contents($filePath);
        if ($sql === false) {
            throw new \Exception("Error leyendo el archivo: $filePath");
        }

        // Ejecutar. Nota: pdo->exec permite múltiples queries si emular prepares está activo o driver lo soporta.
        // O podemos partir por punto y coma, pero eso es frágil con stored procs o strings.
        // La mejor opción básica para dumps simples:
        try {
            $this->pdo->exec($sql);
        } catch (\PDOException $e) {
            $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
            throw new \Exception("Error restaurando base de datos via PDO: " . $e->getMessage());
        }

        $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    }

    private function generateDump(): string {
        $dbName = $_ENV['DB_NAME'] ?? 'database';
        $timezoneId = date_default_timezone_get() ?: 'UTC';
        $timestamp = (new \DateTime('now', new \DateTimeZone($timezoneId)))->format('Y-m-d H:i:s');

        $lines = [];
        $lines[] = '-- SQL Dump generado por Shaddai';
        $lines[] = '-- Base de datos: `' . $dbName . '`';
        $lines[] = '-- Fecha de exportación: ' . $timestamp;
        $lines[] = 'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";';
        $lines[] = 'SET time_zone = "+00:00";';
        $lines[] = 'SET FOREIGN_KEY_CHECKS = 0;';
        $lines[] = '';

        $tables = [];
        $statement = $this->pdo->query('SHOW TABLES');
        while ($row = $statement->fetch(\PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }

        foreach ($tables as $table) {
            $lines[] = '-- --------------------------------------------------------';
            $lines[] = '-- Estructura de tabla `' . $table . '`';
            $lines[] = '-- --------------------------------------------------------';

            $lines[] = 'DROP TABLE IF EXISTS `' . $table . '`;';
            $createStmt = $this->pdo->query('SHOW CREATE TABLE `' . $table . '`')->fetch(\PDO::FETCH_ASSOC);
            $createSql = $createStmt['Create Table'] ?? '';
            $lines[] = $createSql . ';';
            $lines[] = '';

            $rowsStmt = $this->pdo->query('SELECT * FROM `' . $table . '`');
            $hasData = false;
            while ($row = $rowsStmt->fetch(\PDO::FETCH_ASSOC)) {
                if (!$hasData) {
                    $lines[] = '-- Volcado de datos para `' . $table . '`';
                    $hasData = true;
                }

                $columns = array_map(fn($col) => '`' . $col . '`', array_keys($row));
                $values = array_map(function ($value) {
                    if ($value === null) {
                        return 'NULL';
                    }
                    return $this->pdo->quote($value);
                }, array_values($row));

                $lines[] = 'INSERT INTO `' . $table . '` (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $values) . ');';
            }

            if ($hasData) {
                $lines[] = '';
            }
        }

        $lines[] = 'SET FOREIGN_KEY_CHECKS = 1;';

        return implode(PHP_EOL, $lines) . PHP_EOL;
    }
}
