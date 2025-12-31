<?php

require_once __DIR__ . '/../../config/Database.php';

class MedicalRecordsModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Verifica si ya existe una historia clínica para un paciente.
     * @param int $patientId ID del paciente.
     * @return int|false El ID de la historia clínica si existe, false si no.
     */
    public function findMedicalRecordByPatientId($patientId) {
        $sql = "SELECT id FROM medical_records WHERE patient_id = :patient_id LIMIT 1";
        $result = $this->db->query($sql, [':patient_id' => $patientId]);
        return $result[0]['id'] ?? false;
    }

    /**
     * Crea el registro principal de la historia clínica para un paciente si no existe.
     * @param int $patientId ID del paciente.
     * @param string|null $recordNumber Número opcional de historia.
     * @return int El ID de la historia clínica (nueva o existente).
     * @throws Exception Si no se puede crear o encontrar la historia.
     */
    public function ensureMedicalRecordExists($patientId, $recordNumber = null) {
        $existingId = $this->findMedicalRecordByPatientId($patientId);
        if ($existingId) {
            return $existingId;
        }

        $sql = "INSERT INTO medical_records (patient_id, record_number) VALUES (:patient_id, :record_number)";
        $params = [':patient_id' => $patientId, ':record_number' => $recordNumber];

        if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        } else {
            throw new Exception('No se pudo crear el registro de historia clínica.');
        }
    }

    /**
     * Obtiene el registro principal de la historia clínica por su ID.
     * @param int $recordId ID de la historia clínica.
     * @return array|null Datos de la historia clínica o null si no se encuentra.
     */
    public function getMedicalRecordById($recordId) {
        $sql = "SELECT mr.*, p.full_name as patient_name, p.cedula as patient_cedula
                FROM medical_records mr
                JOIN patients p ON mr.patient_id = p.id
                WHERE mr.id = :id";
        $result = $this->db->query($sql, [':id' => $recordId]);
        return $result[0] ?? null;
    }
    
    /**
     * Obtiene el registro principal de la historia clínica por ID del paciente.
     * @param int $patientId ID del paciente.
     * @return array|null Datos de la historia clínica o null si no se encuentra.
     */
    public function getMedicalRecordByPatientId($patientId) {
        $sql = "SELECT mr.*, p.full_name as patient_name, p.cedula as patient_cedula
                FROM medical_records mr
                JOIN patients p ON mr.patient_id = p.id
                WHERE mr.patient_id = :patient_id";
        $result = $this->db->query($sql, [':patient_id' => $patientId]);
        return $result[0] ?? null;
    }


    // --- Métodos para Encuentros Clínicos (clinical_encounters) ---

    /**
     * Crea un nuevo encuentro clínico asociado a una historia.
     * @param array $data Datos del encuentro.
     * @return int|false El ID del nuevo encuentro o false en error.
     */
    public function createClinicalEncounter($data) {
        // Asegura que exista la historia clínica
        $medicalRecordId = $this->ensureMedicalRecordExists($data['patient_id']);
        if (!$medicalRecordId) return false; // O lanzar excepción

        $sql = "INSERT INTO clinical_encounters (
                    medical_record_id, appointment_id, doctor_id, specialty_id,
                    encounter_date, encounter_type, chief_complaint, present_illness
                ) VALUES (
                    :medical_record_id, :appointment_id, :doctor_id, :specialty_id,
                    :encounter_date, :encounter_type, :chief_complaint, :present_illness
                )";
        $params = [
            ':medical_record_id' => $medicalRecordId,
            ':appointment_id'    => $data['appointment_id'] ?? null,
            ':doctor_id'         => $data['doctor_id'],
            ':specialty_id'      => $data['specialty_id'],
            ':encounter_date'    => $data['encounter_date'] ?? date('Y-m-d H:i:s'),
            ':encounter_type'    => $data['encounter_type'] ?? 'Consulta',
            ':chief_complaint'   => $data['chief_complaint'] ?? null,
            ':present_illness'   => $data['present_illness'] ?? null
        ];

        if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Obtiene un encuentro clínico por su ID, incluyendo datos del médico y especialidad.
     * @param int $encounterId ID del encuentro.
     * @return array|null El encuentro o null si no existe.
     */
    public function getClinicalEncounterById($encounterId) {
        $sql = "SELECT ce.*, CONCAT(u.first_name, ' ', u.last_name) as doctor_name, ms.name as specialty_name
                FROM clinical_encounters ce
                JOIN users u ON ce.doctor_id = u.id
                JOIN medical_specialties ms ON ce.specialty_id = ms.id
                WHERE ce.id = :id";
        $result = $this->db->query($sql, [':id' => $encounterId]);
        return $result[0] ?? null;
    }

    /**
     * Obtiene todos los encuentros clínicos de una historia médica.
     * @param int $medicalRecordId ID de la historia clínica.
     * @return array Lista de encuentros.
     */
    public function getEncountersByMedicalRecordId($medicalRecordId) {
         $sql = "SELECT ce.*, CONCAT(u.first_name, ' ', u.last_name) as doctor_name, ms.name as specialty_name
                FROM clinical_encounters ce
                JOIN users u ON ce.doctor_id = u.id
                JOIN medical_specialties ms ON ce.specialty_id = ms.id
                WHERE ce.medical_record_id = :medical_record_id
                ORDER BY ce.encounter_date DESC";
        return $this->db->query($sql, [':medical_record_id' => $medicalRecordId]);
    }
    
    /**
     * Obtiene los detalles completos de un encuentro (incluyendo examen, diagnósticos, etc.)
     * @param int $encounterId
     * @return array|null Detalles del encuentro o null
     */
    public function getFullEncounterDetails($encounterId) {
        $encounter = $this->getClinicalEncounterById($encounterId);
        if (!$encounter) return null;

        $encounter['physical_exam'] = $this->db->query("SELECT * FROM physical_exams WHERE encounter_id = :id", [':id' => $encounterId])[0] ?? null;
        $encounter['vital_signs'] = $this->db->query("SELECT * FROM vital_signs WHERE encounter_id = :id ORDER BY recorded_at DESC", [':id' => $encounterId]); // Pueden ser varios
        $encounter['diagnoses'] = $this->db->query("SELECT * FROM diagnoses WHERE encounter_id = :id ORDER BY diagnosis_type", [':id' => $encounterId]);
        $encounter['treatment_plans'] = $this->db->query("SELECT * FROM treatment_plans WHERE encounter_id = :id ORDER BY plan_type", [':id' => $encounterId]);
        $encounter['progress_notes'] = $this->db->query(
            "SELECT pn.*, CONCAT(u.first_name, ' ', u.last_name) as author_name
             FROM progress_notes pn JOIN users u ON pn.created_by = u.id
             WHERE pn.encounter_id = :id ORDER BY pn.created_at DESC", [':id' => $encounterId]);

        return $encounter;
    }


    // --- Métodos para Antecedentes (medical_history) ---

    /**
     * Añade un antecedente a una historia clínica.
     * @param int $medicalRecordId ID de la historia.
     * @param string $historyType Tipo de antecedente.
     * @param string $description Descripción.
     * @param string|null $recordedAt Fecha opcional.
     * @return int|false ID del nuevo antecedente o false.
     */
    public function addMedicalHistory($medicalRecordId, $historyType, $description, $recordedAt = null) {
        $sql = "INSERT INTO medical_history (medical_record_id, history_type, description, recorded_at)
                VALUES (:record_id, :type, :desc, :date)";
        $params = [
            ':record_id' => $medicalRecordId,
            ':type'      => $historyType,
            ':desc'      => $description,
            ':date'      => $recordedAt
        ];
        if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Obtiene todos los antecedentes de una historia clínica, opcionalmente por tipo.
     * @param int $medicalRecordId ID de la historia.
     * @param string|null $historyType Tipo a filtrar (opcional).
     * @return array Lista de antecedentes.
     */
    public function getMedicalHistory($medicalRecordId, $historyType = null) {
        $sql = "SELECT * FROM medical_history WHERE medical_record_id = :record_id";
        $params = [':record_id' => $medicalRecordId];
        if ($historyType) {
            $sql .= " AND history_type = :type";
            $params[':type'] = $historyType;
        }
        $sql .= " ORDER BY history_type, created_at DESC";
        return $this->db->query($sql, $params);
    }

    /**
     * Actualiza un antecedente específico.
     * @param int $historyId ID del antecedente.
     * @param string $description Nueva descripción.
     * @param string|null $recordedAt Nueva fecha opcional.
     * @return bool Éxito o fracaso.
     */
    public function updateMedicalHistory($historyId, $description, $recordedAt = null) {
        $sql = "UPDATE medical_history SET description = :desc, recorded_at = :date, updated_at = NOW()
                WHERE id = :id";
        $params = [':desc' => $description, ':date' => $recordedAt, ':id' => $historyId];
        return $this->db->execute($sql, $params);
    }

    /**
     * Elimina un antecedente.
     * @param int $historyId ID del antecedente.
     * @return bool Éxito o fracaso.
     */
    public function deleteMedicalHistory($historyId) {
        $sql = "DELETE FROM medical_history WHERE id = :id";
        return $this->db->execute($sql, [':id' => $historyId]);
    }

    // --- Métodos para Examen Físico (physical_exams) ---

     /**
     * Guarda o actualiza el examen físico de un encuentro.
     * @param int $encounterId ID del encuentro.
     * @param array $data Datos del examen físico.
     * @return int|false ID del registro o false.
     */
    public function savePhysicalExam($encounterId, $data) {
        // Verificar si ya existe un examen para este encuentro
        $existing = $this->db->query("SELECT id FROM physical_exams WHERE encounter_id = :id LIMIT 1", [':id' => $encounterId]);

        $fields = ['vitals_summary', 'general_appearance', 'head_neck', 'chest_lungs', 'cardiovascular', 'abdomen', 'extremities', 'neurological', 'skin', 'specialty_specific_exam', 'notes'];
        $params = [':encounter_id' => $encounterId];
        foreach ($fields as $field) {
            $params[":$field"] = $data[$field] ?? null;
        }

        if ($existing) {
            // Actualizar
            $sql = "UPDATE physical_exams SET ";
            $updates = [];
            foreach ($fields as $field) {
                $updates[] = "$field = :$field";
            }
            $sql .= implode(', ', $updates);
            $sql .= " WHERE encounter_id = :encounter_id";
            $this->db->execute($sql, $params);
            return $existing[0]['id'];
        } else {
            // Insertar
            $sql = "INSERT INTO physical_exams (encounter_id, exam_date, ";
            $sql .= implode(', ', $fields);
            $sql .= ") VALUES (:encounter_id, NOW(), ";
            $sql .= ':' . implode(', :', $fields);
            $sql .= ")";
             if ($this->db->execute($sql, $params)) {
                return $this->db->lastInsertId();
            }
        }
        return false;
    }


    // --- Métodos para Signos Vitales (vital_signs) ---

    /**
     * Registra un conjunto de signos vitales.
     * @param int $medicalRecordId
     * @param array $data Datos de signos vitales. Puede incluir 'encounter_id'.
     * @return int|false ID del nuevo registro o false.
     */
    public function addVitalSigns($medicalRecordId, $data) {
        // Calcular IMC si tenemos peso y talla
        if (!empty($data['weight']) && !empty($data['height']) && $data['height'] > 0) {
            $data['bmi'] = round($data['weight'] / ($data['height'] * $data['height']), 2);
        } else {
             $data['bmi'] = null;
        }

        $sql = "INSERT INTO vital_signs (
                    medical_record_id, encounter_id, recorded_at,
                    systolic_bp, diastolic_bp, heart_rate, respiratory_rate,
                    temperature, oxygen_saturation, weight, height, bmi, notes
                ) VALUES (
                    :record_id, :encounter_id, :recorded_at,
                    :systolic_bp, :diastolic_bp, :heart_rate, :respiratory_rate,
                    :temperature, :oxygen_saturation, :weight, :height, :bmi, :notes
                )";
        $params = [
            ':record_id' => $medicalRecordId,
            ':encounter_id' => $data['encounter_id'] ?? null,
            ':recorded_at' => $data['recorded_at'] ?? date('Y-m-d H:i:s'),
            ':systolic_bp' => $data['systolic_bp'] ?? null,
            ':diastolic_bp' => $data['diastolic_bp'] ?? null,
            ':heart_rate' => $data['heart_rate'] ?? null,
            ':respiratory_rate' => $data['respiratory_rate'] ?? null,
            ':temperature' => $data['temperature'] ?? null,
            ':oxygen_saturation' => $data['oxygen_saturation'] ?? null,
            ':weight' => $data['weight'] ?? null,
            ':height' => $data['height'] ?? null,
            ':bmi' => $data['bmi'] ?? null,
            ':notes' => $data['notes'] ?? null
        ];

         if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Obtiene los signos vitales por historia clínica.
     * @param int $medicalRecordId
     * @return array
     */
    public function getVitalSignsByRecordId($medicalRecordId) {
        $sql = "SELECT * FROM vital_signs WHERE medical_record_id = :record_id ORDER BY recorded_at DESC";
        return $this->db->query($sql, [':record_id' => $medicalRecordId]);
    }

    // --- Métodos para Diagnósticos (diagnoses) ---

    /**
     * Añade un diagnóstico a un encuentro clínico.
     * @param int $encounterId
     * @param array $data Datos del diagnóstico.
     * @return int|false ID del diagnóstico o false.
     */
    public function addDiagnosis($encounterId, $data) {
         $sql = "INSERT INTO diagnoses (
                    encounter_id, diagnosis_code, diagnosis_description, diagnosis_type, notes, recorded_at
                 ) VALUES (
                    :encounter_id, :code, :desc, :type, :notes, NOW()
                 )";
         $params = [
            ':encounter_id' => $encounterId,
            ':code'         => $data['diagnosis_code'] ?? null,
            ':desc'         => $data['diagnosis_description'],
            ':type'         => $data['diagnosis_type'] ?? 'principal',
            ':notes'        => $data['notes'] ?? null
         ];
          if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }
    
    /**
     * Elimina un diagnóstico.
     * @param int $diagnosisId ID del diagnóstico.
     * @return bool Éxito o fracaso.
     */
    public function deleteDiagnosis($diagnosisId) {
        $sql = "DELETE FROM diagnoses WHERE id = :id";
        return $this->db->execute($sql, [':id' => $diagnosisId]);
    }


    // --- Métodos para Planes y Tratamientos (treatment_plans) ---

    /**
     * Añade un plan/tratamiento a un encuentro.
     * @param int $encounterId
     * @param array $data Datos del plan.
     * @return int|false ID del plan o false.
     */
    public function addTreatmentPlan($encounterId, $data) {
        $sql = "INSERT INTO treatment_plans (encounter_id, plan_type, description, status)
                VALUES (:encounter_id, :type, :desc, :status)";
        $params = [
            ':encounter_id' => $encounterId,
            ':type'         => $data['plan_type'],
            ':desc'         => $data['description'],
            ':status'       => $data['status'] ?? 'active'
        ];
         if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }
    
    /**
     * Elimina un plan/tratamiento.
     * @param int $planId ID del plan.
     * @return bool Éxito o fracaso.
     */
    public function deleteTreatmentPlan($planId) {
        $sql = "DELETE FROM treatment_plans WHERE id = :id";
        return $this->db->execute($sql, [':id' => $planId]);
    }

    // --- Métodos para Notas de Progreso (progress_notes) ---

     /**
     * Añade una nota de progreso a un encuentro.
     * @param int $encounterId
     * @param int $createdBy User ID del autor.
     * @param string $content Contenido de la nota.
     * @param string $noteType Tipo de nota.
     * @return int|false ID de la nota o false.
     */
    public function addProgressNote($encounterId, $createdBy, $content, $noteType = 'Evolución') {
        $sql = "INSERT INTO progress_notes (encounter_id, note_type, note_content, created_by)
                VALUES (:encounter_id, :type, :content, :author)";
        $params = [
            ':encounter_id' => $encounterId,
            ':type'         => $noteType,
            ':content'      => $content,
            ':author'       => $createdBy
        ];
        if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    // --- Métodos para Archivos Adjuntos (record_attachments) ---

    /**
     * Registra un archivo adjunto en la BD.
     * @param int $medicalRecordId
     * @param int $uploadedBy User ID del que sube.
     * @param string $fileName
     * @param string $filePath
     * @param array $options Opcional: encounter_id, file_type, description
     * @return int|false ID del registro o false.
     */
    public function addAttachment($medicalRecordId, $uploadedBy, $fileName, $filePath, $options = []) {
        $sql = "INSERT INTO record_attachments (
                    medical_record_id, encounter_id, file_name, file_path, file_type, description, uploaded_by
                ) VALUES (
                    :record_id, :encounter_id, :fname, :fpath, :ftype, :desc, :uploader
                )";
        $params = [
            ':record_id'    => $medicalRecordId,
            ':encounter_id' => $options['encounter_id'] ?? null,
            ':fname'        => $fileName,
            ':fpath'        => $filePath,
            ':ftype'        => $options['file_type'] ?? null,
            ':desc'         => $options['description'] ?? null,
            ':uploader'     => $uploadedBy
        ];
        if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }
    
     /**
     * Obtiene todos los adjuntos de una historia clínica.
     * @param int $medicalRecordId
     * @return array
     */
    public function getAttachments($medicalRecordId) {
        $sql = "SELECT ra.*, CONCAT(u.first_name, ' ', u.last_name) as uploader_name
                FROM record_attachments ra
                JOIN users u ON ra.uploaded_by = u.id
                WHERE ra.medical_record_id = :record_id
                ORDER BY ra.uploaded_at DESC";
        return $this->db->query($sql, [':record_id' => $medicalRecordId]);
    }
    
    /**
     * Elimina un adjunto (solo el registro en BD, no el archivo físico).
     * @param int $attachmentId
     * @return bool
     */
    public function deleteAttachmentRecord($attachmentId) {
        $sql = "DELETE FROM record_attachments WHERE id = :id";
        return $this->db->execute($sql, [':id' => $attachmentId]);
    }
    
    /**
     * Obtiene la info de un adjunto por ID (para verificar permisos antes de borrar archivo, etc.)
     * @param int $attachmentId
     * @return array|null
     */
    public function getAttachmentById($attachmentId) {
        $sql = "SELECT * FROM record_attachments WHERE id = :id";
        $result = $this->db->query($sql, [':id' => $attachmentId]);
        return $result[0] ?? null;
    }


    // --- Métodos para Informes Médicos (medical_reports) ---

    /**
     * Crea un nuevo informe médico.
     * @param array $data Datos del informe.
     * @return int|false ID del nuevo informe o false.
     */
    public function createMedicalReport($data) {
        $sql = "INSERT INTO medical_reports (
                    medical_record_id, encounter_id, doctor_id, report_date,
                    report_type, recipient, content, status
                ) VALUES (
                    :record_id, :encounter_id, :doctor_id, :report_date,
                    :type, :recipient, :content, :status
                )";
        $params = [
            ':record_id'    => $data['medical_record_id'],
            ':encounter_id' => $data['encounter_id'] ?? null,
            ':doctor_id'    => $data['doctor_id'], // Quien lo elabora
            ':report_date'  => $data['report_date'] ?? date('Y-m-d'),
            ':type'         => $data['report_type'] ?? null,
            ':recipient'    => $data['recipient'] ?? null,
            ':content'      => $data['content'],
            ':status'       => $data['status'] ?? 'draft'
        ];
         if ($this->db->execute($sql, $params)) {
            return $this->db->lastInsertId();
        }
        return false;
    }

     /**
     * Obtiene un informe médico por su ID.
     * @param int $reportId
     * @return array|null
     */
    public function getMedicalReportById($reportId) {
        $sql = "SELECT mr.*, CONCAT(u.first_name, ' ', u.last_name) as doctor_name
                FROM medical_reports mr
                JOIN users u ON mr.doctor_id = u.id
                WHERE mr.id = :id";
        $result = $this->db->query($sql, [':id' => $reportId]);
        return $result[0] ?? null;
    }

    /**
     * Obtiene todos los informes médicos de una historia clínica.
     * @param int $medicalRecordId
     * @return array
     */
    public function getReportsByMedicalRecordId($medicalRecordId) {
        $sql = "SELECT mr.id, mr.report_date, mr.report_type, mr.status, mr.created_at, mr.doctor_id, CONCAT(u.first_name, ' ', u.last_name) as doctor_name
                FROM medical_reports mr
                JOIN users u ON mr.doctor_id = u.id
                WHERE mr.medical_record_id = :record_id
                ORDER BY mr.report_date DESC, mr.created_at DESC";
        return $this->db->query($sql, [':record_id' => $medicalRecordId]);
    }

    /**
     * Actualiza un informe médico.
     * @param int $reportId
     * @param array $data Nuevos datos (content, type, recipient, status).
     * @return bool
     */
    public function updateMedicalReport($reportId, $data) {
        $sql = "UPDATE medical_reports SET
                    report_type = :type,
                    recipient = :recipient,
                    content = :content,
                    status = :status,
                    updated_at = NOW()
                WHERE id = :id";
         $params = [
            ':type'         => $data['report_type'] ?? null,
            ':recipient'    => $data['recipient'] ?? null,
            ':content'      => $data['content'],
            ':status'       => $data['status'] ?? 'draft',
            ':id'           => $reportId
        ];
        return $this->db->execute($sql, $params);
    }
    
    /**
     * Elimina un informe médico.
     * @param int $reportId
     * @return bool
     */
    public function deleteMedicalReport($reportId) {
        $sql = "DELETE FROM medical_reports WHERE id = :id";
        return $this->db->execute($sql, [':id' => $reportId]);
    }

}
?>