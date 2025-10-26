<?php
require_once __DIR__ . '/MedicalSchedulesController.php';

use Middlewares\RoleMiddleware; // Asegúrate que el namespace sea correcto

class MedicalSchedulesRoutes {

    public static function register($router) {

        $controller = new MedicalSchedulesController();

        // Listado general y filtrado
        $router->add('GET', 'schedules', [$controller, 'getAllSchedules'], ['auth', 'role:admin,recepcionista']);
        // Alias para obtener horarios por médico usando el mismo método (param opcional)
        $router->add('GET', 'schedules/medical/{medicalId}', [$controller, 'getAllSchedules'], ['auth', 'role:admin,recepcionista']);
        // Ruta preferida y consistente con otros módulos (doctor)
        $router->add('GET', 'schedules/doctor/{doctorId}', [$controller, 'getSchedulesByDoctor'], ['auth', 'role:admin,recepcionista']);
        $router->add('GET', 'schedules/{id}', [$controller, 'getScheduleById'], ['auth', 'role:admin,recepcionista']);
        $router->add('POST', 'schedules', [$controller, 'createSchedule'], ['auth', 'role:admin']);
        $router->add('PUT', 'schedules/{id}', [$controller, 'updateSchedule'], ['auth', 'role:admin']);
        $router->add('DELETE', 'schedules/{id}', [$controller, 'deleteSchedule'], ['auth', 'role:admin']);
    }
}
?>