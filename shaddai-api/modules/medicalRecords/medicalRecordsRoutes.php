<?php
require_once __DIR__ . '/MedicalRecordsController.php';

use Middlewares\RoleMiddleware;

class MedicalRecordsRoutes {

    public static function register($router) {

        $controller = new MedicalRecordsController();

        // --- Rutas Principales de Historia Clínica ---
        // Obtener HC por ID de paciente (ruta preferida para buscar)
        $router->add('GET', 'medicalrecords/patient/{patientId}', [$controller, 'getMedicalRecordByPatient'], ['auth', 'role:admin,medico,recepcionista']);
        // Obtener HC por Cédula de paciente
        $router->add('GET', 'medicalrecords/patient/cedula/{cedula}', [$controller, 'getMedicalRecordByPatientCedula'], ['auth', 'role:admin,medico,recepcionista']);
        // Obtener HC por ID de HC (menos común para buscar, más para acceder directo)
        $router->add('GET', 'medicalrecords/{id}', [$controller, 'getMedicalRecord'], ['auth', 'role:admin,medico']);
    // Crear (asegurar) HC para un paciente explícitamente (solo médico/admin)
    $router->add('POST', 'medicalrecords/patient/{patientId}', [$controller, 'createMedicalRecordForPatient'], ['auth', 'role:admin,medico']);


        // --- Rutas para Encuentros Clínicos ---
        // Crear un nuevo encuentro (usualmente un médico)
        $router->add('POST', 'medicalrecords/encounters', [$controller, 'createEncounter'], ['auth', 'role:admin,medico']);
        // Obtener detalles completos de UN encuentro por ID
        $router->add('GET', 'medicalrecords/encounters/{id}', [$controller, 'getEncounterDetails'], ['auth', 'role:admin,medico']);
        // Listar TODOS los encuentros de UNA historia clínica
        $router->add('GET', 'medicalrecords/{recordId}/encounters', [$controller, 'getEncountersForRecord'], ['auth', 'role:admin,medico']);


        // --- Rutas para Antecedentes (Medical History) ---
        // Añadir un antecedente a una historia
        $router->add('POST', 'medicalrecords/{recordId}/history', [$controller, 'addHistoryItem'], ['auth', 'role:admin,medico']);
        // Obtener los antecedentes de una historia (opcionalmente filtrado por tipo)
        $router->add('GET', 'medicalrecords/{recordId}/history', [$controller, 'getHistoryItems'], ['auth', 'role:admin,medico,recepcionista']); // Recepcionista podría verlos
        // Actualizar un antecedente específico
        $router->add('PUT', 'medicalrecords/history/{historyId}', [$controller, 'updateHistoryItem'], ['auth', 'role:admin,medico']);
        // Eliminar un antecedente específico
        $router->add('DELETE', 'medicalrecords/history/{historyId}', [$controller, 'deleteHistoryItem'], ['auth', 'role:admin,medico']);


        // --- Rutas para Examen Físico ---
        // Guardar o actualizar el examen físico para un encuentro
        $router->add('POST', 'medicalrecords/encounters/{encounterId}/physicalexam', [$controller, 'savePhysicalExamForEncounter'], ['auth', 'role:admin,medico']);
        $router->add('PUT', 'medicalrecords/encounters/{encounterId}/physicalexam', [$controller, 'savePhysicalExamForEncounter'], ['auth', 'role:admin,medico']); // Alias PUT


        // --- Rutas para Signos Vitales ---
        // Añadir signos vitales (preferiblemente ligado a un encuentro)
        $router->add('POST', 'medicalrecords/encounters/{encounterId}/vitalsigns', [$controller, 'addVitalSignsRecord'], ['auth', 'role:admin,medico,recepcionista']); // Recepcionista puede tomarlos
        // Añadir signos vitales directamente a la historia (menos común)
        $router->add('POST', 'medicalrecords/{recordId}/vitalsigns', [$controller, 'addVitalSignsRecord'], ['auth', 'role:admin,medico,recepcionista']);
    // Listar signos vitales de una HC (timeline)
    $router->add('GET', 'medicalrecords/{recordId}/vitalsigns', [$controller, 'getVitalSignsForRecord'], ['auth', 'role:admin,medico,recepcionista']);
    // Listar signos vitales por historia clínica (timeline)
    $router->add('GET', 'medicalrecords/{recordId}/vitalsigns', [$controller, 'getVitalSignsForRecord'], ['auth', 'role:admin,medico,recepcionista']);


        // --- Rutas para Diagnósticos ---
        // Añadir diagnóstico a un encuentro
        $router->add('POST', 'medicalrecords/encounters/{encounterId}/diagnoses', [$controller, 'addDiagnosisToEncounter'], ['auth', 'role:admin,medico']);
        // Eliminar un diagnóstico específico (requiere ID del diagnóstico)
        $router->add('DELETE', 'medicalrecords/diagnoses/{diagnosisId}', [$controller, 'deleteDiagnosisEntry'], ['auth', 'role:admin,medico']);


        // --- Rutas para Planes/Tratamientos ---
        // Añadir plan/tratamiento a un encuentro
        $router->add('POST', 'medicalrecords/encounters/{encounterId}/treatmentplans', [$controller, 'addTreatmentPlanToEncounter'], ['auth', 'role:admin,medico']);
        // Eliminar un plan/tratamiento específico
        $router->add('DELETE', 'medicalrecords/treatmentplans/{planId}', [$controller, 'deleteTreatmentPlanEntry'], ['auth', 'role:admin,medico']);


        // --- Rutas para Notas de Progreso ---
        // Añadir nota a un encuentro
        $router->add('POST', 'medicalrecords/encounters/{encounterId}/progressnotes', [$controller, 'addProgressNoteToEncounter'], ['auth', 'role:admin,medico']);
        // (No suelen haber rutas para editar/eliminar notas)


        // --- Rutas para Archivos Adjuntos ---
        // Registrar info de un adjunto para una historia
        $router->add('POST', 'medicalrecords/{recordId}/attachments', [$controller, 'registerAttachment'], ['auth', 'role:admin,medico,recepcionista']);
        // Registrar info de un adjunto ligado a un encuentro
        $router->add('POST', 'medicalrecords/encounters/{encounterId}/attachments', [$controller, 'registerAttachment'], ['auth', 'role:admin,medico,recepcionista']);
        // Listar adjuntos de una historia
        $router->add('GET', 'medicalrecords/{recordId}/attachments', [$controller, 'getAttachmentsForRecord'], ['auth', 'role:admin,medico,recepcionista']);
        // Eliminar el registro de un adjunto (no el archivo físico)
        $router->add('DELETE', 'medicalrecords/attachments/{attachmentId}', [$controller, 'deleteAttachment'], ['auth', 'role:admin,medico']);
        // Descargar archivo adjunto
        $router->add('GET', 'medicalrecords/attachments/{attachmentId}/download', [$controller, 'downloadAttachment'], ['auth', 'role:admin,medico,recepcionista']);


        // --- Rutas para Informes Médicos ---
        // Crear un informe para una historia
        $router->add('POST', 'medicalrecords/{recordId}/reports', [$controller, 'createReport'], ['auth', 'role:admin,medico']);
        // Crear un informe basado en un encuentro
        $router->add('POST', 'medicalrecords/encounters/{encounterId}/reports', [$controller, 'createReport'], ['auth', 'role:admin,medico']);
        // Obtener la lista de informes (metadatos) de una historia
        $router->add('GET', 'medicalrecords/{recordId}/reports', [$controller, 'getReportsForRecord'], ['auth', 'role:admin,medico']);
        // Obtener el contenido completo de un informe por su ID
        $router->add('GET', 'medicalrecords/reports/{reportId}', [$controller, 'getReportById'], ['auth', 'role:admin,medico']);
        // Actualizar un informe existente
        $router->add('PUT', 'medicalrecords/reports/{reportId}', [$controller, 'updateReport'], ['auth', 'role:admin,medico']);
        // Eliminar un informe
        $router->add('DELETE', 'medicalrecords/reports/{reportId}', [$controller, 'deleteReport'], ['auth', 'role:admin,medico']);
         // Nota: Necesitarás una ruta para *exportar/imprimir* el informe, ej. GET /medicalrecords/reports/{reportId}/export[?format=pdf]

    }
}
?>