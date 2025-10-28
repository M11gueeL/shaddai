-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-10-2025 a las 00:27:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `shaddai_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `office_number` tinyint(1) NOT NULL,
  `specialty_id` int(11) NOT NULL,
  `duration` tinyint(3) NOT NULL DEFAULT 30,
  `status` enum('programada','confirmada','en_progreso','completada','cancelada','no_se_presento') NOT NULL DEFAULT 'programada',
  `appointment_type` enum('primera_vez','control','emergencia','urgencia') NOT NULL DEFAULT 'primera_vez',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `office_number`, `specialty_id`, `duration`, `status`, `appointment_type`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 8, 11, '2025-11-10', '14:30:00', 2, 1, 30, 'confirmada', 'primera_vez', 8, '2025-10-23 15:00:33', '2025-10-24 21:43:18'),
(2, 2, 8, '2025-11-10', '14:30:00', 1, 3, 30, 'cancelada', 'emergencia', 8, '2025-10-23 15:10:20', '2025-10-24 21:44:03'),
(4, 7, 23, '2025-11-10', '17:35:00', 1, 3, 30, 'programada', 'primera_vez', 8, '2025-10-23 17:49:37', '2025-10-24 00:46:51'),
(5, 8, 8, '2025-11-10', '16:35:00', 1, 3, 30, 'programada', 'primera_vez', 8, '2025-10-23 17:50:00', '2025-10-23 17:50:00'),
(8, 8, 11, '2025-10-24', '20:27:00', 2, 1, 30, 'programada', 'primera_vez', 8, '2025-10-24 22:27:21', '2025-10-24 22:27:21'),
(9, 9, 11, '2025-10-25', '18:08:00', 1, 1, 30, 'confirmada', 'control', 8, '2025-10-25 21:09:09', '2025-10-25 21:09:39'),
(10, 11, 23, '2025-10-25', '18:44:00', 2, 7, 30, 'cancelada', 'primera_vez', 8, '2025-10-25 21:29:32', '2025-10-25 21:30:27'),
(11, 8, 11, '2025-10-25', '17:31:00', 2, 1, 30, 'completada', 'primera_vez', 8, '2025-10-25 21:31:18', '2025-10-25 21:31:40'),
(12, 8, 11, '2025-11-01', '08:00:00', 1, 1, 30, 'programada', 'primera_vez', 8, '2025-10-26 01:43:53', '2025-10-26 01:43:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointment_medical_info`
--

CREATE TABLE `appointment_medical_info` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `chief_complaint` varchar(255) DEFAULT NULL COMMENT 'Motivo principal de consulta',
  `symptoms` text DEFAULT NULL COMMENT 'Síntomas principales reportados',
  `notes` text DEFAULT NULL COMMENT 'Notas adicionales del recepcionista',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `appointment_medical_info`
--

