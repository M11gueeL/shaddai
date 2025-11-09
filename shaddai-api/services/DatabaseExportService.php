<?php

require_once __DIR__ . '/../config/Database.php';

class DatabaseExportService {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function generateDump(): string {
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
