<?php
require_once __DIR__ . '/AppointmentsController.php';

use Middlewares\RoleMiddleware;

class AppointmentsRoutes {

    public static function register($router) {
        
        $controller = new AppointmentsController();

        // Rutas básicas CRUD
        $router->add('GET', 'appointments', [$controller, 'getAllAppointments'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/{id}', [$controller, 'getAppointment'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'appointments', [$controller, 'createAppointment'], ['auth', 'role:admin,recepcionista']);
        $router->add('PUT', 'appointments/{id}', [$controller, 'updateAppointment'], ['auth', 'role:admin,recepcionista']);
        $router->add('DELETE', 'appointments/{id}', [$controller, 'deleteAppointment'], ['auth', 'role:admin']);

        // Rutas especializadas
        $router->add('GET', 'appointments/date/{date}', [$controller, 'getAppointmentsByDate'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/doctor/{doctorId}', [$controller, 'getAppointmentsByDoctor'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'appointments/patient/{patientId}', [$controller, 'getAppointmentsByPatient'], ['auth', 'role:admin,recepcionista']);

       $router->add('POST', 'appointments/{id}/status', [$controller, 'updateStatus'], ['auth', 'role:admin,recepcionista']);

    }
}