INSERT INTO `appointment_medical_info` (`id`, `appointment_id`, `chief_complaint`, `symptoms`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'Dolor de cabeza', 'Náuseas, mareo', 'Paciente nuevo', '2025-10-23 15:00:33', '2025-10-23 15:00:33'),
(2, 2, 'Dolor de rodilla izquierda', 'Dificultad para caminar', 'Paciente nuevo', '2025-10-23 15:10:20', '2025-10-23 15:10:20'),
(3, 4, 'Dolor de cabeza', 'Náuseas, mareo', 'Paciente nuevo', '2025-10-23 17:49:37', '2025-10-23 17:49:37'),
(4, 5, 'Dolor de cabeza', 'Náuseas, mareo', 'Paciente nuevo', '2025-10-23 17:50:00', '2025-10-23 17:50:00'),
(7, 8, 'Sangrado en el oído', '', '', '2025-10-24 22:27:21', '2025-10-24 22:27:21'),
(8, 9, '', '', '', '2025-10-25 21:09:42', '2025-10-25 21:09:42'),
(9, 10, '', '', '', '2025-10-25 21:30:31', '2025-10-25 21:30:31'),
(10, 11, '', '', '', '2025-10-25 21:31:42', '2025-10-25 21:31:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointment_reminders`
--

CREATE TABLE `appointment_reminders` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `reminder_type` enum('sms','email','llamada') NOT NULL,
  `sent_at` datetime DEFAULT NULL,
  `status` enum('pendiente','enviado','fallido') NOT NULL DEFAULT 'pendiente',
  `scheduled_for` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointment_status_history`
--

CREATE TABLE `appointment_status_history` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_by` int(11) NOT NULL,
  `change_reason` varchar(255) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `appointment_status_history`
--

INSERT INTO `appointment_status_history` (`id`, `appointment_id`, `previous_status`, `new_status`, `changed_by`, `change_reason`, `changed_at`) VALUES
(1, 2, 'programada', 'cancelada', 8, NULL, '2025-10-24 21:44:03'),
(2, 9, 'programada', 'confirmada', 8, NULL, '2025-10-25 21:09:39'),
(3, 10, 'programada', 'cancelada', 8, NULL, '2025-10-25 21:30:27'),
(4, 11, 'programada', 'completada', 8, NULL, '2025-10-25 21:31:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `billing_accounts`
--

CREATE TABLE `billing_accounts` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL COMMENT 'Paciente que recibe el servicio (FK a patients.id)',
  `payer_patient_id` int(11) NOT NULL COMMENT 'Responsable del pago (FK a patients.id). Puede ser el mismo patient_id',
  `appointment_id` int(11) DEFAULT NULL COMMENT 'Cita asociada (FK a appointments.id). Opcional.',
  `status` enum('pending','partially_paid','paid','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la cuenta: pendiente, pagada_parcial, pagada, anulada',
  `total_usd` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto total en USD',
  `total_bs` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto total en Bs. (calculado a la tasa del día)',
  `exchange_rate_id` int(11) NOT NULL COMMENT 'Tasa de cambio usada al crear la cuenta (FK a daily_exchange_rates.id)',
  `created_by` int(11) NOT NULL COMMENT 'Usuario que genera la cuenta (FK a users.id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación de la cuenta',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Cuentas por cobrar (facturas no fiscales) por paciente';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `billing_account_details`
--

CREATE TABLE `billing_account_details` (
  `id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL COMMENT 'Cuenta a la que pertenece (FK a billing_accounts.id)',
  `service_id` int(11) NOT NULL COMMENT 'Servicio del catálogo (FK a services.id)',
  `description` varchar(255) NOT NULL COMMENT 'Descripción (copiada del servicio, pero editable)',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price_usd` decimal(10,2) NOT NULL COMMENT 'Precio USD (copiado al momento de agregar)',
  `price_bs` decimal(12,2) NOT NULL COMMENT 'Precio Bs (calculado = price_usd * tasa de la cuenta)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Items de servicio cargados a una cuenta de cobro';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cash_register_movements`
--

CREATE TABLE `cash_register_movements` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL COMMENT 'Sesión de caja afectada (FK a cash_register_sessions.id)',
  `payment_id` int(11) DEFAULT NULL COMMENT 'Pago que origina el ingreso (FK a payments.id)',
  `movement_type` enum('payment_in','expense_out','adjustment_in','adjustment_out','initial_balance') NOT NULL,
  `amount` decimal(12,2) NOT NULL COMMENT 'Monto del movimiento',
  `currency` enum('USD','BS') NOT NULL,
  `description` varchar(255) NOT NULL COMMENT 'Ej: Pago cuenta 123, Gasto papelería, Ajuste sobrante',
  `created_by` int(11) NOT NULL COMMENT 'Usuario que registra el movimiento (FK a users.id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Movimientos de efectivo (entradas/salidas) en una sesión';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cash_register_sessions`
--

CREATE TABLE `cash_register_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Usuario dueño de la sesión (FK a users.id)',
  `start_time` datetime NOT NULL COMMENT 'Fecha y hora de apertura',
  `end_time` datetime DEFAULT NULL COMMENT 'Fecha y hora de cierre (NULL si está abierta)',
  `start_balance_usd` decimal(10,2) NOT NULL COMMENT 'Fondo de caja inicial en USD',
  `start_balance_bs` decimal(12,2) NOT NULL COMMENT 'Fondo de caja inicial en Bs',
  `calculated_end_balance_usd` decimal(10,2) DEFAULT NULL COMMENT 'Monto USD que DEBERÍA haber al cierre',
  `real_end_balance_usd` decimal(10,2) DEFAULT NULL COMMENT 'Monto USD que se CONTÓ realmente al cierre',
  `calculated_end_balance_bs` decimal(12,2) DEFAULT NULL,
  `real_end_balance_bs` decimal(12,2) DEFAULT NULL,
  `status` enum('open','closed') NOT NULL DEFAULT 'open',
  `notes` text DEFAULT NULL COMMENT 'Notas sobre el cierre (ej. faltante/sobrante)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Sesiones de apertura y cierre de caja por usuario';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clinical_encounters`
--

CREATE TABLE `clinical_encounters` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL COMMENT 'FK a la cita si este encuentro proviene de una',
  `doctor_id` int(11) NOT NULL COMMENT 'FK a users (médico que atiende)',
  `specialty_id` int(11) NOT NULL COMMENT 'Especialidad bajo la cual se realiza la consulta',
  `encounter_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha y hora de la consulta/encuentro',
  `encounter_type` varchar(50) DEFAULT 'Consulta' COMMENT 'Tipo: Consulta, Emergencia, Seguimiento, Interconsulta, etc.',
  `chief_complaint` text DEFAULT NULL COMMENT 'Motivo principal de la consulta (reportado por el paciente)',
  `present_illness` text DEFAULT NULL COMMENT 'Enfermedad actual o descripción del problema',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registro de cada consulta o encuentro clínico';

--
-- Volcado de datos para la tabla `clinical_encounters`
--

INSERT INTO `clinical_encounters` (`id`, `medical_record_id`, `appointment_id`, `doctor_id`, `specialty_id`, `encounter_date`, `encounter_type`, `chief_complaint`, `present_illness`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 11, 1, '2025-10-26 17:54:55', 'Consulta', 'asdsad', 'asdasdsadasdasd', '2025-10-26 21:54:55', '2025-10-26 21:54:55'),
(2, 2, NULL, 11, 1, '2025-10-26 19:27:28', 'Consulta', 'dolor  de oido ', 'px femanina  con antecedentes patologicos  de hta  con tratamniento actual quien refiere ea  desde hace  24 hrs  cusndo  comienza  presentar  otalgia  de leve intensidad motivo  por el cual se valora ', '2025-10-26 23:27:28', '2025-10-26 23:27:28'),
(3, 2, NULL, 11, 1, '2025-10-27 14:11:52', 'Consulta', 'sadasd', 'asdasdsd', '2025-10-27 18:11:52', '2025-10-27 18:11:52'),
(4, 2, NULL, 11, 1, '2025-10-27 14:15:01', 'Consulta', '', '', '2025-10-27 18:15:01', '2025-10-27 18:15:01'),
(5, 2, NULL, 23, 9, '2025-10-27 14:21:08', 'Emergencia', 'asdasdas', 'adasdads', '2025-10-27 18:21:08', '2025-10-27 18:21:08'),
(6, 2, NULL, 11, 1, '2025-10-27 14:29:05', 'Control', 'adasda', 'asdasd', '2025-10-27 18:29:05', '2025-10-27 18:29:05'),
(7, 2, NULL, 11, 1, '2025-10-27 14:35:49', 'Primera vez', 'asdasd', 'asdasdasd', '2025-10-27 18:35:49', '2025-10-27 18:35:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `daily_exchange_rates`
--

CREATE TABLE `daily_exchange_rates` (
  `id` int(11) NOT NULL,
  `rate_date` date NOT NULL COMMENT 'Fecha para la cual aplica la tasa',
  `rate_bcv` decimal(10,4) NOT NULL COMMENT 'Tasa BCV de Bs. por USD',
  `created_by` int(11) NOT NULL COMMENT 'Usuario que registró la tasa (FK a users.id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registro de la tasa BCV usada por día';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diagnoses`
--

CREATE TABLE `diagnoses` (
  `id` int(11) NOT NULL,
  `encounter_id` int(11) NOT NULL,
  `diagnosis_code` varchar(20) DEFAULT NULL COMMENT 'Código (ej. ICD-10, CIE-10)',
  `diagnosis_description` varchar(255) NOT NULL COMMENT 'Descripción del diagnóstico',
  `diagnosis_type` enum('principal','secundario','presuntivo','definitivo') DEFAULT 'principal',
  `notes` text DEFAULT NULL,
  `recorded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Diagnósticos realizados en una consulta';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_colleges`
--

CREATE TABLE `medical_colleges` (
  `id` int(1) NOT NULL,
  `state_name` varchar(64) NOT NULL,
  `full_name` varchar(128) NOT NULL,
  `abbreviation` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `medical_colleges`
--

INSERT INTO `medical_colleges` (`id`, `state_name`, `full_name`, `abbreviation`) VALUES
(1, 'Amazonas', 'Colegio de Médicos de Amazonas', 'C.M.Am'),
(2, 'Anzoátegui', 'Colegio de Médicos de Anzoátegui', 'C.M.Az'),
(3, 'Apure', 'Colegio de Médicos de Apure', 'C.M.Ap'),
(4, 'Aragua', 'Colegio de Médicos de Aragua', 'C.M.A'),
(5, 'Barinas', 'Colegio de Médicos de Barinas', 'C.M.B'),
(6, 'Bolívar', 'Colegio de Médicos de Bolívar', 'C.M.Bo'),
(7, 'Carabobo', 'Colegio de Médicos de Carabobo', 'C.M.C'),
(8, 'Cojedes', 'Colegio de Médicos de Cojedes', 'C.M.Co'),
(9, 'Delta Amacuro', 'Colegio de Médicos de Delta Amacuro', 'C.M.DA'),
(10, 'Falcón', 'Colegio de Médicos de Falcón', 'C.M.F'),
(11, 'Guárico', 'Colegio de Médicos de Guárico', 'C.M.G'),
(12, 'Lara', 'Colegio de Médicos de Lara', 'C.M.L'),
(13, 'Mérida', 'Colegio de Médicos de Mérida', 'C.M.M'),
(14, 'Miranda', 'Colegio de Médicos de Miranda', 'C.M.Mi'),
(15, 'Monagas', 'Colegio de Médicos de Monagas', 'C.M.Mo'),
(16, 'Nueva Esparta', 'Colegio de Médicos de Nueva Esparta', 'C.M.NE'),
(17, 'Portuguesa', 'Colegio de Médicos de Portuguesa', 'C.M.P'),
(18, 'Sucre', 'Colegio de Médicos de Sucre', 'C.M.S'),
(19, 'Táchira', 'Colegio de Médicos de Táchira', 'C.M.T'),
(20, 'Trujillo', 'Colegio de Médicos de Trujillo', 'C.M.Tr'),
(21, 'Vargas (La Guaira)', 'Colegio de Médicos de Vargas (La Guaira)', 'C.M.V'),
(22, 'Yaracuy', 'Colegio de Médicos de Yaracuy', 'C.M.Y'),
(23, 'Zulia', 'Colegio de Médicos de Zulia', 'C.M.Z'),
(24, 'Distrito Capital', 'Colegio de Médicos del Distrito Capital', 'C.M.DC');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_history`
--

CREATE TABLE `medical_history` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `history_type` enum('personal_pathological','personal_non_pathological','family','gynecological','surgical','allergies','medications','habits','vaccinations','other') NOT NULL COMMENT 'Tipo de antecedente',
  `description` text NOT NULL COMMENT 'Descripción detallada del antecedente',
  `recorded_at` date DEFAULT NULL COMMENT 'Fecha opcional del registro o evento',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Antecedentes médicos del paciente';

--
-- Volcado de datos para la tabla `medical_history`
--

INSERT INTO `medical_history` (`id`, `medical_record_id`, `history_type`, `description`, `recorded_at`, `created_at`, `updated_at`) VALUES
(1, 1, '', 'dadasdasdsadasd', '2024-02-22', '2025-10-26 21:54:39', '2025-10-26 21:54:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_preferred_schedules`
--

CREATE TABLE `medical_preferred_schedules` (
  `id` int(11) NOT NULL,
  `medical_id` int(11) NOT NULL COMMENT 'FK a la tabla users (con rol de personal médico)',
  `day_of_week` tinyint(1) NOT NULL COMMENT 'Día de la semana (1=Lunes, 2=Martes, ..., 7=Domingo)',
  `start_time` time NOT NULL COMMENT 'Hora de inicio preferida para este bloque',
  `end_time` time NOT NULL COMMENT 'Hora de fin preferida para este bloque',
  `notes` varchar(255) DEFAULT NULL COMMENT 'Notas opcionales (ej. "Solo mañanas", "Consultas de control")',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Horarios preferidos/guía semanales para personal médico';

--
-- Volcado de datos para la tabla `medical_preferred_schedules`
--

INSERT INTO `medical_preferred_schedules` (`id`, `medical_id`, `day_of_week`, `start_time`, `end_time`, `notes`, `created_at`, `updated_at`) VALUES
(1, 11, 1, '14:00:00', '18:00:00', 'Consultas generales', '2025-10-26 00:55:33', '2025-10-26 00:55:33'),
(2, 11, 2, '10:30:00', '18:50:00', 'Consultas generales', '2025-10-26 00:55:53', '2025-10-26 01:31:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `record_number` varchar(50) DEFAULT NULL COMMENT 'Número único de historia, si aplica',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Contenedor principal de la historia clínica';

--
-- Volcado de datos para la tabla `medical_records`
--

INSERT INTO `medical_records` (`id`, `patient_id`, `record_number`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, '2025-10-26 21:54:06', '2025-10-26 21:54:06'),
(2, 13, NULL, '2025-10-26 23:23:30', '2025-10-26 23:23:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_reports`
--

CREATE TABLE `medical_reports` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL COMMENT 'FK a la historia clínica del paciente',
  `encounter_id` int(11) DEFAULT NULL COMMENT 'FK al encuentro clínico específico (opcional)',
  `doctor_id` int(11) NOT NULL COMMENT 'FK a users (médico que elabora el informe)',
  `report_date` date NOT NULL COMMENT 'Fecha de creación del informe',
  `report_type` varchar(100) DEFAULT NULL COMMENT 'Tipo/Propósito: Referencia, Seguro, Legal, Justificativo, Resumen',
  `recipient` varchar(255) DEFAULT NULL COMMENT 'A quién va dirigido (opcional)',
  `content` longtext NOT NULL COMMENT 'El texto completo del informe médico',
  `status` enum('draft','finalized','signed') NOT NULL DEFAULT 'draft' COMMENT 'Estado del informe',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Almacena los informes médicos generados';

--
-- Volcado de datos para la tabla `medical_reports`
--

INSERT INTO `medical_reports` (`id`, `medical_record_id`, `encounter_id`, `doctor_id`, `report_date`, `report_type`, `recipient`, `content`, `status`, `created_at`, `updated_at`) VALUES
(2, 1, NULL, 8, '2025-10-26', 'Informe médico', 'Juan Felix', '<p>dadljaskdjaslkdjasldjaslkdaslkd\naskdjalkdjsadsa\nlkasjdlaksdjlaskd\n\nkjdasdlkasjldkjsad\nklasjdlkasdljasdjksadjlaskdjklasda</p>', '', '2025-10-26 21:57:05', '2025-10-26 23:06:32'),
(9, 2, NULL, 8, '2025-10-27', 'Referencia', NULL, '<h3>sadasasddasdasd</h3><p><br></p><p><br></p><p>dasdasdasdasd</p><p><br></p><p><br></p><h1>asddsdasdasdasdasdASDASasdadasasasdad</h1><p>ASDASDASDSA<em>adasdasd</em>dasd</p><p>asdads</p><p><br></p>', '', '2025-10-27 20:17:04', '2025-10-27 20:17:04'),
(11, 2, NULL, 11, '2025-10-27', 'Informe médico', NULL, '<p>sdadadsaddaasd</p><p><br></p><p>asd</p><p>asd</p><p>asd</p><p>as</p><p>das</p><p>d</p><p>asd</p><p>ad</p><p>as</p><p>dasdasdsad</p><p><br></p>', 'draft', '2025-10-27 20:32:25', '2025-10-27 20:32:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_specialties`
--

CREATE TABLE `medical_specialties` (
  `id` int(11) NOT NULL,
  `name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `medical_specialties`
--

INSERT INTO `medical_specialties` (`id`, `name`) VALUES
(4, 'Alergología'),
(63, 'Alergología e Inmunología Clínica'),
(5, 'Anestesiología'),
(6, 'Angiología'),
(40, 'Angiología y Cirugía Vascular'),
(41, 'Cancerología (Oncología)'),
(2, 'Cardiología'),
(34, 'Cirugía Cardiovascular'),
(64, 'Cirugía de Cabeza y Cuello'),
(65, 'Cirugía de Tórax'),
(66, 'Cirugía Digestiva'),
(32, 'Cirugía General'),
(67, 'Cirugía Laparoscópica'),
(68, 'Cirugía Maxilofacial'),
(69, 'Cirugía Oncológica'),
(70, 'Cirugía Pediátrica'),
(33, 'Cirugía Plástica'),
(42, 'Cirugía Plástica, Reconstructiva y Estética'),
(71, 'Cirugía Torácica'),
(7, 'Dermatología'),
(72, 'Dermatología Pediátrica'),
(8, 'Endocrinología'),
(73, 'Endocrinología Pediátrica'),
(43, 'Endoscopia'),
(44, 'Enfermedades Endémicas y Tropicales'),
(45, 'Farmacología Clínica'),
(74, 'Flebología y Linfología'),
(9, 'Gastroenterología'),
(75, 'Gastroenterología Pediátrica'),
(46, 'Genética Médica'),
(10, 'Geriatría'),
(47, 'Ginecología'),
(11, 'Ginecología y Obstetricia'),
(12, 'Hematología'),
(76, 'Hematología Pediátrica'),
(48, 'Hepatología'),
(13, 'Infectología'),
(77, 'Infectología Pediátrica'),
(35, 'Inmunología'),
(14, 'Medicina Crítica'),
(49, 'Medicina Crítica y Cuidados Intensivos'),
(52, 'Medicina de Urgencias'),
(50, 'Medicina del Deporte'),
(51, 'Medicina del Dolor'),
(36, 'Medicina del Trabajo'),
(15, 'Medicina Deportiva'),
(16, 'Medicina Familiar'),
(17, 'Medicina Física y Rehabilitación'),
(53, 'Medicina Forense'),
(3, 'Medicina Interna'),
(54, 'Medicina Legal'),
(55, 'Medicina Nuclear'),
(56, 'Medicina Paliativa'),
(18, 'Nefrología'),
(78, 'Nefrología Pediátrica'),
(57, 'Neonatología'),
(19, 'Neumonología'),
(79, 'Neumonología Pediátrica'),
(21, 'Neurocirugía'),
(20, 'Neurología'),
(80, 'Neurología Pediátrica'),
(81, 'Nutrición Parenteral y Enteral'),
(22, 'Nutriología'),
(58, 'Nutriología y Dietética'),
(59, 'Obstetricia'),
(23, 'Oftalmología'),
(24, 'Oncología'),
(82, 'Oncología Pediátrica'),
(25, 'Ortopedia y Traumatología'),
(1, 'Otorrinolaringología'),
(26, 'Patología'),
(27, 'Pediatría'),
(60, 'Proctología'),
(28, 'Psiquiatría'),
(61, 'Psiquiatría Infantil y del Adolescente'),
(29, 'Radiología e Imagenología'),
(30, 'Reumatología'),
(83, 'Reumatología Pediátrica'),
(84, 'Sexología Clínica'),
(85, 'Terapia Intensiva Pediátrica'),
(62, 'Toxicología'),
(86, 'Trasplante de Órganos'),
(31, 'Urología');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `full_name` varchar(128) NOT NULL,
  `cedula` varchar(8) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` varchar(16) DEFAULT NULL,
  `marital_status` varchar(32) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(32) NOT NULL,
  `email` varchar(128) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Usuario que registró al paciente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `patients`
--

INSERT INTO `patients` (`id`, `full_name`, `cedula`, `birth_date`, `gender`, `marital_status`, `address`, `phone`, `email`, `created_at`, `updated_at`, `created_by`) VALUES
(2, 'Juan Pérez', '12345679', '1980-12-04', 'Masculino', 'Casado', 'Santa Rita', '04121234567', 'email@email.com', '2025-07-28 23:09:31', '2025-10-23 19:53:44', NULL),
(7, 'Emilio Andrade', '12234234', '1980-12-04', 'Masculino', 'Divorciado', 'Santa Rita', '04121234521', 'email@exammple.com', '2025-08-04 00:57:22', '2025-10-25 21:33:40', 8),
(8, 'Lionel Andrés Messi Cuccitini', '26110310', '1989-09-20', 'Masculino', 'Casado', 'Miami', '04129991890', 'leomessi@gmail.com', '2025-10-15 23:43:50', '2025-10-15 23:43:50', 8),
(9, 'Pedro González López  ', '28990123', '2002-11-25', 'Masculino', 'Soltero', 'Barcelona, España', '04241231219', 'pedrigonzalez8@gmail.com', '2025-10-25 21:08:32', '2025-10-25 21:08:32', 8),
(10, 'Lamine Yamal Nasraoui Ebana', '32456123', '2007-07-13', 'Masculino', 'Soltero', 'Barcelona, España', '04161234455', 'lamineyamal10@gmail.com', '2025-10-25 21:13:36', '2025-10-25 21:13:36', 8),
(11, 'Luis Alberto Suarez Díaz', '24312564', '1987-01-24', 'Masculino', 'Casado', 'Miami', '04124561234', 'luis9suarez@gmail.com', '2025-10-25 21:29:05', '2025-10-25 21:29:05', 8),
(12, 'Sergio Busquets', '18990123', '1988-07-16', 'Masculino', 'Divorciado', 'Miami', '04243214561', 'sergiobusquets@gmail.com', '2025-10-25 21:38:35', '2025-10-25 21:38:49', 8),
(13, 'nacary monasterio ', '10377120', '1969-10-05', 'Femenino', 'Soltero', 'Palo Negro', '04243503887', 'monasterionacary@gmail.com', '2025-10-26 23:11:58', '2025-10-27 20:39:56', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL COMMENT 'Cuenta que se está pagando (FK a billing_accounts.id)',
  `payment_date` datetime NOT NULL COMMENT 'Fecha y hora del pago',
  `payment_method` enum('cash_usd','cash_bs','transfer_bs','mobile_payment_bs') NOT NULL,
  `amount` decimal(12,2) NOT NULL COMMENT 'Monto en la moneda que se pagó',
  `currency` enum('USD','BS') NOT NULL,
  `exchange_rate_id` int(11) NOT NULL COMMENT 'Tasa BCV del día del PAGO (FK a daily_exchange_rates.id)',
  `amount_usd_equivalent` decimal(10,2) NOT NULL COMMENT 'Monto del pago convertido a USD (facilita calcular saldos)',
  `reference_number` varchar(100) DEFAULT NULL COMMENT 'Ref. para Transferencia, Pago Móvil, Zelle',
  `attachment_path` varchar(512) DEFAULT NULL COMMENT 'Ruta al archivo/imagen del comprobante',
  `status` enum('pending_verification','verified','rejected') NOT NULL DEFAULT 'verified' COMMENT 'Verificado (efectivo) o pendiente (transferencia)',
  `notes` text DEFAULT NULL,
  `registered_by` int(11) NOT NULL COMMENT 'Usuario que registra el pago (FK a users.id)',
  `verified_by` int(11) DEFAULT NULL COMMENT 'Usuario que verifica (si aplica) (FK a users.id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Pagos y abonos recibidos por cuentas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment_receipts`
--

CREATE TABLE `payment_receipts` (
  `id` int(11) NOT NULL,
  `receipt_number` varchar(50) NOT NULL COMMENT 'Correlativo (Ej: REC-2025-00001)',
  `account_id` int(11) NOT NULL COMMENT 'Cuenta asociada al recibo (FK a billing_accounts.id)',
  `payment_id` int(11) DEFAULT NULL COMMENT 'Pago específico (si el recibo es por un pago) (FK a payments.id)',
  `issued_by` int(11) NOT NULL COMMENT 'Usuario que emitió el recibo (FK a users.id)',
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','annulled') NOT NULL DEFAULT 'active' COMMENT 'Estado del recibo',
  `annulled_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registro de recibos de pago (no fiscales) emitidos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `physical_exams`
--

CREATE TABLE `physical_exams` (
  `id` int(11) NOT NULL,
  `encounter_id` int(11) NOT NULL,
  `exam_date` datetime NOT NULL DEFAULT current_timestamp(),
  `vitals_summary` varchar(255) DEFAULT NULL COMMENT 'Resumen rápido: TA, FC, FR, Temp, SatO2, Peso, Talla',
  `general_appearance` text DEFAULT NULL COMMENT 'Aspecto general',
  `head_neck` text DEFAULT NULL COMMENT 'Cabeza y cuello',
  `chest_lungs` text DEFAULT NULL COMMENT 'Tórax y pulmones',
  `cardiovascular` text DEFAULT NULL COMMENT 'Sistema cardiovascular',
  `abdomen` text DEFAULT NULL,
  `extremities` text DEFAULT NULL COMMENT 'Extremidades',
  `neurological` text DEFAULT NULL COMMENT 'Examen neurológico',
  `skin` text DEFAULT NULL COMMENT 'Piel y anexos',
  `specialty_specific_exam` text DEFAULT NULL COMMENT 'Campos específicos de la especialidad (ej. agudeza visual, fondo de ojo para oftalmo)',
  `notes` text DEFAULT NULL COMMENT 'Notas adicionales del examen físico'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Resultados del examen físico por consulta';

--
-- Volcado de datos para la tabla `physical_exams`
--

INSERT INTO `physical_exams` (`id`, `encounter_id`, `exam_date`, `vitals_summary`, `general_appearance`, `head_neck`, `chest_lungs`, `cardiovascular`, `abdomen`, `extremities`, `neurological`, `skin`, `specialty_specific_exam`, `notes`) VALUES
(1, 4, '2025-10-27 14:15:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'asdsadasd asdasdasdasdasd  ', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `progress_notes`
--

CREATE TABLE `progress_notes` (
  `id` int(11) NOT NULL,
  `encounter_id` int(11) NOT NULL,
  `note_type` varchar(50) DEFAULT 'Evolución' COMMENT 'Tipo: Evolución, Nota de Ingreso, Nota de Egreso, etc.',
  `note_content` text NOT NULL,
  `created_by` int(11) NOT NULL COMMENT 'FK a users (quien escribe la nota)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Notas de evolución y seguimiento';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `record_attachments`
--

CREATE TABLE `record_attachments` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `encounter_id` int(11) DEFAULT NULL COMMENT 'Si está asociado a una consulta específica',
  `file_name` varchar(255) NOT NULL COMMENT 'Nombre original del archivo',
  `file_path` varchar(512) NOT NULL COMMENT 'Ruta en el servidor o URL de almacenamiento',
  `file_type` varchar(100) DEFAULT NULL COMMENT 'MIME type',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descripción breve del archivo',
  `uploaded_by` int(11) NOT NULL COMMENT 'FK a users (quien subió el archivo)',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Archivos adjuntos a la historia clínica';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'medico'),
(3, 'recepcionista');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Nombre del servicio (Ej: Consulta Otorrino)',
  `description` text DEFAULT NULL,
  `price_usd` decimal(10,2) NOT NULL COMMENT 'Precio base y principal en Dólares (USD)',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=Activo, 0=Inactivo (para no borrarlo)',
  `created_by` int(11) DEFAULT NULL COMMENT 'Usuario que creó el servicio (FK a users.id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Catálogo de servicios y procedimientos con precios USD';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `treatment_plans`
--

CREATE TABLE `treatment_plans` (
  `id` int(11) NOT NULL,
  `encounter_id` int(11) NOT NULL,
  `plan_type` enum('medication','procedure','referral','lab_order','imaging_order','indication','education','other') NOT NULL,
  `description` text NOT NULL COMMENT 'Detalle: Nombre medicamento y dosis, procedimiento, especialista referido, examen solicitado, indicación general, etc.',
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Planes terapéuticos, órdenes y referidos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(128) NOT NULL,
  `last_name` varchar(128) NOT NULL,
  `cedula` varchar(8) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` varchar(16) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(32) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `cedula`, `birth_date`, `gender`, `address`, `phone`, `email`, `password`, `created_by`, `created_at`, `updated_at`, `active`) VALUES
(8, 'Miguelangel', 'Monasterio Salas', '31080925', '2005-11-24', 'Masculino', 'Palo Negro', '04243316242', 'monasteriomiguelangel81@gmail.com', '$2y$10$CSS5PCqomxadD.urcDgBHOs4icLn2KSKkqXmA9jSWO9I3UUTEzCeq', NULL, '2025-07-30 20:56:13', '2025-10-25 02:37:22', 1),
(11, 'Jessir Nacary', 'Bravo Monasterio', '19514942', '1989-03-16', 'Femenino', 'Palo Negro, Urb. Santa Elena calle 8 casa 6', '04244435711', 'jessirnacarybravo@gmail.com', '$2y$10$RIo3R4w7atd5M.fOi7JcuONR/rKlAYngAXCpgWui4zmS5PhStLLNu', 8, '2025-08-01 00:36:04', '2025-10-26 23:09:46', 1),
(23, 'juan', 'de la torre', '20989787', '2025-08-14', 'Masculino', 'Palo Negro', '04241231212', 'migue11monasterio24@gmail.com', '$2y$10$Tx81K2uOgGcRkZ7XS.JtZeEqpKpV4MkRZhB8fZ8LGqXcKuclzWzye', 8, '2025-08-11 02:11:27', '2025-10-25 21:42:14', 0),
(24, 'Eduardo', 'Hernandez', '23455678', '2002-06-11', 'Masculino', 'Maracay', '04123338989', 'themiguemonasterio@gmail.com', '$2y$10$VeLdtbjGsFGvNoyBGUZbqOq4bUPuxXMiQ1pk1.8/kdZMbolMFx2vG', 8, '2025-10-25 16:10:06', '2025-10-25 21:39:34', 1),
(25, 'Alberto', 'Morales', '11234111', '1980-05-05', 'Masculino', 'caña de azucar', '04121232299', 'albertomorales@gmail.com', '$2y$10$2c/HIAfDhqhdg0pAxrpwvuomb6rcEdUCLKphsPv6/RkV7Iq5HrBDq', 8, '2025-10-25 21:27:41', '2025-10-25 21:34:54', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_medical_info`
--

CREATE TABLE `user_medical_info` (
  `user_id` int(11) NOT NULL,
  `mpps_code` varchar(64) NOT NULL,
  `medical_college_id` int(11) NOT NULL,
  `college_code` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `user_medical_info`
--

INSERT INTO `user_medical_info` (`user_id`, `mpps_code`, `medical_college_id`, `college_code`) VALUES
(11, '141013', 4, 12756),
(23, '141012', 14, 12752);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(8, 1),
(11, 2),
(23, 2),
(24, 3),
(25, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` text DEFAULT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `session_status` varchar(32) NOT NULL DEFAULT 'active',
  `token` varchar(512) DEFAULT NULL,
  `logout_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `ip_address`, `device_info`, `login_time`, `session_status`, `token`, `logout_time`) VALUES
('00273e871d43c730228ad490b7e603d71decf490f3dac5cf39cfe1b2caa62d15', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 13:41:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTcyNDg0LCJleHAiOjE3NjE2NTg4ODR9.OsOTxrUwYxuYHUBms7rI8jnN1fPqGWJfqBqn3fyq4Ps', '2025-10-27 14:41:51'),
('019e22ebec77894072ed447b0087ba4c54fe98d581bfcb771175939957902199', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 18:51:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTA0Njc1LCJleHAiOjE3NjE1OTEwNzV9.Snj3D2NNdz-GHz1DGAlV1bgzXjV6-bZbnMXt60_dj_M', '2025-10-26 19:55:37'),
('02231a51c290a7949da05f35bf3cf58891e4ed4812884a6c52daab04e7b9ec22', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 06:55:59', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MjY4OTU5LCJleHAiOjE3NTQyNzI1NTl9.Du_AKFcWRUby8DQw0Gl1s13Er8U28pVeFS76V2gBORk', NULL),
('02469167a7ae13bc86a2e17a535f2909f6ca3ecda76d75f68c9219676505b3c9', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 03:04:40', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQxNDgwLCJleHAiOjE3NTQzNDUwODB9.YxtHUdyIZfNeS8l_NunIfnyzFWx2DU5mvJlAMiLfXMA', NULL),
('025ebf5e29abaedaad6168408afe334c0f892cce9f2683206062d828fcf6feed', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 02:43:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEzMDIzLCJleHAiOjE3NTQ1MTY2MjN9.TsSbefwX9XQ1Wei1e-AjiWW5VAd5H44GUQPHfazPSwA', '2025-08-06 20:59:55'),
('03d83ebe09bba03e708a9cfede36a6acd388ff1926c85a2dd817838016152806', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 05:07:08', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjYwODI4LCJleHAiOjE3NjEzNDcyMjh9.8s7Iw_rrytgqZCk5of90oLbyb8C70Nb03RzKZfoxmaQ', '2025-10-23 23:13:35'),
('03f44ca9932fdcc8bc86d01968f1e211bebe75c3509340e8d44e255dd7e66139', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 01:05:25', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzM0MzI1LCJleHAiOjE3NTQzMzc5MjV9.eRAwtbzSQJC1Iu8pG63qbFqYNMETEPXNW5u42KEQF7g', NULL),
('069eb5e8f826158596b6c1889453ebbe475e2af5abac7d6862021f6a7c197cb4', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:16:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwNTk4LCJleHAiOjE3NTQ1OTQxOTh9.wyKKMG9MGbiy2AEp9S0jm6BXTJZveCvDar0cEMg08nI', '2025-08-07 18:16:56'),
('0cb9abe9fae4fc269036142000331d6279904b864af8b7b12d15a08dc24b5f33', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 20:01:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQyMjQ3MywiZXhwIjoxNzYxNTA4ODczfQ.vIozr4F8IoWcdf0Fc_e4JRhtg4NxXyMdJ3CEzFu2_wg', '2025-10-25 20:28:26'),
('0e701a2095c4ff049dbc0c998a66fef31890de5f9ed08d6c33691c4ae964b91c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:53:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ1MTkzLCJleHAiOjE3NTQ0NDg3OTN9.dmB45Gfta4fi5TLcVnel4-p7o4PoUdIBCh6UKHO5qUo', '2025-08-06 02:31:29'),
('11826b6ed84993ae9fe098ae085eb5edb7601b3f4444b121e7d410768be48f20', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:05:00', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTM1NzkwMCwiZXhwIjoxNzYxNDQ0MzAwfQ.kOheP_iF7b9eikHGWNAPbQE8pZCi8lr9-z2lcm9M150', '2025-10-25 02:05:11'),
('151b03a7ff9c4b3677feb00a6bb5f966e69a972bf359b6e94ec0c7e03c114be1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:34:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTA4ODUyLCJleHAiOjE3NTQ1MTI0NTJ9.vZRg59hN-XHRwkv997JL78doS9VNfyK8sOKkVb8yUuw', '2025-08-06 19:37:25'),
('1aafdb4cbb73d1f1a78f3b96ebcc4a73be590a4a2e06aaa774e55734a22fe5d2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:15:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwNTUwLCJleHAiOjE3NTQ1OTQxNTB9.x9Zfeq4X5PugA8TSxvbJezLeE6Tk2FaSHI45-IbsYZI', '2025-08-07 18:16:27'),
('1b3016fd79c9d435473ab282d8aa1d76b32e369178ee45a671ccca023daa104d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:52:56', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI3MTc2LCJleHAiOjE3NTQ0MzA3NzZ9.Ryl0oA0yrx6bM_LmjjaRwax8FgZZv-Eogk1AUp8Qbhc', '2025-08-05 20:55:23'),
('1c7e4ca68081ae6b45138d062001dc6d1a969dca091353e3939677017adfe5f2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 14:05:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDAxMTI5LCJleHAiOjE3NjE0ODc1Mjl9.OU74QIH3-JMolUEyli1W9bRnd2aa8XjtcpEMnGWfzTA', '2025-10-25 15:13:13'),
('1d0296cc2d87b55763f2071952c87596ae1d92e4d9ca51669645177192ad9322', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 04:55:14', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMDg3MzE0LCJleHAiOjE3NjEwOTA5MTR9.PrQobtYo60CkrttkwLXhjMNf7niRYvPP2zzT-Ao0Uuo', NULL),
('24709891e3ab7bfcfabb322dcd7e6ec77e3a3b633e5a00ecf7da00df8eb79dce', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 19:14:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDg2MDQ0LCJleHAiOjE3NTQ0ODk2NDR9.PQWnn9BW8u5ezBY51ZMsQwZ-Abe-zT1mrUYrrPKE6rk', '2025-08-06 13:18:01'),
('26666e2592e8f12b5cb132a5d4398d85880ca10f665850171eee989e8cf57483', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:26:31', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjgzOTEsImV4cCI6MTc1NDMzMTk5MX0.8gtOIhzbcYHghu3KZo23tSMGD_NHpB2Zpmu5D3A2_mg', '2025-08-04 17:27:07'),
('2a147347ed3f1fe0e27a9c689ad78ca00a2d3b68fbe590fc43edc7b1a2781ff8', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:11:31', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3NDkxLCJleHAiOjE3NTQzMzEwOTF9.fy0QXflcBsamJYDtHUcYZ0P4RZcZrZ629yTD1BtTrfc', NULL),
('2b09d38e8cd348d330a0b03cc527952a9b712be8fc75993dead5349ee9aefa79', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:09:06', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQyNTQ2LCJleHAiOjE3NTQ0NDYxNDZ9.HwTL7ALGP--S59OihLkFTc-hZUKep5ITrg6yYGvUVzw', '2025-08-06 01:14:46'),
('32a1ca8477fc0c6bd83e20464d26e932a167ed34770ee2349579a3fe497a9f69', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:11:55', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3NTE1LCJleHAiOjE3NTQzMzExMTV9.K8I2cCPcpzL0-sSby72Ed85EYJa6pA-baHbWRamlhBE', '2025-08-04 17:12:39'),
('33e465f1ae702b591c72f24b069097e585922b816f20eb24ec71b79d3dedf5f0', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-24 01:47:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ4ODc4LCJleHAiOjE3NjEzMzUyNzh9.8lLOuoaf8acy7VYwtW1mssK83KeWfAXLkgJ3HlE2vk4', '2025-10-23 23:12:32'),
('364fa2779f2c90495a21677ec0d41c9c1e97c595938ed0916f6c18bd31787eb4', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-08 04:38:02', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjA2MjgyLCJleHAiOjE3NTQ2MDk4ODJ9.QLF-m_r4CGABdvs4bhr3Eh6Y435icYM7tuxei1zqA1A', NULL),
('3675779817768b63b776a1723a1661c1f23643ca6fabac8ba9dac3970c48f3d2', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 02:25:48', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTkzNTQ4LCJleHAiOjE3NTM5OTcxNDh9.YlbqlIilF15HNilGhhzA4kz1EOxP_dj0d9mtePutfKQ', '2025-07-31 20:28:48'),
('3683012b1d7b82567a430704b3a1feec047c2d19f6168ce798692f4e5c922756', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:39:47', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MTQyODM4NywiZXhwIjoxNzYxNTE0Nzg3fQ.V7IemQemvJBEVsHZ1Jh6EOxYw39F987amEx2o129UGA', '2025-10-25 21:40:25'),
('368ea52b2266f52dc7c7bf81da6c526f7f4e6360fb8a3d654b033eb692e03e91', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:00:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwODAwMSwiZXhwIjoxNzYxNDk0NDAxfQ.P_f5O21Y7vG4KMnpQbeE1iE1Ml6rKGdBorVZouEOHsA', '2025-10-25 16:05:21'),
('37e316030b9f1bc7b02fa10ad53799a76fef9856baf956130e500e045bef485c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 00:54:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDQwMDc5LCJleHAiOjE3NjE1MjY0Nzl9.GWBNYjbLuLSAl4jNUwUtNLJlPAykp_0yEIgrSJ6Y5pE', '2025-10-26 02:20:31'),
('394b58740d6bc888a68b1ed23fc5c5a9d15391bc6f8a2fb95b2300ece606393c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 19:32:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTM1MTM1LCJleHAiOjE3NjA1Mzg3MzV9.kHsXsROPBqqZ5k8CfdppT9ARetrMsEBc8Y6qVxrAU9w', '2025-10-15 14:29:45'),
('3b26e6fe449548eeac853962b0fcedd66bc3c12e2a30adbf076aea376ef40984', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:33:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI2MDA5LCJleHAiOjE3NTQ0Mjk2MDl9.3NjAFxhY9k5PBIicw83C9WIbybkBwZPxbV54OKxO0vE', '2025-08-05 20:52:51'),
('3bce1ff2922c1a7923183243755b5e2362ad95555425426a67f20adc61422e85', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 08:31:35', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0NDc0OTUsImV4cCI6MTc1NDQ1MTA5NX0.xgbY-QKvXR5JeZNxSplB1ROf7m-7mRGXc-Ao7dzHYek', NULL),
('3c3a1e4f9af672e7896aefe4b42be4e5c258153328425e8d71ad787848d8ae50', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:59:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNjAzNTksImV4cCI6MTc1NDA2Mzk1OX0.MWCc05wIIyRzUkqBcmuUEp2IgFJtZLKk9RRew67pMs8', '2025-08-01 15:00:21'),
('3d952261cf8e370f464ab054a6fed2060c4f9963370f03eec4ad278cfe975454', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 06:06:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTczMTY0LCJleHAiOjE3NjA1NzY3NjR9.jueJlXLGtC34q4y44IbAbaufZ2Ny3DK-GsqNKMQywhs', '2025-10-16 00:21:28'),
('3dd0ca1392abbee9044b3b2e9bd66f48aebe3af3367bc24d1f72ad11433505cf', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:27:43', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4NDYzLCJleHAiOjE3NTQzMzIwNjN9.40zQV6dlSdOpOpGGEs-3uJ3rh9ciQ7EnODVB0C6JZto', NULL),
('3df7fe5c1766eb50ac3818c3b5ccd3e248c15e7b4d1dbff863afb68e370efff7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 07:11:45', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTI5MTA1LCJleHAiOjE3NTQ1MzI3MDV9.J4ximnifTYgJpFBofxipuAQST7eQr4ne4iyEGHpSY9I', '2025-08-07 01:12:19'),
('3f8b5de15fd497be7e1d93102a6ba23d22fb97ea6aff64a978a2b1e11e1680c5', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 02:58:04', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQxMDg0LCJleHAiOjE3NTQzNDQ2ODR9.jnQ9Dc6qOeLe6mPc80hvoxQGgpVN7l2mMSZRMqliR7I', NULL),
('44af854132d8a3c494d9cf084696c73977d1b05d6c0880d9d97cd40aa84e049d', 23, '::1', 'PostmanRuntime/7.49.0', '2025-10-25 20:15:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQyMzM0MCwiZXhwIjoxNzYxNTA5NzQwfQ.C3jDoEavR-nuMdstzaNGzgheDeODlTbvkQxGy4E3lZI', '2025-10-25 21:43:34'),
('4554adcf40b4cec4756561051ac47a0e1ad5e8ccc9f927c3cb1672444841b298', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:26:37', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA3NTk3LCJleHAiOjE3NTQ0MTExOTd9.cGbT3bUVApK6-TIxo0IBTU30tXqe9FPvPJoHu4uv3I8', NULL),
('46071c7170802079143cae400b3fa2facf9177a1fcbc9009ae6a85b14a42d691', 8, '::1', 'PostmanRuntime/7.44.1', '2025-07-31 20:50:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTczNDA1LCJleHAiOjE3NTM5NzcwMDV9.tbjh7zupnGEAv5qpjd1pKxzoVtosKPIne7VEZgyi0Ig', '2025-07-31 15:14:33'),
('491c65ce1ed7acf9d2577514cc67f09c61ae98b8da05b4ea7b6791e5dcb1967a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 03:19:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTE1MTc2LCJleHAiOjE3NTQ1MTg3NzZ9.NJDZ2CwKiSvdfzJvy-RthpsIRKA6i7bRaQU29GNdvlQ', NULL),
('4a20761eaa2825b1b402a6dcdbbb66600d337ed3627e5cfbfbe5266a920cf9c5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 18:10:14', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTg4NjE0LCJleHAiOjE3NjE2NzUwMTR9.ywCL7_htU1cFxYwbgWrda_1nFu2JSftxq8WtqIEAB04', '2025-10-27 20:24:53'),
('4c33c092e19c2d0d3bc876ea6f96153b35db1a46019decdbfa206b53c1f68261', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:30:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA4MjA0LCJleHAiOjE3NTQwMTE4MDR9.xDM5GJZM4aRB2eM7AEGZnpncIk_Q9sZrC0_IiGKACfA', '2025-08-01 00:38:37'),
('4cf8ba7b225d55585dee794c5147b4c6496d7fea831dd38269cd5ddae778d438', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:34:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkxNjkxLCJleHAiOjE3NTQ1OTUyOTF9.lkA8kQc11RF2W5SXsWhF6S5M-f0FLzItTZ5kFS87s6k', '2025-08-07 19:34:28'),
('4d62483b6e66291235607f0fc6a865a17e4e191a800c8e87eb4e817320ad3054', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:10:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMDA1LCJleHAiOjE3NTQwNjQ2MDV9.X08QpkkVpiWCdkU0H4EtcJfdRYNdCCxGQUDJ83FtaTI', '2025-08-01 15:10:59'),
('4d657148488e317a4f6c5087d84cad8784900e25a7c0e137fc796e5d31fc059b', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 02:56:28', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQwOTg4LCJleHAiOjE3NTQzNDQ1ODh9.VRRJ1Eu6qd6EjELDz5rcj4mXnuNl_5uV_7_Lk5cYxd8', NULL),
('4e11301d180bb8979f72477ab6990dce9ad8aff2447e0daa4c0bcb59716306e3', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 22:22:36', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzQ0NTU2LCJleHAiOjE3NjE0MzA5NTZ9.xs6ny0hKFtqf37Edg6NKN2jdK_B-CDNkaXo1wzimUuY', '2025-10-25 00:03:55'),
('4e434bbef3f1dc127081690f78a82e7e86b09d5b1fa89631409c01a66cd67b2f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 03:00:22', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTE0MDIyLCJleHAiOjE3NTQ1MTc2MjJ9.AArPV8fohDpelUFLJFebbwsv4i0aVpY-X200RZEr9L8', '2025-08-06 21:19:24'),
('4e6e8ff5b05f63244c209640eec655764d77b0551c0b70e148f5a9a6180ab516', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 01:41:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU2NDY0LCJleHAiOjE3NjE0NDI4NjR9.JDdyrFDx7pzmDkPE0i5o0SBzRgVY4mFvMY80GZwztq8', '2025-10-25 02:04:32'),
('4eac8ee189f12ecb8903c902c74fd3bff8c5704d048b44171df514b7d7279138', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:55:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ4NzczMTgsImV4cCI6MTc1NDg4MDkxOH0.tdXjw7Jhl10CRYTPZLedZXyrVCl7UQAVcBPF1TRfxnk', '2025-08-11 01:55:33'),
('571b639a459b7f85d0496349e2cac169a8040d3118492db2e19921d50e3e33bb', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:45:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA5MTM5LCJleHAiOjE3NTQwMTI3Mzl9.9vQ2IYvHacVQ3xZtGLwJujHCJp6nK77x_QQ_Y7MWcyI', '2025-08-01 00:45:52'),
('59504939f0d4511315039864f562c85a5d202fede475b1eb03d549416a696e4e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:14:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQyODk3LCJleHAiOjE3NTQ0NDY0OTd9.OcTBgi4TtQkN75bMVUaIRHu70JkIwrF6qKnLPRioj4A', '2025-08-06 01:27:44'),
('5f05deeb29d7e2149de241390a4b1bee44f119dd9272a572f7f1a06149e4b329', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:08:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA4NTIzLCJleHAiOjE3NjE0OTQ5MjN9.UV9bQUEsThlbGpsXXazoy8nnRnVx5gplAuDMzL0byNo', '2025-10-25 16:10:12'),
('5fa6ee327282fec2559039bfa51caf99172b723034dc5a554ad15e8c983c4227', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:47:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzUxMjMzLCJleHAiOjE3NTQzNTQ4MzN9.4iK8i-wp1RbazTuPHnnA1D9jWMKUCgOitZPdRbgBAnU', '2025-08-04 23:53:43'),
('5fe7d527695bdf21b1a659930c04bbe193d61a2e751fb11f4e32649b2303fb16', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 15:20:03', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA1NjAzLCJleHAiOjE3NjE0OTIwMDN9.Pv4cIq8nCOVK0OrvxtgnruL-cQXIg20Dk7yzMT5nU18', '2025-10-25 15:30:26'),
('615d7d31bdb5c0aa76f3099707ba7695ef819e3e8792599c45f5afa58e166a8b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 23:56:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQyMTk5LCJleHAiOjE3NjEzMjg1OTl9.KZ6edycCjg0SZxyOZ_PzeH-IVoFDvMQaolxa-quAAaw', '2025-10-23 18:25:55'),
('6584129f54351d63132b719b96b07157736a2c314b96658dcc8fe407838b09df', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-07 07:53:45', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTMxNjI1LCJleHAiOjE3NTQ1MzUyMjV9.SvLci9-T2J27p9rE1a_IdB3zZ4_3mcCfB3cTpODx3Qc', NULL),
('66803d1daaf8b9ec0062c7b8f5be878f8c12c98f9f61356e85ce410d460a6bb8', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 03:39:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzQxOTk4LCJleHAiOjE3NjE0MjgzOTh9.pkWCdEtMR0aOiWYvtsrl73dnXracOzX7ek2NPtZxiIw', '2025-10-24 22:22:31'),
('6721b9675d12b20e26fe747ba2417978ba9ca95967fba4239f897baac6531fc4', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 15:13:21', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwNTIwMSwiZXhwIjoxNzYxNDkxNjAxfQ.cnFY_CbfEEs8Rp2mNn2XrWtzmGl9pQ4LZaRsrqW31oE', '2025-10-25 15:19:57'),
('67521295e45717c8fa13c401b3a6ddd214eb9b01e03b493f774e5d10ec278e9c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 20:52:23', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1NTQzLCJleHAiOjE3NTQ0MDkxNDN9.6rwJ4tIH-nPAS8AuOJT9y4H6kPF3r8lFev1fq_iTCFE', '2025-08-05 14:52:47'),
('698b9fa0585baa1dbd312ce2d2ab59bfd519ddb7398daf91ed8058e233043b81', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:27:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQzNjcwLCJleHAiOjE3NTQ0NDcyNzB9.1KVfwZa1dFNvSM7hNHxfWK1AGyfJGJqrsRlZiYTtPkY', '2025-08-06 01:28:02'),
('6a7f4f51c7de4af9962e43794c3bc6f8e8f3c694294f24ea698ca345af814e0a', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-07 01:58:53', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEwMzMzLCJleHAiOjE3NTQ1MTM5MzN9.pY8YuKUuFCX2-z9uJsbp-Q1hkqbSMPydbdtNef9wkOM', '2025-08-06 20:00:54'),
('6a97620a03e5e52b9cae8142951fb36b9e0fb8319c33ff5c0c46a1f3f843d93b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 20:44:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI1MDY2LCJleHAiOjE3NjE1MTE0NjZ9.EbHfHZWjhb49K-_etzWM5YNORl1GDlsMXANlng-RVKY', '2025-10-25 20:49:40'),
('6ac8bced984fbe9e5a0eee6950d60d30ce48df44a0ef68632141dd4c3d990ed0', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:35:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDkwOTU3LCJleHAiOjE3NTQ0OTQ1NTd9.Mo9Nma8aM3mRRWBNTyxN1HMw1PHKti0ySeUUh0M5VCQ', '2025-08-06 14:43:25'),
('6b510c87089f01106c7cd2d9cd32fb0dbeb3b2dffb96d3fe9449359ea26f7164', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:25:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MzMwLCJleHAiOjE3NTQzMzE5MzB9.bzFwvrreOMEKsso-fdmaDzuB-9flnJKTSmqyucXGbV4', '2025-08-04 17:26:25'),
('6dacdeea6403e7655723b4a141753a75efffa1c553ee165bfc2de72a20b9ff0a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:36:53', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5ODEzLCJleHAiOjE3NjE0NDYyMTN9.b-fztuhhURwBq3uz6nXTj_007JF3SO2T3Pc9qi3Ro7s', '2025-10-25 02:36:55'),
('6ff96b007f46dc6811dbd1d60ea3a11d4d77b1bd32d4e07afc38b169e02fd9d8', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-25 04:07:35', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzQzNjU1LCJleHAiOjE3NjE0MzAwNTV9.ke4Uaz2QIi1PQ1mUPraLLNqeiSGCvGV3fNRBibNIIz0', '2025-10-25 02:37:54'),
('7094f1cfda1fae753ec011ca85f1d8fabe1010a813fafc31b40ec2b8963d1e25', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-06 08:30:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ3NDU3LCJleHAiOjE3NTQ0NTEwNTd9.OKPgK68UOTTeEwdmS424toiN0AmI4_zhohW4-dWNV0U', '2025-08-06 02:52:00'),
('7112ed3487ecd1f65385f0acb4cf88941bbbf0e0912a9520bf49c631980cfa89', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:13:14', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMTk0LCJleHAiOjE3NTQwNjQ3OTR9.oyVUnx39twtCguWjcnmZHFW-qygixeY8fkj_RdOYELE', '2025-08-01 15:13:27'),
('71bc52eb74c3c5cd4a0781928f128f4efb84b7c09c9ebce5fd2ad4116a0754fb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:40:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NDQxLCJleHAiOjE3NjE1MTQ4NDF9.eDyHm9OSLQHfKYS6jeqx6QD8asQfKy9m44_MpJ3wS88', '2025-10-25 21:40:46'),
('71cc5e7a9546b22046d496aed518ba8fc3684e84b92885912aaca4437c838d2b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 21:49:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjM0NTUzLCJleHAiOjE3NjEyMzgxNTN9.I9nwvJPHgxUiw1ZqujHdjFzeP1I26hD03nO3lC2vyQY', '2025-10-23 15:54:29'),
('75029a3214921cbc30f26b2b7a39048cd97aeab569bd79858493d5803bfa780f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:40:56', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NDU2LCJleHAiOjE3NjE1MTQ4NTZ9.jJAy9AG-ABDYemdPELRjYVe2aVBLTjQv39LHw3I62fw', '2025-10-25 21:40:59'),
('753a80cecfd65a43e476b420f81f6658ad4d15e8aeb1983a306f11f89509d2c2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 05:41:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjYyODk5LCJleHAiOjE3NjEzNDkyOTl9.NfvTTpDCo76pFgF5A5xiLTF6m-hkUXdo5ADeFX3wA0g', '2025-10-24 00:51:24'),
('754f9b616896a40e18ead4f877c125b1e75055f58e29ced60d9c4a36fe565514', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:43:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0OTE0MTAsImV4cCI6MTc1NDQ5NTAxMH0.HamDqMSWb9Mtu47IVlfz1OPnyDKDhkn2i_ZhDdu5d04', '2025-08-06 14:43:56'),
('763cf5577ccad57de406939daedcf2e07fc6bba3701a23f17bc2e80ba130f150', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 20:54:17', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1NjU3LCJleHAiOjE3NTQ0MDkyNTd9.F8LnMHWepGUG97RZ6d2v9-vnLd7QRHK-9gDsfULtjdc', NULL),
('765a0fca079f24b95f60327b6852102b9cde2490bd3bc11e9ab4c09620fe1aea', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:38:44', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDU5MTI0LCJleHAiOjE3NTQwNjI3MjR9.AN5JSG10uw9SAwoZ5mLjWw7G16gp3ru4nrX5auwHCt4', '2025-08-01 14:47:59'),
('7750bdac1997bf8c9a6ae6e3d171826d07000980d65697dc9e81928c122dff6a', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:06:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4Nzk5LCJleHAiOjE3NTQzNTIzOTl9.WZ2zFHk5bkWpG6ck64j9XRBcPEkIuglmUQSXMzfzyfM', '2025-08-04 23:10:22'),
('79aae2ecebb6316d2ac7fb0197eb463dc814abc0ae49f4e6f82c1c577303dc42', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:25:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTM1OTE1MSwiZXhwIjoxNzYxNDQ1NTUxfQ.7pdG65jH6UG3KEJ0wxotQLhJ53qsfd0krzAo5SOZQ0A', '2025-10-25 02:27:00'),
('7af72eb230364f7bc3c699e12e7322fe9f7c127d8b275e7561d03e85c8b58367', 8, '::1', 'PostmanRuntime/7.44.1', '2025-07-31 21:15:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTc0OTAxLCJleHAiOjE3NTM5Nzg1MDF9.Hns3WYWFY7o6eJF14HrN1cLLfMNwO7GPGW8yitlPJto', '2025-07-31 15:15:23'),
('7b1115fbfdb6244af30837bcd62d308669efd8619738c52a6acc7d71aed98f0b', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:26:54', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYyMDE0LCJleHAiOjE3NTQwNjU2MTR9.k_wBa-tDlxapZdntVTlbbImUdCfTw_BZoDQapI2B0dc', '2025-08-01 15:27:49'),
('7bc078e2f30e090c2d88a700b4203849197065dfc00ed5d31020b5c5360343f3', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:06:48', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4ODA4LCJleHAiOjE3NTQzNTI0MDh9.wNjuz1yhC_eB-JZl9zkaC-EzcUFpevHWyd6pnMaHphA', NULL),
('7c175b255057f1568e64f8cff8ced5dd7851ad605b2329d7d340dad1f0bf16fe', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:21:21', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI3MjgxLCJleHAiOjE3NjE1MTM2ODF9.MEj1aML7u-_sSDdSiO9fI5LGQIcl8hTqsMtc9x1tnYo', '2025-10-25 21:39:02'),
('7cfc06e6d07aa23441b1bf8fdcbb54ce17e00b695256c0eca1fc2ddba2f17588', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-23 21:54:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjM0ODQxLCJleHAiOjE3NjEyMzg0NDF9.MUgd6Y2_AlvDlfbZ9ySR7CNqWplh5OpEY8xKapETR4w', '2025-10-23 15:54:23'),
('7f23e7c2a56795d4c6954fcbe4742214e362d44f94e9692ad51174c27867849e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:51:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3MDYxLCJleHAiOjE3NTQ4ODA2NjF9.ZuXbBOQWtqckrSmkT4zYiLXIZtNXvlmU7aHdaR-aZ3E', '2025-08-11 01:55:06'),
('8398fdd6511ac1791f8af30d1f37b4cd5d8fc223bf7fa0eb75ea7ade092c2adc', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:41:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NTAwLCJleHAiOjE3NjE1MTQ5MDB9.bozLFSBbYXiGxtAI45nznRhql9jtCwN61WNtQrZ-m7Q', '2025-10-25 21:42:28'),
('8469d7a8f364d9762d35e9d69a678963801a4e6643516add4c90a9575850291f', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:10:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MTQwODYxOCwiZXhwIjoxNzYxNDk1MDE4fQ.W2OAW-vG5tZC3XEZGxJUbqn3TMoVJBXx1Rkx66ZDuLE', '2025-10-25 16:13:33'),
('86df8f2d3210933540e553f3445954880f49ea9c08a372555e0848e5509cdd6f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:40:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NDUwLCJleHAiOjE3NjE1MTQ4NTB9.s9_EyQWYVuV-PEJGgAr8aeUAN2f0jd9hV8sYrH-2DlE', '2025-10-25 21:40:52'),
('88adae52c0b6a9582fcc2d01ca7ffbf15c9fbd1be9e45737a99790aa3efe6c70', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-22 04:56:43', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMDg3NDAzLCJleHAiOjE3NjEwOTEwMDN9.asrCfEFU-Uy1p3CRdVpzUbVnoy-KnBbwC_wIk-UGPCM', NULL),
('88dfeb93fae572748ac458f86ce4af5d1f2c53fc768bb1fb53a4e3eaa15393cf', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 07:22:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDExMzM5LCJleHAiOjE3NTQwMTQ5Mzl9.Rhvb7UhcXpFowXZ0MBWBBbD6SAybDOHxzEbT0G3cJeE', '2025-08-01 01:32:15'),
('8977a2d691e2b84d5452a711f670e54984d0075ac9a4f6a5fd82b49d6e6ef35f', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:04:10', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3MDUwLCJleHAiOjE3NTQzMzA2NTB9.jtUPGcOLeQE-OTkWuGYh7H1SDQbBdffCc12PMuy4zHo', NULL),
('89a94e08d30b20156c2532e40573ba2a0f02a3661644fa09d763e7aa17a0e21b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 08:14:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTMyODk4LCJleHAiOjE3NTQ1MzY0OTh9.zWkQ-G3f4gi-HpCUIbgrnyHKTvVdGfTwd_qtdKn3sq8', '2025-08-07 02:56:21'),
('89ab06cb68173478e7fffc830468a0053efaf519eaec5018362c2f7a3f46ffcf', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:12:16', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMTM2LCJleHAiOjE3NTQwNjQ3MzZ9.poYdj8Ml3WCizDf9yJZ3bnXsn1OiUP38XVIpwbnOEcE', '2025-08-01 15:13:08'),
('89b285a267ad911b37cbbe83e59b12c35023649a747e6ad41c1f3827497d2cba', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-23 20:52:04', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjMxMTI0LCJleHAiOjE3NjEyMzQ3MjR9.9tjUwgl422Vpkg1LFK0gq1PlzrEiedGZkkeXu8As2kU', NULL),
('8bd38a0688235a126a55cbaca6fba12f9716a760d928dc83761cb6f1d36cca11', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 20:57:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI1ODU4LCJleHAiOjE3NjE1MTIyNTh9.4e7FoZS00DO9EowY-7zVzz4o4WwqHFqHhlj5JKm-sS0', '2025-10-25 21:21:12'),
('8cf28dae5cbbf72ff667bd100a556141ab17c8e9cdcee8e8b8b0a4bab39e59b1', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:04:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTM1Nzg4MiwiZXhwIjoxNzYxNDQ0MjgyfQ.KV017Bb-r5BCo3p13vfOMloH0h81ZM3wTvEDH_7kuEI', '2025-10-25 02:04:46'),
('9591aa7df93152b75a57a319b71d7214918c27d3934779a001e413f321c8894c', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:39:10', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwMDg3NTAsImV4cCI6MTc1NDAxMjM1MH0.cy6m1V3m8rwHPOGGno9SZRnnN_eD6qb4hvWxX9VbC6U', '2025-08-01 00:40:38'),
('98f148ff454dd2dcee9bd3d3f85394fa68e7eff2b1c76bb53e96f810fe7e529c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:28:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5MzMwLCJleHAiOjE3NjE0NDU3MzB9.XUuzulfhGOMGYDlis0usyDQfhWF6-uYCCJfqXiKTtjw', '2025-10-25 02:29:28'),
('9953601b0b143beb8e0f94aedd375db86cad8d66fdd5ce86213d09e75ce6b9c8', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:34:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ4MDc4LCJleHAiOjE3NjEzMzQ0Nzh9.Kmn94jj7kOM3sVXouugYqQxFCY-Wnz4XfI8Nihqabsk', '2025-10-23 19:44:35'),
('99af8455510b3f9546c0c6bada06bb96f6f61b2128aca8173ad4f770d3bd25b1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:37:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5ODUwLCJleHAiOjE3NjE0NDYyNTB9.HKHb0ugweBLApl5t1qYzvFckwaLz4MM3-27f1NfQij0', '2025-10-25 02:37:33'),
('9aa1733fd5161760e5895af1348a16f12fc2c1d99dec29b1f60d5f440fa03311', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:45:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA5MTU4LCJleHAiOjE3NTQwMTI3NTh9.ky-u64D0Q6Xio7I_R1EcKdpnjdhzl6LpUGZf30uo5y8', '2025-08-01 00:48:35'),
('9b54b802bfbff5bed1bc740f98bf75fe961f7fcc097474e2ba020dc33e2a6d81', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:28:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNjIwOTIsImV4cCI6MTc1NDA2NTY5Mn0.purQkp745Fj8EGnyRDqQmtdOI2sokX5YUkykroM1XvI', '2025-08-01 16:12:48'),
('9bd44b79323128238cf18767f9d30bac60a867c16dcf1dba1e018677d71e2c7d', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-25 20:14:44', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDIzMjg0LCJleHAiOjE3NjE1MDk2ODR9.LbLSB9-g5c4XilW_0LKy32poVHcon7f0bOtAzkEEwJc', '2025-10-25 20:15:19'),
('9c292c95353498adc56d704b063cf84e52b4e4ecef5dc254a615493e3596ff44', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 04:57:42', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjA3NDYyLCJleHAiOjE3NTQ2MTEwNjJ9.z_8WO5P4nr_k8e2Rjq0ATOaHloouiA8X3JsLIe9jlI8', NULL),
('9de6801a0682a0e3d1fc3860cdb57d22244fafada63d4b44ab9332c83a23d8c4', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:29:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjg1NDUsImV4cCI6MTc1NDMzMjE0NX0.5OaOE4H65olbRTVb1FNTEtb0xniOLU3f3APSI6cZ2S8', '2025-08-04 17:29:16'),
('9de719fe6859061d8d931f11cfc4227a594d5b3940fa4963e44fecf328f20be2', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 19:18:09', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0ODYyODksImV4cCI6MTc1NDQ4OTg4OX0.SE1T3sY_O4QoAnaHz_Htj3GuM38taDdJHYk9Hxml1IA', NULL),
('9fbc374d868f86b8e32d5aabe54d6ccb7b56cf6d1e5c818af04155f780250248', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 01:39:30', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTk1NTcwLCJleHAiOjE3NTQ1OTkxNzB9.Dgs-oWsaqM-dm3dC_HuK6NIlq6xtGW1RQ-0AyWZsGVU', NULL),
('a012ffee50c078b2ee69bd276d88f7096f5c891adc8ac79120d9ac2290cecfad', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 06:32:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MjY3NTYzLCJleHAiOjE3NTQyNzExNjN9.xOpU_uby3G_kUi64hux6lPq-lVYcwNjr9ZW9Ox7PzaE', '2025-08-04 00:33:28'),
('a11c71ad7adafdcbc1760ba134cea369df73794ec05851a8781e0b01748e2a11', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-26 00:53:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDQwMDA2LCJleHAiOjE3NjE1MjY0MDZ9.mbUZlD8PJrEvHMSNu0BBCu0VORDs1Mbki4jVzkaPXvQ', '2025-10-26 01:27:36'),
('a252f8f46b916b09bf55c276908cb695f15910329a48ba56bca6d7cf8ff84215', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:06:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwODM2NSwiZXhwIjoxNzYxNDk0NzY1fQ.mFVilKJHJKXwvaY0vybzUk_dk0NIoxoeFIxJUqX9FMI', '2025-10-25 16:08:39'),
('a41d5ea938a73325cee07689793babeb2d634833a6aa8b6570bec0a18c12a02d', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:13:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwODgyMSwiZXhwIjoxNzYxNDk1MjIxfQ.qKl-1AiRqBYXL7suBm8GxZ_dVU6xHmnw49EltPjgg8c', '2025-10-25 16:22:44'),
('a888645e058b006c6a4658669c388778964c01680fefe094c41f2bd7f4b1a373', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:05:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU3OTI0LCJleHAiOjE3NjE0NDQzMjR9.EXti47BTfjq2M0KIyV2-DxXg9SgDnpbQuY2aRXA8IZ8', '2025-10-25 02:05:31'),
('aa9a00ee6eb4e4e7778ea3ff2a3086e95782c7eae01045fb71f0ebf4a57e15fb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:22:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MTUyLCJleHAiOjE3NTQzMzE3NTJ9.Glu2qfaEwDbk9xuAPI766g7aTPIapwYohDXBcsyrEWI', '2025-08-04 17:22:48'),
('ab651a2972f422b81b812d459a0a991e065eea5b84b62bd874e5eac91c58f5bd', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:42:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTA5MzUzLCJleHAiOjE3NTQ1MTI5NTN9.isuSYloG8E4Hm9lmBSehDKMZ8RoRnseNrCtl0_ORdJo', '2025-08-06 20:09:02'),
('abe368c4d0143dcf19b00caae4ccbbe9db74acf047ca896288e0b8c135a3ba86', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:24:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDkwMjczLCJleHAiOjE3NTQ0OTM4NzN9.v81D1tQc0Kaswf8C6o3ZV_jBf8t7RrN2C4gdIewuBJI', '2025-08-06 14:28:38'),
('ac363f19f0ea8cb2c6d535504de914e86509cf538c718126a5c7354ea0e08a11', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 20:32:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTk3MTcxLCJleHAiOjE3NjE2ODM1NzF9.QGFQTT1RxLBa4RRfyjra-gzbPaFEzSOioQqOWplCn3o', '2025-10-27 21:22:23');
INSERT INTO `user_sessions` (`id`, `user_id`, `ip_address`, `device_info`, `login_time`, `session_status`, `token`, `logout_time`) VALUES
('ad0571a7a02d7a5492c28c61e4dcca0caa69ca09afc9a8901b18af389a218efb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:05:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA4MzI2LCJleHAiOjE3NjE0OTQ3MjZ9.S7egBxU5JyY8FHb8qCEebdfP8J28e7_pb_r-s1KghPY', '2025-10-25 16:05:57'),
('b1ffb9f53fd48146f5d03e33dbabecc66e28d4ad8b8c2f017151e8d93094bcf0', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-22 06:21:15', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMDkyNDc1LCJleHAiOjE3NjEwOTYwNzV9.Ftaj0n1Th9KdLw4e1C1mKO2fBQxabGA3BSg1tf7gt9M', NULL),
('b263692b74ad0972633c16eaae7ed2bdcf1399d52583e99bde44a5c1ed39e9f1', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-11 07:57:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3NDYyLCJleHAiOjE3NTQ4ODEwNjJ9.zRHgDZBuKRk6pBG1Sz0iFmdpv2qYMcKhw5OxdtVO9lU', '2025-08-11 02:01:15'),
('b53210bd91516eeb6ba030ca218150bcd5fada7572b35d6d0d3f332aa606fb32', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 05:00:34', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4NDM0LCJleHAiOjE3NTQzNTIwMzR9.4bdfTU3MAdEw2uCQ1FxaIPfeVs_aHxaGLHqZVluPtXs', '2025-08-04 23:19:15'),
('b546859074afbd2f9c4b01c4d983e34b8577ef974f3079e85f0285eb9ab2cb49', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 06:09:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjExNzU5LCJleHAiOjE3NTQ2MTUzNTl9.cAMZgiW_EDOnX-TQxKGYaAg5UxIBIcJ6Cg3Ms4LMVmQ', '2025-08-08 00:10:12'),
('b80526a5a50a048dbb537ef4b770798047927709bdb81cfe5ca0698f94bfa7c1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 03:55:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDMwOTI0LCJleHAiOjE3NTQ0MzQ1MjR9.NP8kHtxFAGAce8FExeadJF03J3nL6GXWjhIHMgaCMcA', '2025-08-05 22:38:03'),
('ba664c5dee9f6047e977b9cca2bafd9c3d854ec9d62ea9778a09bceccba57851', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:03:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA2MjEwLCJleHAiOjE3NTQ0MDk4MTB9.gupgCSDnh4I_hsRjgOiVCpMCKt-DeotrUwKRxvTHjzo', '2025-08-05 15:22:56'),
('bae6f444cab02972a2294c22fed68f657e123489b79026471cd121e8850c8cf5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 21:09:05', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc5MzQ1LCJleHAiOjE3NTQ1ODI5NDV9.uC3_YoFxsc8tU1WuYqB3l3BhUWHSzseFjtr6hI1PR1E', NULL),
('bb436158918b88f87c8fbc963c5dc1f620e583b77d6d630026e28e267fcbbe88', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 20:03:39', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc1NDE5LCJleHAiOjE3NTQ1NzkwMTl9.qNnTyvPAP4Lg7_zYe2eEBrkabcJRljWoxywStZCi1MY', NULL),
('c0d612e0b4ee7cade213414ae012daf62c5f23d9c1025ef4eb68e9092af00aef', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 20:55:21', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjMxMzIxLCJleHAiOjE3NjEyMzQ5MjF9.P2kBQTUMEK2f-bTWiEyWVc4UeCAsde0sm0q-STGXzV0', '2025-10-23 15:48:58'),
('c15613c89b24a45700c4a831e62ae879411a9841e69aa6eaca3c96e6889f7dcb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 05:41:00', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzUwODYwLCJleHAiOjE3NTQzNTQ0NjB9.Zq3Av09k3oj6Y-tr4baRoGrfdZzUGj0NIORJIVmqppc', '2025-08-04 23:41:04'),
('c68181b7dc90dd112122dcc0f0d6b404154bdb910df3d6be1ca704768a85a67c', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 08:04:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzU5NDY5LCJleHAiOjE3NTQzNjMwNjl9.aszjVW8VjMdfZD_BYA4DhUBpdHkETBfN2y2YbTF1dpA', '2025-08-05 02:08:32'),
('c69b9187b9ea3b2229526bf9c80ca273b1eb32f5f2a5f2ac10d9c2dd474c49e3', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:28:48', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0OTA1MjgsImV4cCI6MTc1NDQ5NDEyOH0.33eiOHTeg-xuW5VzYJqfzHBAyPU5OJCPSLctjJ0ZP2c', '2025-08-06 14:29:05'),
('c8d764f45e455fb98238c9ba7a8fe2871901426e3a4477ea4f0080975d2ee591', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:55:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3MzM5LCJleHAiOjE3NTQ4ODA5Mzl9.SoPvE6ZCvTPdlajbOgT2RoYtZEPG5Zo8bBfoLzXzTxI', '2025-08-11 02:12:21'),
('c9583be2ea8e1a21a6bf7db85bab003cc297634b3da0c23fb1a28428b6d7c9de', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 07:12:30', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTI5MTUwLCJleHAiOjE3NTQ1MzI3NTB9.IhqmvKgwNkDTmWxXVAUxh8LoJZPS2YeX5O76UiaQhLo', NULL),
('cada10e932b4cefdff862186692a6652774aac345bf3f94f43842d12f75881be', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 04:38:08', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDMzNDg4LCJleHAiOjE3NTQ0MzcwODh9.eiwYSt3DPY7XE_rMvspPHxl3VIbx8Cph95zYWgr0YpI', NULL),
('cd2671953df5199644d4679dfdebfc38d3c29d293a499ae78687eba98b19f8a9', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:05:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3MTA0LCJleHAiOjE3NTQzMzA3MDR9.yOCLpux3rjH2lAC75f6zGdNewPosVNJAxP7AksIo9DA', '2025-08-04 17:06:45'),
('cd66f502eac082bcb6567b7d0eb58421b8bb4b48f245401ad8df3c1c837e6ac1', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 06:51:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzU1MTEwLCJleHAiOjE3NTQzNTg3MTB9.RW5xCW6mW77mBO_D_5qQlPwVXJG0QFod245b-WUPbX8', '2025-08-05 01:45:18'),
('cea29cbb78a596c76949d4f394fb44d1b8859a55eda8611022603781cc6b7ab3', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 20:57:47', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1ODY3LCJleHAiOjE3NTQ0MDk0Njd9.ZtbNDq59HA7XBjooMbxQ7rYRDcliECMDeUiuHnBtp_g', '2025-08-05 15:02:55'),
('cf4ab04d9715e040273ca14b12dcc320f851351d2d798cca328e06686e0d5586', 11, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:13:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjc1OTMsImV4cCI6MTc1NDMzMTE5M30.EJ5OH01ShAnMJ9ZkM9ShQE8lOq1Mx9lTV6cMIEgD64A', '2025-08-04 17:27:23'),
('cf7ced66968a2fc753650e664b40de15e818148ecd0ee838692c5aca31e3d7cb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 00:54:10', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzMzNjUwLCJleHAiOjE3NTQzMzcyNTB9.AvCur8QPMg8RFEp0Kl68a-2JscdrK39PqjcfFtYQ19I', '2025-08-04 18:58:34'),
('d1aa0c8afc3445efcd536570ec8cfb9631625b177c8c5b39d2b86933b4594c32', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 19:57:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc1MDUyLCJleHAiOjE3NTQ1Nzg2NTJ9.mw2jEXZFOgwSGPoIsyKSDhelR2OU8Wdh0SbOdbvt3zE', '2025-08-07 13:58:46'),
('d32c0f712574f26d02f64775ae37f51aa818c18cc0deb632f6765de5240344d5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:03:02', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA2MTgyLCJleHAiOjE3NTQ0MDk3ODJ9.k4H6yCp33z8rAuXFIrbOzQGqT_pIn4Cq3qeH6pyX0GY', '2025-08-05 15:03:05'),
('d4d587da193e48445b2130c92912b33d3da8d78b5f7d4b0c49989d8c381767b0', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 21:36:17', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTE0NTc3LCJleHAiOjE3NjE2MDA5Nzd9.c1ma_k4tBmXmkjZRDv6YEZIavphsObpKdF7WvUvHPVA', '2025-10-26 23:35:42'),
('d56377e41efb34c912541492696219a6512c01bb8ddab6c3cedc80ff5c2dbd01', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 22:13:03', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDY0NzgzLCJleHAiOjE3NTQwNjgzODN9.GCt7PH1zos2Vton2LD3QmUlTTeDEkOBKWrtxbc3Ym0g', '2025-08-01 16:13:51'),
('d6ccd5a804acb23179b42f6820a0fdd903171122c01aae3751c34be0e7c68d92', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:08:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwMTEwLCJleHAiOjE3NTQ1OTM3MTB9.wg9Xb3Z8kOR6K21oKy3meZ5OEFZnk-CH0dzwkITNyUA', '2025-08-07 18:08:38'),
('d900fb1c53d17e69645c8bf51b269a4a52fc07113bcbdf57e4229301fee93df1', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-23 23:46:29', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQxNTg5LCJleHAiOjE3NjEyNDUxODl9.lWYIswjlClVcuNDFN5hCGoZ52Y9ULmg-q2A9Pr9e6b4', NULL),
('dc895511b91c771de0c7627d762e57838487bd03efac2b180362b49467e88c1d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 15:59:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA3OTgxLCJleHAiOjE3NjE0OTQzODF9.rABUL1RyS-jsH_dPEpadDYG-pa_8w_fgEDORASmg9sY', '2025-10-25 15:59:52'),
('dc97d45d88a74a2eaa76af9d6a3abe271a86bd9fb0edf441da3fa4c12ec139e6', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 08:56:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTM1Mzk2LCJleHAiOjE3NTQ1Mzg5OTZ9.JBV9cly46MYEBzAt5-w1Q3liKewfpMWWZEcct-k-QP0', NULL),
('df768302c420189b1c2a1468502eb1d4edde8cd95675477ebddc3e098b158dd5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 00:11:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzUxMDYxLCJleHAiOjE3NjE0Mzc0NjF9.pWnYo2N0gy0gZniCT2o6A9g_KWCZuDCD3HaWxxAbhnQ', '2025-10-25 00:35:49'),
('e1f88a379105277cb412f40e2fd49031f2b81f74a3768938c35b20e9fc8e940d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 22:13:20', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTgzMjAwLCJleHAiOjE3NTQ1ODY4MDB9.HD8i-ESThzUmyY87mRYhWaOsGKWnwsQwjaAEWxw93hE', NULL),
('e1f99663fd4f34f5e4522310a7b7008e3c1be53f61e6f3d0c8fb676c1c154629', 8, '::1', 'PostmanRuntime/7.45.0', '2025-10-16 05:13:05', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTY5OTg1LCJleHAiOjE3NjA1NzM1ODV9.bh-dnJ2xxQcl038KQfJCWI2D1HpmlBYHKlISvvb1lrc', NULL),
('e3a63e499d90b812bf62ec0c5e182c19105b368dcfb39251865c9f5c0145465b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:55:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI3MzI5LCJleHAiOjE3NTQ0MzA5Mjl9.NCIYIK1A81vsC0E0hxpCScm7ss55yVbxpmRGwxfwExQ', '2025-08-05 21:10:50'),
('e4f3321b121773949bf81a9f3766ed2b5184780247e5c0de8dd6845c826ad48b', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 20:25:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjE1OTY3MDEsImV4cCI6MTc2MTY4MzEwMX0.kZx2ptuJ-KSDWltMXACV5LgvSKtF_P4KbqHOrZaIDE4', '2025-10-27 20:32:46'),
('e68c91160572d5e2e31011bccb191ada834b3e9d184746e095f79cc9bb62a004', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 02:09:07', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEwOTQ3LCJleHAiOjE3NTQ1MTQ1NDd9.Vj3sgZjKUzGELQt4YfrCq7VCa3EvD8-hWl483zvmxwQ', '2025-08-06 20:43:38'),
('ecf6e574167164634df22933fbde2caae97c15effdfcec4b666b534dd6993e49', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 03:11:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI4MjYxLCJleHAiOjE3NTQ0MzE4NjF9.LFxlPBOpnLrPBpknebWc3G8v-n2Rc37yDP52z3G5rSk', '2025-08-05 21:15:48'),
('ef36e9d201ae2aefcb26e4c11ef38a2252a61dc6d8c6310d870a63cfd1ebdda7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 05:04:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTY5NDc2LCJleHAiOjE3NjA1NzMwNzZ9.O3k3aJ7Z_s-wILq-GnrLA2T3ZtRnF6GjxERAkkaCS6A', NULL),
('f0275b3bf6fd222a892f562ff109f3e09379b2012fdd29adb4026b577c85e8af', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:48:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIiwibWVkaWNvIl0sImlhdCI6MTc1NDA1OTczNywiZXhwIjoxNzU0MDYzMzM3fQ.RVeCkv6RFKHeEqxn4-UsidANKVVwGZpEwOcyBb_VMN0', '2025-08-01 14:58:25'),
('f1980982ba2b9b661d6d55f7be65176c9517144740fb17a3acbb4939252fb86b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:23:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MjA1LCJleHAiOjE3NTQzMzE4MDV9.PhCZkaJQhfWK0DdeXup-IZYUDvzHch0fPaNMvNrp_xQ', '2025-08-04 17:24:37'),
('f3a4748129b2542a86d75ea83e0c9e6d9c4d41d7dde87550845e2a9eb7e3d339', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:51:27', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ5MDg3LCJleHAiOjE3NjEzMzU0ODd9.7eLRf9XFhjN-VLfMZB6CKH8p2ku_SciT3xthPEEMJyw', '2025-10-23 21:38:15'),
('f53b3803e7637144bc25c300ec6c96ef4663c310dc0701e09039dea29de0db76', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:34:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5Njk3LCJleHAiOjE3NjE0NDYwOTd9.VkO5IxKHoCr5K8xWhRyFaWkt99DBzgiX_nybGAQCaKE', '2025-10-25 02:35:38'),
('f5467c7321f833abcb9164bcd9e42d3e776e1937ba9ccc5b5bfeedba40faad36', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:37:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNTkwMzUsImV4cCI6MTc1NDA2MjYzNX0.EMZ9e4FZAVseb82ZbTcFAONarE9_lQTQ9_ZO-qm7ol0', '2025-08-01 14:38:12'),
('f58587d88458cb18007ac215681c0a68975be529a42032915e935f4c70b0f4ac', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 23:13:38', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDM0MDE4LCJleHAiOjE3NjE1MjA0MTh9.TZVz6yEcUTPW46UX6l0oBMdWgfrThSxPw8V87Zq-15I', NULL),
('f624106850483beaa86d6cd13920ce64ac82a249c9aeab6fbee0084837f9f21e', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:39:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ1MDkxNTksImV4cCI6MTc1NDUxMjc1OX0.TsifnncyPQOlxnP8iSAHCzoBWW7WvAIyvPUZPBYZeH8', '2025-08-06 19:42:28'),
('f7b2c6a61d56087d28e713d6b8cbc15779f59819b9464c6817c21011fb489a24', 8, '::1', 'PostmanRuntime/7.39.1', '2025-08-06 08:28:37', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ3MzE3LCJleHAiOjE3NTQ0NTA5MTd9.-VASuhoUUAzb2y7pJFKA-QFlBgKdMoYENTnXAs1xw28', '2025-08-06 02:30:21'),
('f9be3caf10473c323a4ec0124684c6e76b0f6891c083aa2de1dda2dc7bfe2c45', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 23:10:08', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjE1MjAyMDgsImV4cCI6MTc2MTYwNjYwOH0.wy_vLiqs34qKT-yXvMGzjISIJEFIKwsJvQaLSOgXcjA', '2025-10-26 23:36:10'),
('fbf1b360b54401d5eed4fdbe5a85f9f3f53bfc5c09fe05075ed37ebe7a6f704d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 03:42:37', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjU1NzU3LCJleHAiOjE3NjEzNDIxNTd9.Jhm-g-UmslAPSqTfbyqXsTkP0-F5qnLJi2dGv__3oJs', '2025-10-23 22:50:47'),
('fc427e90dd0d5aab9786954d0daee35c2d86be17eb5791572e448b7dccad93f4', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:44:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ4NjgyLCJleHAiOjE3NjEzMzUwODJ9.sWeMbUmMurP8_S4wMSqfIDSB510QDTEspqIQUNawKhE', '2025-10-23 19:51:15'),
('fc8199996711f9e14693bf44c7fe72875f15b7e97a22357dc24d01cfcb0b459d', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:28:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4NTE4LCJleHAiOjE3NTQzMzIxMTh9.91gaw4CsAmuEJKL1NF3BuUqmB5CZwHGCUPLnyBl4o6g', '2025-08-04 17:30:22'),
('ff36df3deb4ac6717f3cc55670f391498030d6c381febd58ca3650687581c0eb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 00:04:00', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzUwNjQwLCJleHAiOjE3NjE0MzcwNDB9.vsWTEZyi4YC_wQEy0JY-SVSFj5y1MxJOTXt0lTsZSqA', '2025-10-25 00:05:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_specialties`
--

CREATE TABLE `user_specialties` (
  `user_id` int(11) NOT NULL,
  `specialty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `user_specialties`
--

INSERT INTO `user_specialties` (`user_id`, `specialty_id`) VALUES
(11, 1),
(23, 3),
(23, 5),
(23, 7),
(23, 9),
(23, 18);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vital_signs`
--

CREATE TABLE `vital_signs` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `encounter_id` int(11) DEFAULT NULL COMMENT 'Consulta donde se tomaron, si aplica',
  `recorded_at` datetime NOT NULL DEFAULT current_timestamp(),
  `systolic_bp` smallint(6) DEFAULT NULL COMMENT 'Presión arterial sistólica (mmHg)',
  `diastolic_bp` smallint(6) DEFAULT NULL COMMENT 'Presión arterial diastólica (mmHg)',
  `heart_rate` smallint(6) DEFAULT NULL COMMENT 'Frecuencia cardíaca (lpm)',
  `respiratory_rate` smallint(6) DEFAULT NULL COMMENT 'Frecuencia respiratoria (rpm)',
  `temperature` decimal(4,1) DEFAULT NULL COMMENT 'Temperatura (°C)',
  `oxygen_saturation` smallint(6) DEFAULT NULL COMMENT 'Saturación de oxígeno (%)',
  `weight` decimal(5,2) DEFAULT NULL COMMENT 'Peso (kg)',
  `height` decimal(4,2) DEFAULT NULL COMMENT 'Talla (m)',
  `bmi` decimal(4,2) DEFAULT NULL COMMENT 'Índice de Masa Corporal (calculado)',
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registro cronológico de signos vitales';

--
-- Volcado de datos para la tabla `vital_signs`
--

INSERT INTO `vital_signs` (`id`, `medical_record_id`, `encounter_id`, `recorded_at`, `systolic_bp`, `diastolic_bp`, `heart_rate`, `respiratory_rate`, `temperature`, `oxygen_saturation`, `weight`, `height`, `bmi`, `notes`) VALUES
(1, 2, NULL, '2025-10-27 14:11:02', NULL, NULL, NULL, NULL, NULL, NULL, 70.00, NULL, NULL, NULL),
(2, 2, NULL, '2025-10-27 14:11:22', 120, 80, 82, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_appointments_patient` (`patient_id`),
  ADD KEY `fk_appointments_doctor` (`doctor_id`),
  ADD KEY `fk_appointments_specialty` (`specialty_id`),
  ADD KEY `fk_appointments_created_by` (`created_by`);

--
-- Indices de la tabla `appointment_medical_info`
--
ALTER TABLE `appointment_medical_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `appointment_id` (`appointment_id`);

--
-- Indices de la tabla `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `idx_appointment_reminders_scheduled` (`scheduled_for`),
  ADD KEY `idx_appointment_reminders_status` (`status`);

--
-- Indices de la tabla `appointment_status_history`
--
ALTER TABLE `appointment_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_appointment_status_history_changed_at` (`changed_at`);

--
-- Indices de la tabla `billing_accounts`
--
ALTER TABLE `billing_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_account_patient` (`patient_id`),
  ADD KEY `idx_account_payer` (`payer_patient_id`),
  ADD KEY `idx_account_appointment` (`appointment_id`),
  ADD KEY `idx_account_created_by` (`created_by`),
  ADD KEY `idx_account_exchange_rate` (`exchange_rate_id`);

--
-- Indices de la tabla `billing_account_details`
--
ALTER TABLE `billing_account_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_detail_account` (`account_id`),
  ADD KEY `idx_detail_service` (`service_id`);

--
-- Indices de la tabla `cash_register_movements`
--
ALTER TABLE `cash_register_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_movement_session` (`session_id`),
  ADD KEY `idx_movement_payment` (`payment_id`),
  ADD KEY `idx_movement_created_by` (`created_by`);

--
-- Indices de la tabla `cash_register_sessions`
--
ALTER TABLE `cash_register_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session_user` (`user_id`);

--
-- Indices de la tabla `clinical_encounters`
--
ALTER TABLE `clinical_encounters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_encounter_record` (`medical_record_id`),
  ADD KEY `fk_encounter_appointment` (`appointment_id`),
  ADD KEY `fk_encounter_doctor` (`doctor_id`),
  ADD KEY `fk_encounter_specialty` (`specialty_id`);

--
-- Indices de la tabla `daily_exchange_rates`
--
ALTER TABLE `daily_exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_rate_date` (`rate_date`) COMMENT 'Solo puede haber una tasa por día',
  ADD KEY `fk_rate_created_by` (`created_by`);

--
-- Indices de la tabla `diagnoses`
--
ALTER TABLE `diagnoses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_diagnosis_encounter` (`encounter_id`),
  ADD KEY `idx_diagnosis_code` (`diagnosis_code`);

--
-- Indices de la tabla `medical_colleges`
--
ALTER TABLE `medical_colleges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `abbreviation` (`abbreviation`);

--
-- Indices de la tabla `medical_history`
--
ALTER TABLE `medical_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_history_record` (`medical_record_id`),
  ADD KEY `idx_history_type` (`history_type`);

--
-- Indices de la tabla `medical_preferred_schedules`
--
ALTER TABLE `medical_preferred_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_medical_day_start` (`medical_id`,`day_of_week`,`start_time`);

--
-- Indices de la tabla `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_patient_record` (`patient_id`),
  ADD UNIQUE KEY `record_number` (`record_number`);

--
-- Indices de la tabla `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_report_record` (`medical_record_id`),
  ADD KEY `fk_report_encounter` (`encounter_id`),
  ADD KEY `fk_report_doctor` (`doctor_id`),
  ADD KEY `idx_report_type` (`report_type`),
  ADD KEY `idx_report_date` (`report_date`);

--
-- Indices de la tabla `medical_specialties`
--
ALTER TABLE `medical_specialties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment_account` (`account_id`),
  ADD KEY `idx_payment_registered_by` (`registered_by`),
  ADD KEY `idx_payment_verified_by` (`verified_by`),
  ADD KEY `idx_payment_exchange_rate` (`exchange_rate_id`);

--
-- Indices de la tabla `payment_receipts`
--
ALTER TABLE `payment_receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_receipt_number` (`receipt_number`),
  ADD KEY `idx_receipt_account` (`account_id`),
  ADD KEY `idx_receipt_payment` (`payment_id`),
  ADD KEY `idx_receipt_issued_by` (`issued_by`);

--
-- Indices de la tabla `physical_exams`
--
ALTER TABLE `physical_exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_exam_encounter` (`encounter_id`);

--
-- Indices de la tabla `progress_notes`
--
ALTER TABLE `progress_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_note_encounter` (`encounter_id`),
  ADD KEY `fk_note_author` (`created_by`);

--
-- Indices de la tabla `record_attachments`
--
ALTER TABLE `record_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attachment_record` (`medical_record_id`),
  ADD KEY `fk_attachment_encounter` (`encounter_id`),
  ADD KEY `fk_attachment_uploader` (`uploaded_by`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_services_created_by` (`created_by`);

--
-- Indices de la tabla `treatment_plans`
--
ALTER TABLE `treatment_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_plan_encounter` (`encounter_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_created_by` (`created_by`);

--
-- Indices de la tabla `user_medical_info`
--
ALTER TABLE `user_medical_info`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `fk_medical_college` (`medical_college_id`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indices de la tabla `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `user_specialties`
--
ALTER TABLE `user_specialties`
  ADD PRIMARY KEY (`user_id`,`specialty_id`),
  ADD KEY `specialty_id` (`specialty_id`);

--
-- Indices de la tabla `vital_signs`
--
ALTER TABLE `vital_signs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vitals_record` (`medical_record_id`),
  ADD KEY `fk_vitals_encounter` (`encounter_id`),
  ADD KEY `idx_vitals_recorded_at` (`recorded_at`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `appointment_medical_info`
--
ALTER TABLE `appointment_medical_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `appointment_status_history`
--
ALTER TABLE `appointment_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `billing_accounts`
--
ALTER TABLE `billing_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `billing_account_details`
--
ALTER TABLE `billing_account_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cash_register_movements`
--
ALTER TABLE `cash_register_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cash_register_sessions`
--
ALTER TABLE `cash_register_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clinical_encounters`
--
ALTER TABLE `clinical_encounters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `daily_exchange_rates`
--
ALTER TABLE `daily_exchange_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `diagnoses`
--
ALTER TABLE `diagnoses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `medical_colleges`
--
ALTER TABLE `medical_colleges`
  MODIFY `id` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `medical_history`
--
ALTER TABLE `medical_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `medical_preferred_schedules`
--
ALTER TABLE `medical_preferred_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `medical_reports`
--
ALTER TABLE `medical_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `medical_specialties`
--
ALTER TABLE `medical_specialties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `payment_receipts`
--
ALTER TABLE `payment_receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `physical_exams`
--
ALTER TABLE `physical_exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `progress_notes`
--
ALTER TABLE `progress_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `record_attachments`
--
ALTER TABLE `record_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `treatment_plans`
--
ALTER TABLE `treatment_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `vital_signs`
--
ALTER TABLE `vital_signs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appointments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_appointments_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `medical_specialties` (`id`);

--
-- Filtros para la tabla `appointment_medical_info`
--
ALTER TABLE `appointment_medical_info`
  ADD CONSTRAINT `appointment_medical_info_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  ADD CONSTRAINT `appointment_reminders_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `appointment_status_history`
--
ALTER TABLE `appointment_status_history`
  ADD CONSTRAINT `appointment_status_history_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointment_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `billing_accounts`
--
ALTER TABLE `billing_accounts`
  ADD CONSTRAINT `fk_account_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_account_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_account_exchange_rate` FOREIGN KEY (`exchange_rate_id`) REFERENCES `daily_exchange_rates` (`id`),
  ADD CONSTRAINT `fk_account_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_account_payer` FOREIGN KEY (`payer_patient_id`) REFERENCES `patients` (`id`);

--
-- Filtros para la tabla `billing_account_details`
--
ALTER TABLE `billing_account_details`
  ADD CONSTRAINT `fk_detail_account` FOREIGN KEY (`account_id`) REFERENCES `billing_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_detail_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Filtros para la tabla `cash_register_movements`
--
ALTER TABLE `cash_register_movements`
  ADD CONSTRAINT `fk_movement_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_movement_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_movement_session` FOREIGN KEY (`session_id`) REFERENCES `cash_register_sessions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cash_register_sessions`
--
ALTER TABLE `cash_register_sessions`
  ADD CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `clinical_encounters`
--
ALTER TABLE `clinical_encounters`
  ADD CONSTRAINT `fk_encounter_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_encounter_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_encounter_record` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_encounter_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `medical_specialties` (`id`);

--
-- Filtros para la tabla `daily_exchange_rates`
--
ALTER TABLE `daily_exchange_rates`
  ADD CONSTRAINT `fk_rate_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `diagnoses`
--
ALTER TABLE `diagnoses`
  ADD CONSTRAINT `fk_diagnosis_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `clinical_encounters` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medical_history`
--
ALTER TABLE `medical_history`
  ADD CONSTRAINT `fk_history_record` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medical_preferred_schedules`
--
ALTER TABLE `medical_preferred_schedules`
  ADD CONSTRAINT `fk_preferred_schedule_medical` FOREIGN KEY (`medical_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `fk_record_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD CONSTRAINT `fk_report_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_report_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `clinical_encounters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_report_record` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_account` FOREIGN KEY (`account_id`) REFERENCES `billing_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_exchange_rate` FOREIGN KEY (`exchange_rate_id`) REFERENCES `daily_exchange_rates` (`id`),
  ADD CONSTRAINT `fk_payment_registered_by` FOREIGN KEY (`registered_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_payment_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `payment_receipts`
--
ALTER TABLE `payment_receipts`
  ADD CONSTRAINT `fk_receipt_account` FOREIGN KEY (`account_id`) REFERENCES `billing_accounts` (`id`),
  ADD CONSTRAINT `fk_receipt_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_receipt_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `physical_exams`
--
ALTER TABLE `physical_exams`
  ADD CONSTRAINT `fk_exam_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `clinical_encounters` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `progress_notes`
--
ALTER TABLE `progress_notes`
  ADD CONSTRAINT `fk_note_author` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_note_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `clinical_encounters` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `record_attachments`
--
ALTER TABLE `record_attachments`
  ADD CONSTRAINT `fk_attachment_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `clinical_encounters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attachment_record` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attachment_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `fk_services_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `treatment_plans`
--
ALTER TABLE `treatment_plans`
  ADD CONSTRAINT `fk_plan_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `clinical_encounters` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_medical_info`
--
ALTER TABLE `user_medical_info`
  ADD CONSTRAINT `fk_medical_college` FOREIGN KEY (`medical_college_id`) REFERENCES `medical_colleges` (`id`),
  ADD CONSTRAINT `user_medical_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_specialties`
--
ALTER TABLE `user_specialties`
  ADD CONSTRAINT `user_specialties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_specialties_ibfk_2` FOREIGN KEY (`specialty_id`) REFERENCES `medical_specialties` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `vital_signs`
--
ALTER TABLE `vital_signs`
  ADD CONSTRAINT `fk_vitals_encounter` FOREIGN KEY (`encounter_id`) REFERENCES `clinical_encounters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vitals_record` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
