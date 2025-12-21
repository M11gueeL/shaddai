<?php
require_once __DIR__ . '/AppointmentsController.php';

use Middlewares\RoleMiddleware;

class AppointmentsRoutes {

    public static function register($router) {
        
        $controller = new AppointmentsController();

        $router->add('GET', 'appointments/report/export', [$controller, 'exportReport'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/report/patient-export', [$controller, 'exportPatientReport'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/report/doctor-export', [$controller, 'exportDoctorReport'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/report/specialty-export', [$controller, 'exportSpecialtyReport'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/today', [$controller, 'getTodaysAppointments'], ['auth', 'role:admin,recepcionista']);
        
        $router->add('GET', 'appointments/today', [$controller, 'getTodaysAppointments'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/stats', [$controller, 'getStatistics'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/advanced-stats', [$controller, 'getAdvancedStatistics'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/report/performance-export', [$controller, 'exportPerformanceReport'], ['auth', 'role:admin,recepcionista']);

        $router->add('GET', 'appointments', [$controller, 'getAllAppointments'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/{id}', [$controller, 'getAppointment'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'appointments', [$controller, 'createAppointment'], ['auth', 'role:admin,recepcionista']);
        $router->add('PUT', 'appointments/{id}', [$controller, 'updateAppointment'], ['auth', 'role:admin,recepcionista']);
        $router->add('DELETE', 'appointments/{id}', [$controller, 'deleteAppointment'], ['auth', 'role:admin']);

      
        $router->add('GET', 'appointments/date/{date}', [$controller, 'getAppointmentsByDate'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/doctor/{doctorId}', [$controller, 'getAppointmentsByDoctor'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/patient/{patientId}', [$controller, 'getAppointmentsByPatient'], ['auth', 'role:admin,recepcionista']);

        $router->add('POST', 'appointments/{id}/status', [$controller, 'updateStatus'], ['auth', 'role:admin,recepcionista']);

        $router->add('GET', 'appointments/availability', [$controller, 'checkAvailability'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'appointments/validate-slot', [$controller, 'validateSlot'], ['auth', 'role:admin,recepcionista']);

        
        
        
    }
}
