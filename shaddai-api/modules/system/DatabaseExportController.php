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
            
            // Obtener usuario del token JWT (inyectado por AuthMiddleware en $_REQUEST['jwt_payload'])
            $userId = null;
            if (isset($_REQUEST['jwt_payload']) && isset($_REQUEST['jwt_payload']->sub)) {
                $userId = $_REQUEST['jwt_payload']->sub;
            } elseif (isset($_SESSION['user_id'])) {
                $userId = $_SESSION['user_id'];
            }

            if (!$userId) {
                throw new \Exception("Usuario no identificado para realizar el backup");
            }
            
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
            
            // Usamos LEFT JOIN para que siempre devuelva los backups, 
            // incluso si el usuario ha sido borrado o es ID 1 (System)
            $stmt = $pdo->query("
                SELECT 
                    b.id, b.filename, b.file_path, b.file_size, b.created_at, b.created_by,
                    u.first_name, u.last_name, u.email
                FROM system_backups b
                LEFT JOIN users u ON b.created_by = u.id
                ORDER BY b.created_at DESC
            ");
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Formateamos la respuesta para incluir el objeto 'author'
            // Si el usuario no existe (inner join fallaría), los campos serán null
            $backups = array_map(function ($item) {
                return [
                    'id' => $item['id'],
                    'filename' => $item['filename'],
                    'file_path' => $item['file_path'],
                    'file_size' => $item['file_size'],
                    'created_at' => $item['created_at'],
                    'created_by' => $item['created_by'],
                    'author' => [
                        'first_name' => $item['first_name'],
                        'last_name' => $item['last_name'],
                        'email' => $item['email']
                    ]
                ];
            }, $results);

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
                throw new \Exception("No se proporcionó archivo o ID avlido");
            }

            // Realizar restauración
            $this->service->restoreDatabase($filePath);

            // Obtener ID de usuario
            $userId = null;
            if (isset($_REQUEST['jwt_payload']) && isset($_REQUEST['jwt_payload']->sub)) {
                $userId = $_REQUEST['jwt_payload']->sub;
            } elseif (isset($_SESSION['user_id'])) {
                $userId = $_SESSION['user_id'];
            }

            if (!$userId) {
                // Si no hay usuario, lanzamos excepción (aunque el backup ya se hizo, el registro fallará)
                // O mejor, registramos con null si la columna lo permite? 
                // Asumimos que la tabla y lógica requiere usuario.
                throw new \Exception("Usuario no identificado para registrar la restauración");
            }

            // Registrar en system_restores
            $stmt = $pdo->prepare("
                INSERT INTO system_restores (backup_id, filename, restored_by, restored_at, status, notes)
                VALUES (?, ?, ?, NOW(), ?, ?)
            ");
            
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
            
            // Obtener ID (mismo fallback)
            $userId = null;
            if (isset($_REQUEST['jwt_payload']) && isset($_REQUEST['jwt_payload']->sub)) {
                $userId = $_REQUEST['jwt_payload']->sub;
            } elseif (isset($_SESSION['user_id'])) {
                $userId = $_SESSION['user_id'];
            }
            
            // Si userId es null, la base de datos debería rechazarlo si es NOT NULL,
            // o guardarlo como NULL si es nullable. Asumiremos que es mejor intentar
            // guardar con null que inventar un ID.
            
            $bId = $backupId ?? null;
            $fName = $filename ?? 'unknown';
            
            try {
                $stmt->execute([
                    $bId,
                    $fName,
                    $userId,
                    'failed',
                    'Error: ' . $exception->getMessage()
                ]);
            } catch (\Throwable $loggingError) {
                // Silenciar error de logueo si falla por usuario null
            }
            
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'error' => 'Error al restaurar', 
                'message' => $exception->getMessage()
            ]);
        }
    }
}
