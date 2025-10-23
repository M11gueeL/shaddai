<?php

require_once __DIR__ . '/UserModel.php';

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
            $requiredFields = ['first_name', 'last_name', 'cedula', 'phone', 'email', 'password', 'roles'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    throw new Exception("El campo $field es obligatorio");
                }
            }

            $userId = $this->model->createUser($data);
            http_response_code(201);
            echo json_encode(['message' => 'Usuario creado', 'user_id' => $userId]);
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

}