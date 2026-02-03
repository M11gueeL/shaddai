<?php
/**
 * Script de envío de recordatorios - Shaddai
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/EmailServive.php'; 

date_default_timezone_set('America/Caracas');

try {
    $db = Database::getInstance();
    $emailService = new EmailService();
    
    echo "[" . date('Y-m-d H:i:s') . "] Iniciando proceso de recordatorios...\n";

    // 1. Obtener reglas activas
    $rules = $db->query("SELECT * FROM notification_rules WHERE is_active = 1");

    $countRules = count($rules);
    echo " > Reglas activas encontradas: $countRules\n";

    if (empty($rules)) {
        echo "No hay reglas activas. Finalizando.\n";
        exit;
    }

    foreach ($rules as $rule) {
        $minutes = $rule['minutes_before'];
        
        // Rango de búsqueda ajustado para mayor precisión
        // Buscamos citas que ocurran entre [ahora + minutos] y [ahora + minutos + 3]
        // Esto envía el correo entre 'minutos' y 'minutos + 3' de antelación.
        // Ejemplo: Regla 5 min. Ventana: 5 a 8 min antes.
        $targetTimeStart = date('Y-m-d H:i:s', strtotime("+$minutes minutes"));
        $targetTimeEnd   = date('Y-m-d H:i:s', strtotime("+" . ($minutes + 3) . " minutes"));
        
        echo " >> Procesando regla: '{$rule['name']}' ($minutes min antes)\n";
        echo "    Ventana de búsqueda: $targetTimeStart hasta $targetTimeEnd (exclusivo)\n";

        $sql = "
            SELECT 
                a.id as appointment_id, 
                a.appointment_date, 
                a.appointment_time, 
                p.full_name as paciente_nombre,
                p.email,
                (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u WHERE u.id = a.doctor_id) as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE 
                (a.status = 'programada' OR a.status = 'confirmada')
                AND CONCAT(a.appointment_date, ' ', a.appointment_time) >= :start_time
                AND CONCAT(a.appointment_date, ' ', a.appointment_time) < :end_time
                AND NOT EXISTS (
                    SELECT 1 FROM appointment_notifications_log log 
                    WHERE log.appointment_id = a.id 
                    AND log.rule_id = :rule_id
                )
        ";

        $appointments = $db->query($sql, [
            ':start_time' => $targetTimeStart,
            ':end_time'   => $targetTimeEnd,
            ':rule_id'    => $rule['id']
        ]);
        
        $countAppts = count($appointments);
        echo "    Citas encontradas en la ventana: $countAppts\n";

        foreach ($appointments as $appt) {
             // Validar email antes de intentar nada
             if (empty($appt['email']) || !filter_var($appt['email'], FILTER_VALIDATE_EMAIL)) {
                 echo ' [SKIP] Email inválido/inexistente para: ' . ($appt['paciente_nombre'] ?? 'Desconocido') . "\n";
                 continue; // Continuar con la siguiente iteración sin romper el script
             }

            try {
                // Variables para el servicio de email
                $patientName = $appt['paciente_nombre']; 
                $date = date('d/m/Y', strtotime($appt['appointment_date'])); 
                $time = date('h:i A', strtotime($appt['appointment_time']));
                
                // NOTA: El servicio EmailService::sendReminder ya carga internamente la plantilla 'reminder.php'
                // No necesitamos cargarla manualmente aquí.
                
                // Enviar Correo usando el método específico
                $sent = $emailService->sendReminder(
                    $appt['email'], 
                    $patientName, 
                    $date, 
                    $time
                );

                if ($sent) {
                    // Registrar éxito solo si se envió
                    $db->execute(
                        "INSERT INTO appointment_notifications_log (appointment_id, rule_id) VALUES (:appt_id, :rule_id)", 
                        [':appt_id' => $appt['appointment_id'], ':rule_id' => $rule['id']]
                    );
                    echo " [OK] Enviado a {$appt['email']}\n";
                } else {
                    echo " [ERROR] El servicio devolvió false para {$appt['email']}\n";
                }

            } catch (Exception $e) {
                // Capturar cualquier error de envío o DB localmente para NO detener el cron
                echo " [ERROR] Excepción al enviar a {$appt['email']}: " . $e->getMessage() . "\n";
            }
        }
    }

} catch (Exception $e) {
    echo "ERROR GRAVE: " . $e->getMessage() . "\n";
}
