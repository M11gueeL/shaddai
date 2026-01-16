<?php

require_once __DIR__ . '/UserModel.php';
require_once __DIR__ . '/../../services/EmailServive.php';

class UsersController {
    private $model;
     
    public function __construct() {
        $this->model = new UserModel(); 
    }

    public function getAllUsers() {
        try {
            $users = $this->model->getAllUsers();
            echo json_encode($users);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getUserById($id) {
        try {
            $user = $this->model->getUserById($id);
            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Usuario no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    } 

    public function getDoctors() {
        try {
            $doctors = $this->model->getDoctors();
            echo json_encode($doctors);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createUser() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            // Obtener el id del usuario autenticado desde JWT (inyectado por middleware)
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                throw new Exception('No autorizado para crear usuarios');
            }

            // Setear created_by automáticamente
            $data['created_by'] = $jwtPayload->sub;

            // Validación básica
            $requiredFields = ['first_name', 'last_name', 'cedula', 'phone', 'email', 'roles'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    throw new Exception("El campo $field es obligatorio");
                }
            }

            // Validación de Cédula (V-123456 o E-123456)
            if (!preg_match('/^[VE]-[\d ]{6,15}$/', $data['cedula'])) {
                throw new Exception('Formato de cédula inválido. Debe ser V-XXXXXX o E-XXXXXX (permitiendo espacios y hasta 9 dígitos)');
            }

            // Validación de Teléfono
            if (!empty($data['phone'])) {
                $cleanPhone = preg_replace('/[^0-9]/', '', $data['phone']);
                if (strlen($cleanPhone) !== 11) {
                     // throw new Exception('El teléfono debe tener 11 dígitos');
                }
            }

            $userId = $this->model->createUser($data);

            // Si no se envió contraseña, manejar como invitación
            if (empty($data['password'])) {
                $token = bin2hex(random_bytes(16));
                $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                $this->model->createInvitation($userId, $token, $expiresAt);
                
                $emailService = new EmailService();
                $inviteLink = "http://localhost:5173/set-password?token=" . $token;
                
                $emailService->sendInvitation($data['email'], $data['first_name'], $inviteLink);
                
                http_response_code(201);
                echo json_encode(['message' => 'Usuario invitado correctamente', 'user_id' => $userId]);
            } else {
                http_response_code(201);
                echo json_encode(['message' => 'Usuario creado', 'user_id' => $userId]);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateUser($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $requiredFields = ['first_name', 'last_name', 'cedula', 'phone', 'email', 'roles'];
            
            foreach ($requiredFields as $field) {
                
                if (empty($data[$field])) {
                    throw new Exception("El campo $field es obligatorio");
                }
            }

            // Validación de Cédula (V-123456 o E-123456)
            if (!empty($data['cedula']) && !preg_match('/^[VE]-[\d ]{6,15}$/', $data['cedula'])) {
                throw new Exception('Formato de cédula inválido. Debe ser V-XXXXXX o E-XXXXXX (permitiendo espacios y hasta 9 dígitos)');
            }

            $updatedUser = $this->model->updateUser($id, $data); // <--- Recibe el objeto actualizado
            
            if ($updatedUser) {
                echo json_encode($updatedUser); // <--- Devuelve el objeto completo
            } else {
                throw new Exception('No se pudo actualizar el usuario');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteUser($id) {
        try {
            $deleted = $this->model->deleteUser($id);
            if ($deleted) {
                echo json_encode(['message' => 'Usuario eliminado']);
            } else {
                throw new Exception('No se pudo eliminar el usuario');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function findUserByCedula($cedula) {
        try {
            $user = $this->model->findByCedula($cedula);
            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Usuario no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getUserByEmail($email) {
        try {
            $user = $this->model->findByEmail($email);
            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Usuario no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);    
        }
    }

    public function toggleUserStatus($id) {
        try {
            $status = $this->model->toggleUserStatus($id);
            if ($status) {
                echo json_encode(['message' => 'Estado del usuario actualizado']);
            } else {
                throw new Exception('No se pudo actualizar el estado del usuario');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function resendInvitation($id) {
        try {
            $user = $this->model->getUserById($id);
            if (!$user) {
                http_response_code(404);
                throw new Exception('Usuario no encontrado');
            }

            if (empty($user['email'])) {
                 throw new Exception('El usuario no tiene email registrado');
            }

            $token = bin2hex(random_bytes(16));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            $this->model->createInvitation($id, $token, $expiresAt);
            
            $emailService = new EmailService();
            $inviteLink = "http://localhost:5173/set-password?token=" . $token;
            
            $emailService->sendInvitation($user['email'], $user['first_name'], $inviteLink);
            
            echo json_encode(['message' => 'Invitación reenviada correctamente']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getMyActivityStats() {
        try {
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;

            if (!$jwtPayload || !isset($jwtPayload->sub)) {
                http_response_code(401);
                echo json_encode(["error" => "No autenticado"]);
                return;
            }

            $userId = $jwtPayload->sub;

            $stats = $this->model->getUserActivityStats($userId);

            echo json_encode($stats);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error en servidor: ' . $e->getMessage()]);
        }
    }

}