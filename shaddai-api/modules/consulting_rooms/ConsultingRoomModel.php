<?php
require_once __DIR__ . '/../../config/Database.php';

class ConsultingRoomModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll() {
        $sql = "SELECT * FROM consulting_rooms ORDER BY name ASC";
        $rooms = $this->db->query($sql);
        
        // Populate specialties for list view if needed, or do it efficiently
        // For now, let's just return basic info, but if frontend expects specialties in list, add it.
        // Frontend component ConsultingRoomsManager.jsx uses room.specialties.map...
        // So we MUST fetch specialties for each room.
        
        if ($rooms) {
            foreach ($rooms as &$room) {
                 $sqlSpecialties = "
                    SELECT s.id, s.name 
                    FROM medical_specialties s
                    JOIN room_specialties rs ON s.id = rs.specialty_id
                    WHERE rs.room_id = :room_id
                ";
                $room['specialties'] = $this->db->query($sqlSpecialties, [':room_id' => $room['id']]);
            }
        }
        
        return $rooms;
    }

    public function getById($id) {
        $sql = "SELECT * FROM consulting_rooms WHERE id = :id";
        $room = $this->db->query($sql, [':id' => $id]);

        if ($room) {
            $room = $room[0];
            $sqlSpecialties = "
                SELECT s.id, s.name 
                FROM medical_specialties s
                JOIN room_specialties rs ON s.id = rs.specialty_id
                WHERE rs.room_id = :room_id
            ";
            $specialties = $this->db->query($sqlSpecialties, [':room_id' => $id]);
            $room['specialties'] = $specialties;
            return $room;
        }
        return null;
    }

    public function create($data) {
        $this->db->beginTransaction();
        try {
            $sql = "INSERT INTO consulting_rooms (name, description, color, active) VALUES (:name, :description, :color, :active)";
            $params = [
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':color' => $data['color'] ?? '#FFFFFF',
                ':active' => isset($data['active']) ? $data['active'] : 1
            ];
            
            if (!$this->db->execute($sql, $params)) {
                throw new Exception("Error al insertar consultorio");
            }
            
            $roomId = $this->db->lastInsertId();
            
            if (!empty($data['specialties']) && is_array($data['specialties'])) {
                $this->assignSpecialties($roomId, $data['specialties']);
            }

            $this->db->commit();
            return $roomId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function update($id, $data) {
        $this->db->beginTransaction();
        try {
            $fields = [];
            $params = [];

            if (isset($data['name'])) {
                $fields[] = "name = :name";
                $params[':name'] = $data['name'];
            }
            if (isset($data['description'])) {
                $fields[] = "description = :description";
                $params[':description'] = $data['description'];
            }
            if (isset($data['color'])) {
                $fields[] = "color = :color";
                $params[':color'] = $data['color'];
            }
            if (isset($data['active'])) {
                $fields[] = "active = :active";
                $params[':active'] = $data['active'];
            }

            if (!empty($fields)) {
                $params[':id'] = $id;
                $sql = "UPDATE consulting_rooms SET " . implode(", ", $fields) . " WHERE id = :id";
                if (!$this->db->execute($sql, $params)) {
                    throw new Exception("Error al actualizar consultorio");
                }
            }

            if (isset($data['specialties']) && is_array($data['specialties'])) {
                 // First clear existing
                $sqlDelete = "DELETE FROM room_specialties WHERE room_id = :room_id";
                $this->db->execute($sqlDelete, [':room_id' => $id]);
                
                // Then assign new
                $this->assignSpecialties($id, $data['specialties']);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function delete($id) {
        $sql = "DELETE FROM consulting_rooms WHERE id = :id";
        return $this->db->execute($sql, [':id' => $id]);
    }

    public function assignSpecialties($roomId, $specialtyIds) {
        $sql = "INSERT INTO room_specialties (room_id, specialty_id) VALUES (:room_id, :specialty_id)";
        foreach ($specialtyIds as $specialtyId) {
            $this->db->execute($sql, [':room_id' => $roomId, ':specialty_id' => $specialtyId]);
        }
    }

    public function getAvailableRoomsBySpecialty($specialtyId) {
        $sql = "
            SELECT cr.* 
            FROM consulting_rooms cr
            JOIN room_specialties rs ON cr.id = rs.room_id
            WHERE rs.specialty_id = :specialty_id AND cr.active = 1
        ";
        return $this->db->query($sql, [':specialty_id' => $specialtyId]);
    }
}
