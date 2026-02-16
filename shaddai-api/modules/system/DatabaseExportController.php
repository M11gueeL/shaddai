<?php

require_once __DIR__ . '/../../services/DatabaseExportService.php';

class DatabaseExportController {
    private $service;

    public function __construct() {
        $this->service = new DatabaseExportService();
    }

    public function exportDatabase(): void {
        try {
            $result = $this->service->exportDatabase();
            
            // Guardar registro en system_backups
            $pdo = \Database::getInstance()->getConnection();
            $stmt = $pdo->prepare("
                INSERT INTO system_backups (filename, file_path, file_size, created_by, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            
            // Asumimos que hay un mecanismo de auth para obtener el usuario actual
            // Si no existe Auth::user(), usar 'System' o 1 como fallback
            $userId = $_SESSION['user_id'] ?? 1; // Ajustar según sistema real
            
            $stmt->execute([
                $result['filename'],
                $result['file_path'],
                $result['file_size'],
                $userId
            ]);

            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode([
                'success' => true,
                'message' => 'Copia de seguridad creada correctamente',
                'data' => $result
            ]);
            exit;
        } catch (\Throwable $exception) {
            http_response_code(500);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode([
                'error' => 'No se pudo generar la copia de seguridad',
                'message' => $exception->getMessage()
            ]);
            exit;
        }
    }

    public function getHistory(): void {
        try {
            $pdo = \Database::getInstance()->getConnection();
            $stmt = $pdo->query("
                SELECT 
                    b.id, b.filename, b.file_path, b.file_size, b.created_at, b.created_by,
                    u.first_name, u.last_name, u.email
                FROM system_backups b
                LEFT JOIN users u ON b.created_by = u.id
                ORDER BY b.created_at DESC
            ");
            $backups = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode($backups);
            exit;
        } catch (\Throwable $exception) {
            http_response_code(500);
            echo json_encode(['error' => $exception->getMessage()]);
            exit;
        }
    }

    public function restoreDatabase(): void {
        try {
            $pdo = \Database::getInstance()->getConnection();
            $data = json_decode(file_get_contents('php://input'), true);
            
            $backupId = $data['backup_id'] ?? $_POST['backup_id'] ?? null;
            $filePath = null;
            $filename = null;
            
            if ($backupId) {
                // Restaurar desde historial
                $stmt = $pdo->prepare("SELECT * FROM system_backups WHERE id = ?");
                $stmt->execute([$backupId]);
                $backup = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$backup) {
                    throw new \Exception("Backup no encontrado");
                }
                
                $filePath = $backup['file_path'];
                $filename = $backup['filename'];
            } elseif (isset($_FILES['backup_file']) && $_FILES['backup_file']['error'] === UPLOAD_ERR_OK) {
                // Restaurar desde archivo subido
                $tmpName = $_FILES['backup_file']['tmp_name'];
                $filename = $_FILES['backup_file']['name'];
                $filePath = $tmpName; // Usamos el temporal directamente o movemos si es necesario
            } else {
                throw new \Exception("No se proporcionó archivo o ID de backup válido");
            }

            // Realizar restauración
            $this->service->restoreDatabase($filePath);

            // Registrar en system_restores
            $stmt = $pdo->prepare("
                INSERT INTO system_restores (backup_id, filename, restored_by, restored_at, status, notes)
                VALUES (?, ?, ?, NOW(), ?, ?)
            ");
            
            $userId = $_SESSION['user_id'] ?? 1;
            $stmt->execute([
                $backupId, // Puede ser null si es subido externamente
                $filename,
                $userId,
                'success',
                'Restauración completada exitosamente'
            ]);

            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(['success' => true, 'message' => 'Base de datos restaurada correctamente']);

        } catch (\Throwable $exception) {
            // Regitrar intento fallido si tenemos info suficiente
            $pdo = \Database::getInstance()->getConnection();
            $stmt = $pdo->prepare("
                INSERT INTO system_restores (backup_id, filename, restored_by, restored_at, status, notes)
                VALUES (?, ?, ?, NOW(), ?, ?)
            ");
            
            $userId = $_SESSION['user_id'] ?? 1;
            $bId = $backupId ?? null;
            $fName = $filename ?? 'unknown';
            
            $stmt->execute([
                $bId,
                $fName,
                $userId,
                'failed',
                'Error: ' . $exception->getMessage()
            ]);
            
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'error' => 'Error al restaurar', 
                'message' => $exception->getMessage()
            ]);
        }
    }
}
