<?php
require_once __DIR__ . '/MedicalRecordsModel.php';
require_once __DIR__ . '/../patients/PatientsModel.php';
require_once __DIR__ . '/../../services/ReportGeneratorService.php';

class MedicalRecordsController {
    private $model;
    private $patientModel; // Opcional, para buscar paciente

    public function __construct() {
        $this->model = new MedicalRecordsModel();
        $this->patientModel = new PatientsModel(); // Opcional
    }

    /**
     * Obtiene la historia clínica de un paciente por el ID del paciente.
     * GET /medicalrecords/patient/{patientId}
     */
    public function getMedicalRecordByPatient($patientId) {
        try {
            $record = $this->model->getMedicalRecordByPatientId($patientId);
            if ($record) {
                // Opcional: Cargar aquí un resumen (ej. últimos encuentros, antecedentes clave)
                $record['recent_encounters'] = $this->model->getEncountersByMedicalRecordId($record['id']); // Trae todos por ahora
                $record['history_summary'] = $this->model->getMedicalHistory($record['id']); // Trae todos por ahora
                echo json_encode($record);
            } else {
                // Si no existe, podría crearse automáticamente o devolver 404
                 http_response_code(404);
                 echo json_encode(['error' => 'Historia clínica no encontrada para este paciente.']);
                // Opcional: Crearla si no existe
                // $recordId = $this->model->ensureMedicalRecordExists($patientId);
                // $newRecord = $this->model->getMedicalRecordById($recordId);
                // echo json_encode($newRecord);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Obtiene la historia clínica de un paciente buscando por cédula del paciente.
     * GET /medicalrecords/patient/cedula/{cedula}
     */
    public function getMedicalRecordByPatientCedula($cedula) {
        try {
            $patient = $this->patientModel->findPatientByCedula($cedula);
            if (!$patient) {
                http_response_code(404);
                echo json_encode(['error' => 'Paciente con esa cédula no encontrado.']);
                return;
            }
            // Llama a la función que busca por ID de paciente
            $this->getMedicalRecordByPatient($patient['id']);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Crea/Asegura la historia clínica de un paciente (solo médico/admin).
     * POST /medicalrecords/patient/{patientId}
     */
    public function createMedicalRecordForPatient($patientId) {
        try {
            // Validar rol (aunque RoleMiddleware ya filtra, aquí podrías reforzar si deseas)
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) { throw new Exception('No autorizado'); }
            $roles = $payload->roles ?? [];
            if (!(in_array('admin', $roles) || in_array('medico', $roles))) {
                http_response_code(403);
                echo json_encode(['error' => 'Acceso denegado']);
                return;
            }

            // Validar que el paciente exista
            $patient = $this->patientModel->getPatientById($patientId);
            if (!$patient) {
                http_response_code(404);
                echo json_encode(['error' => 'Paciente no encontrado']);
                return;
            }

            $recordId = $this->model->ensureMedicalRecordExists($patientId);
            $record = $this->model->getMedicalRecordById($recordId);
            // Devolver con estructuras básicas para UI
            $record['recent_encounters'] = $this->model->getEncountersByMedicalRecordId($record['id']);
            $record['history_summary'] = $this->model->getMedicalHistory($record['id']);

            http_response_code(201);
            echo json_encode(['message' => 'Historia clínica creada o asegurada', 'record' => $record]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Obtiene la historia clínica por su ID directo.
     * GET /medicalrecords/{id}
     */
    public function getMedicalRecord($id) {
        try {
            $record = $this->model->getMedicalRecordById($id);
            if ($record) {
                 // Opcional: Cargar detalles completos aquí si es necesario
                $record['encounters'] = $this->model->getEncountersByMedicalRecordId($record['id']);
                $record['history'] = $this->model->getMedicalHistory($record['id']);
                $record['attachments'] = $this->model->getAttachments($record['id']);
                $record['reports'] = $this->model->getReportsByMedicalRecordId($record['id']);
                echo json_encode($record);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Historia clínica no encontrada']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }


    // --- Endpoints para Encuentros Clínicos ---

    /**
     * Crea un nuevo encuentro clínico.
     * POST /medicalrecords/encounters
     */
    public function createEncounter() {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

            // Validación básica
            if (empty($data['patient_id']) || empty($data['doctor_id']) || empty($data['specialty_id'])) {
                 throw new Exception('patient_id, doctor_id y specialty_id son requeridos.');
            }
            
             // Obtener el usuario autenticado (asumiendo que es el médico)
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload || $jwtPayload->sub != $data['doctor_id']) {
                 // Podrías permitir que un admin cree para otro doctor, ajusta la lógica si es necesario
                 //throw new Exception('No autorizado para crear este encuentro clínico.');
            }
             // Asegúrate de que el doctor_id coincide con el usuario logueado o que tiene permisos
             // $data['doctor_id'] = $jwtPayload->sub; // Forzar que sea el logueado?

            $encounterId = $this->model->createClinicalEncounter($data);

            if ($encounterId) {
                http_response_code(201);
                // Devolver el encuentro recién creado
                 $newEncounter = $this->model->getClinicalEncounterById($encounterId);
                echo json_encode(['message' => 'Encuentro clínico creado', 'encounter' => $newEncounter]);
            } else {
                throw new Exception('No se pudo crear el encuentro clínico.');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Wrapper para añadir signos vitales desde una ruta de encuentro.
     * POST /medicalrecords/encounters/{encounterId}/vitalsigns
     */
    public function addVitalSignsFromEncounter($encounterId) {
        try {
            // 1. Buscamos el encuentro para saber a qué historia pertenece
            $encounter = $this->model->getClinicalEncounterById($encounterId);
            
            if (!$encounter) {
                http_response_code(404);
                echo json_encode(['error' => 'Encuentro clínico no encontrado.']);
                return;
            }

            // 2. Extraemos el ID real de la historia clínica
            $realRecordId = $encounter['medical_record_id'];

            // 3. Llamamos a la función principal con los parámetros en el orden CORRECTO
            // ($recordId, $encounterId)
            $this->addVitalSignsRecord($realRecordId, $encounterId);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Obtiene los detalles completos de un encuentro clínico por ID.
     * GET /medicalrecords/encounters/{id}
     */
    public function getEncounterDetails($id) {
         try {
            $details = $this->model->getFullEncounterDetails($id);
            if ($details) {
                echo json_encode($details);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Encuentro clínico no encontrado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
     /**
     * Obtiene todos los encuentros de una historia clínica.
     * GET /medicalrecords/{recordId}/encounters
     */
    public function getEncountersForRecord($recordId) {
        try {
            $encounters = $this->model->getEncountersByMedicalRecordId($recordId);
            echo json_encode($encounters);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }


    // --- Endpoints para Antecedentes ---

    /**
     * Añade un antecedente a una historia.
     * POST /medicalrecords/{recordId}/history
     */
    public function addHistoryItem($recordId) {
        try {
             $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
             if (empty($data['history_type']) || empty($data['description'])) {
                 throw new Exception('Tipo de antecedente y descripción son requeridos.');
             }

             $historyId = $this->model->addMedicalHistory($recordId, $data['history_type'], $data['description'], $data['recorded_at'] ?? null);

             if ($historyId) {
                  http_response_code(201);
                  echo json_encode(['message' => 'Antecedente añadido', 'id' => $historyId]);
             } else {
                 throw new Exception('No se pudo añadir el antecedente.');
             }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Obtiene los antecedentes de una historia.
     * GET /medicalrecords/{recordId}/history[?type=...]
     */
    public function getHistoryItems($recordId) {
        try {
            $type = $_GET['type'] ?? null;
            $history = $this->model->getMedicalHistory($recordId, $type);
            echo json_encode($history);
        } catch (Exception $e) {
             http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Actualiza un antecedente.
     * PUT /medicalrecords/history/{historyId}
     */
    public function updateHistoryItem($historyId) {
         try {
             $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
             if (empty($data['description'])) {
                 throw new Exception('La descripción es requerida.');
             }
             $historyType = $data['history_type'] ?? 'other';
             $result = $this->model->updateMedicalHistory($historyId, $historyType, $data['description'], $data['recorded_at'] ?? null);
             if ($result) {
                 echo json_encode(['message' => 'Antecedente actualizado']);
             } else {
                  throw new Exception('No se pudo actualizar el antecedente.');
             }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Elimina un antecedente.
     * DELETE /medicalrecords/history/{historyId}
     */
    public function deleteHistoryItem($historyId) {
         try {
             $result = $this->model->deleteMedicalHistory($historyId);
             if ($result) {
                 echo json_encode(['message' => 'Antecedente eliminado']);
             } else {
                  throw new Exception('No se pudo eliminar el antecedente.');
             }
        } catch (Exception $e) {
            http_response_code(500); // Podría ser 404 si no existe
            echo json_encode(['error' => $e->getMessage()]);
        }
    }


    // --- Endpoints para Examen Físico ---

    /**
     * Guarda/Actualiza el examen físico de un encuentro.
     * POST /medicalrecords/encounters/{encounterId}/physicalexam
     * PUT /medicalrecords/encounters/{encounterId}/physicalexam
     */
    public function savePhysicalExamForEncounter($encounterId) {
        try {
             $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
             // Validar que el encuentro exista y pertenezca al médico logueado (o admin)
             // ... (lógica de validación de permisos) ...

             $result = $this->model->savePhysicalExam($encounterId, $data);
             if ($result) {
                  echo json_encode(['message' => 'Examen físico guardado', 'id' => $result]);
             } else {
                 throw new Exception('No se pudo guardar el examen físico.');
             }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
    // --- Endpoints para Signos Vitales ---
    // (Similar a examen físico, asociado a encuentro o directamente a la historia)
    
     /**
     * Añade un registro de signos vitales.
     * POST /medicalrecords/{recordId}/vitalsigns
     * POST /medicalrecords/encounters/{encounterId}/vitalsigns (preferible si es durante consulta)
     */
    public function addVitalSignsRecord($recordId = null, $encounterId = null) {
         try {
             $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

             if (!$recordId && $encounterId) {
                  // Obtener recordId desde encounterId si no se provee directamente
                  $encounter = $this->model->getClinicalEncounterById($encounterId);
                  if (!$encounter) throw new Exception('Encuentro no válido.');
                  $recordId = $encounter['medical_record_id'];
             } elseif (!$recordId) {
                 throw new Exception('Se requiere medical_record_id o encounter_id.');
             }
             
             $data['encounter_id'] = $encounterId; // Pasar el ID del encuentro si viene de esa ruta

             $vitalId = $this->model->addVitalSigns($recordId, $data);
             if ($vitalId) {
                  http_response_code(201);
                  echo json_encode(['message' => 'Signos vitales registrados', 'id' => $vitalId]);
             } else {
                 throw new Exception('No se pudo registrar los signos vitales.');
             }

         } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Lista los signos vitales de una historia clínica (timeline).
     * GET /medicalrecords/{recordId}/vitalsigns
     */
    public function getVitalSignsForRecord($recordId) {
        try {
            $vitals = $this->model->getVitalSignsByRecordId($recordId);
            echo json_encode($vitals);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }


    // --- Endpoints para Diagnósticos ---

    /**
     * Añade un diagnóstico a un encuentro.
     * POST /medicalrecords/encounters/{encounterId}/diagnoses
     */
     public function addDiagnosisToEncounter($encounterId) {
         try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
             if (empty($data['diagnosis_description'])) {
                 throw new Exception('La descripción del diagnóstico es requerida.');
             }
             // Validar permisos sobre el encuentro...

             $diagId = $this->model->addDiagnosis($encounterId, $data);
             if ($diagId) {
                  http_response_code(201);
                  echo json_encode(['message' => 'Diagnóstico añadido', 'id' => $diagId]);
             } else {
                 throw new Exception('No se pudo añadir el diagnóstico.');
             }
         } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     
     /**
     * Elimina un diagnóstico.
     * DELETE /medicalrecords/diagnoses/{diagnosisId}
     */
     public function deleteDiagnosisEntry($diagnosisId) {
         // Añadir validación de permisos aquí: ¿El usuario puede borrar este diagnóstico?
         try {
             $result = $this->model->deleteDiagnosis($diagnosisId);
             if ($result) {
                 echo json_encode(['message' => 'Diagnóstico eliminado']);
             } else {
                  throw new Exception('No se pudo eliminar el diagnóstico.');
             }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }


    // --- Endpoints para Planes y Tratamientos ---
    // (Similar a Diagnósticos)
     /**
     * Añade un plan/tratamiento a un encuentro.
     * POST /medicalrecords/encounters/{encounterId}/treatmentplans
     */
     public function addTreatmentPlanToEncounter($encounterId) {
          try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
             if (empty($data['plan_type']) || empty($data['description'])) {
                 throw new Exception('Tipo y descripción del plan son requeridos.');
             }
             // Validar permisos...

             $planId = $this->model->addTreatmentPlan($encounterId, $data);
             if ($planId) {
                  http_response_code(201);
                  echo json_encode(['message' => 'Plan/Tratamiento añadido', 'id' => $planId]);
             } else {
                 throw new Exception('No se pudo añadir el plan/tratamiento.');
             }
         } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     
      /**
     * Elimina un plan/tratamiento.
     * DELETE /medicalrecords/treatmentplans/{planId}
     */
     public function deleteTreatmentPlanEntry($planId) {
         // Validar permisos...
         try {
             $result = $this->model->deleteTreatmentPlan($planId);
             if ($result) {
                 echo json_encode(['message' => 'Plan/Tratamiento eliminado']);
             } else {
                  throw new Exception('No se pudo eliminar el plan/tratamiento.');
             }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }


    // --- Endpoints para Notas de Progreso ---

    /**
     * Añade una nota de progreso a un encuentro.
     * POST /medicalrecords/encounters/{encounterId}/progressnotes
     */
     public function addProgressNoteToEncounter($encounterId) {
         try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
             if (empty($data['note_content'])) {
                 throw new Exception('El contenido de la nota es requerido.');
             }
             
            // Obtener usuario autenticado (autor de la nota)
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                 throw new Exception('No autorizado.');
            }
            $createdBy = $jwtPayload->sub;
            // Validar permisos sobre el encuentro...

            $noteId = $this->model->addProgressNote(
                $encounterId,
                $createdBy,
                $data['note_content'],
                $data['note_type'] ?? 'Evolución'
            );

            if ($noteId) {
                  http_response_code(201);
                  echo json_encode(['message' => 'Nota añadida', 'id' => $noteId]);
             } else {
                 throw new Exception('No se pudo añadir la nota.');
             }
         } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     // Nota: Generalmente las notas no se editan ni eliminan, se añaden nuevas. Si necesitas editar/eliminar, añade los métodos correspondientes.


    // --- Endpoints para Archivos Adjuntos ---
    // (Asume que la subida del archivo se maneja aparte, aquí solo registramos la info en BD)

    /**
     * Registra un archivo adjunto a una historia (o a un encuentro).
     * POST /medicalrecords/{recordId}/attachments
     * POST /medicalrecords/encounters/{encounterId}/attachments
     */
     public function registerAttachment($recordId = null, $encounterId = null) {
        try {
            // Nota: $_POST se usa aquí asumiendo que los datos vienen de un form-data
            // Si envías JSON, ajusta para leer `php://input`
            $data = $_POST;
            $fileInfo = $_FILES['attachmentFile'] ?? null; // Asume que el archivo se llama 'attachmentFile'

            if (!$fileInfo || $fileInfo['error'] !== UPLOAD_ERR_OK) {
                 throw new Exception('Error al subir el archivo o archivo no proporcionado.');
            }
             if (!$recordId && $encounterId) {
                  $encounter = $this->model->getClinicalEncounterById($encounterId);
                  if (!$encounter) throw new Exception('Encuentro no válido.');
                  $recordId = $encounter['medical_record_id'];
             } elseif (!$recordId) {
                 throw new Exception('Se requiere medical_record_id o encounter_id.');
             }

            // Lógica para mover el archivo subido a una ubicación segura
            $uploadDir = __DIR__ . '/../../public/uploads/medical_records/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Generar nombre único para evitar colisiones
            $extension = pathinfo($fileInfo['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('att_', true) . '.' . $extension;
            $filePath = $uploadDir . $fileName;
            
            if (!move_uploaded_file($fileInfo['tmp_name'], $filePath)) {
                throw new Exception('Error al mover el archivo subido.');
            }

            // Obtener usuario autenticado
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) throw new Exception('No autorizado.');
            $uploadedBy = $jwtPayload->sub;

            $options = [
                'encounter_id' => $encounterId,
                'file_type' => $fileInfo['type'],
                'description' => $data['description'] ?? null
            ];

            // Guardamos la ruta relativa a 'public/'
            $dbPath = 'uploads/medical_records/' . $fileName;

            $attachId = $this->model->addAttachment($recordId, $uploadedBy, $fileInfo['name'], $dbPath, $options);

            if ($attachId) {
                  http_response_code(201);
                  echo json_encode(['message' => 'Archivo adjunto registrado', 'id' => $attachId, 'path' => $dbPath]);
             } else {
                 // Borrar archivo si falla BD
                 if (file_exists($filePath)) unlink($filePath);
                 throw new Exception('No se pudo registrar el adjunto.');
             }

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }

    /**
     * Descarga un archivo adjunto.
     * GET /medicalrecords/attachments/{attachmentId}/download
     */
    public function downloadAttachment($attachmentId) {
        try {
            $attachment = $this->model->getAttachmentById($attachmentId);
            if (!$attachment) {
                http_response_code(404);
                throw new Exception('Adjunto no encontrado.');
            }

            // Construir ruta física
            // La ruta en BD es relativa a public/ ej: uploads/medical_records/archivo.pdf
            // __DIR__ es modules/medicalRecords
            $baseDir = __DIR__ . '/../../public/';
            $filePath = $baseDir . $attachment['file_path'];

            // Normalizar separadores de directorio para Windows/Linux
            $filePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $filePath);

            if (!file_exists($filePath)) {
                // Fallback: intentar ver si la ruta en BD era absoluta o relativa diferente (para compatibilidad con datos viejos si los hubiera)
                if (file_exists($attachment['file_path'])) {
                     $filePath = $attachment['file_path'];
                } else {
                    http_response_code(404);
                    throw new Exception('El archivo físico no existe en el servidor.');
                }
            }

            // Forzar descarga
            header('Content-Description: File Transfer');
            header('Content-Type: ' . ($attachment['file_type'] ?: 'application/octet-stream'));
            header('Content-Disposition: attachment; filename="' . basename($attachment['file_name']) . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath));
            header('Access-Control-Expose-Headers: Content-Disposition');
            
            // Limpiar buffer de salida para evitar corrupción de archivos
            while (ob_get_level()) ob_end_clean();
            
            readfile($filePath);
            exit;

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
     
     /**
     * Obtiene la lista de adjuntos de una historia.
     * GET /medicalrecords/{recordId}/attachments
     */
     public function getAttachmentsForRecord($recordId) {
          try {
            $attachments = $this->model->getAttachments($recordId);
            echo json_encode($attachments);
        } catch (Exception $e) {
             http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     
      /**
     * Elimina el registro de un adjunto.
     * DELETE /medicalrecords/attachments/{attachmentId}
     */
     public function deleteAttachment($attachmentId) {
        // Validar permisos... ¿El usuario puede borrar esto?
        // Obtener la ruta del archivo ANTES de borrar el registro
        $attachment = $this->model->getAttachmentById($attachmentId);
        if (!$attachment) {
             http_response_code(404);
             echo json_encode(['error' => 'Adjunto no encontrado.']);
             return;
        }
        $filePath = $attachment['file_path'];

         try {
             $result = $this->model->deleteAttachmentRecord($attachmentId);
             if ($result) {
                 // Opcional: Intentar borrar el archivo físico
                 // if (file_exists($filePath)) {
                 //     unlink($filePath);
                 // }
                 echo json_encode(['message' => 'Registro de adjunto eliminado']);
             } else {
                  throw new Exception('No se pudo eliminar el registro del adjunto.');
             }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }


    // --- Endpoints para Informes Médicos ---

    /**
     * Crea un nuevo informe médico.
     * POST /medicalrecords/{recordId}/reports
     * POST /medicalrecords/encounters/{encounterId}/reports (si se basa en un encuentro)
     */
     public function createReport($recordId = null, $encounterId = null) {
          try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            if (empty($data['content'])) {
                 throw new Exception('El contenido del informe es requerido.');
            }
             if (!$recordId && $encounterId) {
                  $encounter = $this->model->getClinicalEncounterById($encounterId);
                  if (!$encounter) throw new Exception('Encuentro no válido.');
                  $recordId = $encounter['medical_record_id'];
             } elseif (!$recordId) {
                 throw new Exception('Se requiere medical_record_id o encounter_id.');
             }

            // Obtener doctor (autor)
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) throw new Exception('No autorizado.');
            $doctorId = $jwtPayload->sub; // Asume que el médico logueado es el autor
            // Validar que sea médico o admin...
             $isDoctor = in_array('medico', $jwtPayload->roles ?? []);
             $isAdmin = in_array('admin', $jwtPayload->roles ?? []);
             if (!$isDoctor && !$isAdmin) {
                 throw new Exception('Solo médicos o administradores pueden crear informes.');
             }
             // Si un admin lo crea para otro doctor, permitir pasar doctor_id en $data
             $data['doctor_id'] = ($isAdmin && isset($data['doctor_id'])) ? $data['doctor_id'] : $doctorId;


            $data['medical_record_id'] = $recordId;
            $data['encounter_id'] = $encounterId; // Puede ser null

            $reportId = $this->model->createMedicalReport($data);

            if ($reportId) {
                  http_response_code(201);
                  $newReport = $this->model->getMedicalReportById($reportId); // Obtener para devolver
                  echo json_encode(['message' => 'Informe médico creado', 'report' => $newReport]);
             } else {
                 throw new Exception('No se pudo crear el informe médico.');
             }

         } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     
     /**
     * Obtiene un informe médico por ID (con contenido).
     * GET /medicalrecords/reports/{reportId}
     */
     public function getReportById($reportId) {
          try {
            // Validar permisos: ¿Puede ver este informe?
            $report = $this->model->getMedicalReportById($reportId);
            if ($report) {
                echo json_encode($report);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Informe no encontrado']);
            }
        } catch (Exception $e) {
             http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     
     /**
     * Obtiene la lista de informes de una historia (sin contenido, solo metadatos).
     * GET /medicalrecords/{recordId}/reports
     */
     public function getReportsForRecord($recordId) {
         try {
            // Validar permisos...
            $reports = $this->model->getReportsByMedicalRecordId($recordId);
            echo json_encode($reports);
        } catch (Exception $e) {
             http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     
     /**
     * Actualiza un informe médico.
     * PUT /medicalrecords/reports/{reportId}
     */
     public function updateReport($reportId) {
         try {
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
             if (empty($data['content'])) {
                 throw new Exception('El contenido del informe es requerido.');
             }
            // Validar permisos: solo el autor puede actualizar
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                http_response_code(401);
                echo json_encode(['error' => 'No autorizado.']);
                return;
            }
            $report = $this->model->getMedicalReportById($reportId);
            if (!$report) {
                http_response_code(404);
                echo json_encode(['error' => 'Informe no encontrado']);
                return;
            }
            if ((string)$jwtPayload->sub !== (string)$report['doctor_id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Solo el creador puede modificar este informe.']);
                return;
            }

            $result = $this->model->updateMedicalReport($reportId, $data);
             if ($result) {
                 $updatedReport = $this->model->getMedicalReportById($reportId); // Obtener actualizado
                 echo json_encode(['message' => 'Informe actualizado', 'report' => $updatedReport]);
             } else {
                  throw new Exception('No se pudo actualizar el informe.');
             }
         } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }
     
      /**
     * Elimina un informe médico.
     * DELETE /medicalrecords/reports/{reportId}
     */
     public function deleteReport($reportId) {
         // Validar permisos...
         try {
            // Validar permisos: solo el autor puede eliminar
            $jwtPayload = $_REQUEST['jwt_payload'] ?? null;
            if (!$jwtPayload) {
                http_response_code(401);
                echo json_encode(['error' => 'No autorizado.']);
                return;
            }
            $report = $this->model->getMedicalReportById($reportId);
            if (!$report) {
                http_response_code(404);
                echo json_encode(['error' => 'Informe no encontrado']);
                return;
            }
            if ((string)$jwtPayload->sub !== (string)$report['doctor_id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Solo el creador puede eliminar este informe.']);
                return;
            }

            $result = $this->model->deleteMedicalReport($reportId);
             if ($result) {
                 echo json_encode(['message' => 'Informe eliminado']);
             } else {
                  throw new Exception('No se pudo eliminar el informe.');
             }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
     }

    /**
     * Genera reporte de evolución (signos vitales).
     * GET /medicalrecords/{recordId}/reports/evolution
     */
    public function generateEvolutionReport($recordId) {
        try {
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;
            $startTime = $_GET['start_time'] ?? null;
            $endTime = $_GET['end_time'] ?? null;
            
            $vitals = $this->model->getVitalSignsForReport($recordId, $startDate, $endDate, $startTime, $endTime);
            $record = $this->model->getMedicalRecordById($recordId);
            
            if (!$record) {
                throw new Exception('Historia clínica no encontrada');
            }

            $reportService = new ReportGeneratorService();
            $filename = 'Evolucion_' . ($record['patient_cedula'] ?? 'NA') . '_' . date('YmdHis');
            
            $generatedBy = 'Sistema'; // Podría mejorarse con info del token
            
            $reportService->generateEvolutionSheetPdf($vitals, $record, $startDate, $endDate, $startTime, $endTime, $filename, $generatedBy);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

}
