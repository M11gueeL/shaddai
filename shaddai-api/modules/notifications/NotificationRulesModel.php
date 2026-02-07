<?php
require_once __DIR__ . '/../../config/Database.php';

class NotificationRulesModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll() {
        return $this->db->query("SELECT * FROM notification_rules ORDER BY minutes_before ASC");
    }

    public function getById($id) {
        $res = $this->db->query("SELECT * FROM notification_rules WHERE id = :id", [':id' => $id]);
        return $res[0] ?? null;
    }

    public function create($data) {
        // Método deshabilitado por requerimiento de negocio
        return false;
    }

    // Método especializado para activar solo una regla y desactivar las demás
    public function activateRule($id) {
        try {
            $this->db->beginTransaction();
            
            // 1. Desactivar todas
            $this->db->execute("UPDATE notification_rules SET is_active = 0");
            
            // 2. Activar la seleccionada
            $this->db->execute("UPDATE notification_rules SET is_active = 1 WHERE id = :id", [':id' => $id]);
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }

    // Método para desactivar todo (apagado general)
    public function deactivateAll() {
         return $this->db->execute("UPDATE notification_rules SET is_active = 0");
    }

    public function update($id, $data) {
        // Solo permitimos actualizar is_active a través de los métodos especializados
        // Pero mantenemos este método genérico para compatibilidad básica si se necesita,
        // aunque ahora la lógica de negocio dicta exclusividad.
        
        // Si intentan activar, usamos activateRule para garantizar exclusividad
        if (isset($data['is_active']) && $data['is_active'] == 1) {
            return $this->activateRule($id);
        }
        
        // Si intentan desactivar (is_active = 0), simplemente desactivamos esa regla
        // (lo cual es seguro, puede quedar ninguna activa)
        if (isset($data['is_active']) && $data['is_active'] == 0) {
            return $this->db->execute("UPDATE notification_rules SET is_active = 0 WHERE id = :id", [':id' => $id]);
        }

        return false; 
    }

    public function delete($id) {
        // Método deshabilitado: No se pueden borrar las reglas predefinidas
        return false;
    }
}
