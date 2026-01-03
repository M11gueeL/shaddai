<?php
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

class EmailService {
    private $mailer;

    public function __construct() {
        // Cargar variables de entorno si no están cargadas
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
        $dotenv->safeLoad();

        $this->mailer = new PHPMailer(true);
        
        // Configuración del Servidor SMTP (Usa variables de entorno .env)
        $this->mailer->isSMTP();
        $this->mailer->Host       = $_ENV['SMTP_HOST'];
        $this->mailer->SMTPAuth   = true;
        $this->mailer->Username   = $_ENV['SMTP_USER'];
        $this->mailer->Password   = $_ENV['SMTP_PASS'];
        
        // Determinar seguridad basada en puerto o variable explícita
        if (isset($_ENV['SMTP_SECURE']) && ($_ENV['SMTP_SECURE'] === 'smtps' || $_ENV['SMTP_SECURE'] === 'ssl')) {
             $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } elseif ($_ENV['SMTP_PORT'] == 465) {
             $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
             $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        $this->mailer->Port       = $_ENV['SMTP_PORT'];
        $this->mailer->setFrom($_ENV['SMTP_USER'], 'Shaddai Rafa');
        $this->mailer->CharSet = 'UTF-8';
        $this->mailer->isHTML(true);
    }

    public function sendPatientConfirmation($toEmail, $patientName, $doctorName, $date, $time, $specialty = 'Consulta General') {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail);
            $this->mailer->Subject = 'Confirmación de Cita - Shaddai Rafa';
            
            $body = $this->renderTemplate('patient_confirmation', 'Cita Confirmada', [
                'patientName' => $patientName,
                'doctorName' => $doctorName,
                'date' => $date,
                'time' => $time,
                'specialty' => $specialty
            ]);

            $this->mailer->Body = $body;
            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            error_log("Error enviando correo al paciente: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    public function sendDoctorNotification($toEmail, $doctorName, $patientName, $date, $time, $specialty = 'Consulta General') {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail);
            $this->mailer->Subject = 'Nueva Cita Agendada - Shaddai Rafa';
            
            $body = $this->renderTemplate('doctor_notification', 'Nueva Cita Asignada', [
                'doctorName' => $doctorName,
                'patientName' => $patientName,
                'date' => $date,
                'time' => $time,
                'specialty' => $specialty
            ]);

            $this->mailer->Body = $body;
            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            error_log("Error enviando notificación al médico: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    public function sendReminder($toEmail, $patientName, $date, $time) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail);
            $this->mailer->Subject = 'Recordatorio de Cita - Shaddai Rafa';
            
            $body = $this->renderTemplate('reminder', 'Recordatorio de Cita', [
                'patientName' => $patientName,
                'date' => $date,
                'time' => $time
            ]);
            
            $this->mailer->Body = $body;
            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            error_log("Error enviando recordatorio: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    public function sendPasswordReset($toEmail, $userName, $resetLink) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail);
            $this->mailer->Subject = 'Restablecer Contraseña - Shaddai Rafa';
            
            $body = $this->renderTemplate('password_reset', 'Recuperación de Cuenta', [
                'userName' => $userName,
                'resetLink' => $resetLink
            ]);
            
            $this->mailer->Body = $body;
            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            error_log("Error enviando correo de recuperación: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    // Mantenemos este método por compatibilidad si se usa en otro lado, pero redirigimos
    public function sendAppointmentConfirmation($toEmail, $patientName, $doctorName, $date, $time) {
        return $this->sendPatientConfirmation($toEmail, $patientName, $doctorName, $date, $time);
    }

    private function renderTemplate($templateName, $title, $data) {
        // Extraer variables para que estén disponibles en la plantilla
        extract($data);

        // 1. Renderizar el contenido específico
        ob_start();
        require __DIR__ . "/../templates/emails/{$templateName}.php";
        $content = ob_get_clean();

        // 2. Renderizar el layout con el contenido (sin logo)
        ob_start();
        require __DIR__ . '/../templates/emails/layout.php';
        return ob_get_clean();
    }
}