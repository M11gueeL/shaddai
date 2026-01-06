-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-01-2026 a las 23:37:28
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
(1, 8, 11, '2025-11-10', '14:30:00', 2, 1, 30, 'completada', 'primera_vez', 8, '2025-10-23 15:00:33', '2025-12-21 17:23:07'),
(2, 2, 8, '2025-11-10', '14:30:00', 1, 3, 30, 'cancelada', 'emergencia', 8, '2025-10-23 15:10:20', '2025-10-24 21:44:03'),
(4, 7, 23, '2025-11-10', '17:35:00', 1, 3, 30, 'completada', 'primera_vez', 8, '2025-10-23 17:49:37', '2025-11-14 13:26:16'),
(5, 8, 8, '2025-11-10', '16:35:00', 1, 3, 30, 'cancelada', 'primera_vez', 8, '2025-10-23 17:50:00', '2025-11-11 00:45:07'),
(8, 8, 11, '2025-10-24', '20:27:00', 2, 1, 30, 'completada', 'primera_vez', 8, '2025-10-24 22:27:21', '2025-12-21 17:22:41'),
(9, 9, 11, '2025-10-25', '18:08:00', 1, 1, 30, 'no_se_presento', 'control', 8, '2025-10-25 21:09:09', '2025-12-21 17:24:08'),
(10, 11, 23, '2025-10-25', '18:44:00', 2, 7, 30, 'cancelada', 'primera_vez', 8, '2025-10-25 21:29:32', '2025-10-25 21:30:27'),
(11, 8, 11, '2025-10-25', '17:31:00', 2, 1, 30, 'completada', 'primera_vez', 8, '2025-10-25 21:31:18', '2025-10-25 21:31:40'),
(12, 8, 11, '2025-11-01', '08:00:00', 1, 1, 30, 'completada', 'primera_vez', 8, '2025-10-26 01:43:53', '2025-12-21 17:23:47'),
(13, 13, 11, '2025-11-21', '08:30:00', 2, 1, 30, 'cancelada', 'primera_vez', 8, '2025-11-19 21:58:14', '2025-12-21 17:21:27'),
(14, 10, 11, '2025-11-22', '08:00:00', 3, 1, 30, 'completada', 'primera_vez', 8, '2025-11-21 02:57:02', '2025-11-22 13:54:05'),
(15, 14, 23, '2025-11-29', '08:30:00', 2, 7, 30, 'cancelada', 'control', 8, '2025-11-28 01:21:36', '2025-11-28 01:22:12'),
(16, 10, 11, '2025-12-13', '08:30:00', 1, 1, 30, 'completada', 'primera_vez', 8, '2025-12-12 02:11:57', '2025-12-21 17:14:07'),
(17, 8, 23, '2025-12-21', '11:03:00', 2, 7, 15, 'completada', 'control', 8, '2025-12-21 14:18:58', '2025-12-21 17:23:28'),
(18, 10, 11, '2025-12-22', '08:15:00', 3, 1, 30, 'cancelada', 'primera_vez', 8, '2025-12-21 20:43:01', '2025-12-21 20:59:33'),
(19, 13, 11, '2025-12-21', '17:06:00', 1, 1, 15, 'completada', 'primera_vez', 8, '2025-12-21 21:06:21', '2025-12-21 22:50:57'),
(20, 10, 29, '2025-12-21', '18:06:00', 1, 25, 30, 'completada', 'primera_vez', 8, '2025-12-21 21:06:39', '2025-12-21 22:51:20'),
(21, 9, 23, '2025-12-21', '18:37:00', 3, 2, 15, 'cancelada', 'control', 8, '2025-12-21 21:07:18', '2025-12-21 22:52:22'),
(22, 12, 11, '2025-12-21', '17:38:00', 3, 1, 30, 'completada', 'primera_vez', 8, '2025-12-21 21:08:10', '2025-12-21 22:51:12'),
(23, 7, 11, '2025-12-21', '18:09:00', 2, 1, 60, 'completada', 'primera_vez', 8, '2025-12-21 21:09:22', '2025-12-23 15:15:53'),
(24, 11, 29, '2025-12-21', '17:12:00', 2, 25, 15, 'completada', 'primera_vez', 8, '2025-12-21 21:12:10', '2025-12-21 22:51:05'),
(30, 13, 23, '2025-12-23', '08:30:00', 1, 4, 30, 'cancelada', 'primera_vez', 8, '2025-12-21 23:31:17', '2025-12-23 15:13:37'),
(31, 8, 11, '2026-01-02', '21:11:00', 1, 1, 30, 'programada', 'primera_vez', 8, '2026-01-02 23:42:08', '2026-01-02 23:42:08'),
(32, 10, 11, '2026-01-02', '20:12:00', 1, 1, 30, 'programada', 'primera_vez', 8, '2026-01-02 23:42:55', '2026-01-02 23:42:55');

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
(10, 11, '', '', '', '2025-10-25 21:31:42', '2025-10-25 21:31:42'),
(11, 13, '', '', '', '2025-11-19 22:11:14', '2025-11-19 22:11:14'),
(12, 14, '', '', '', '2025-11-22 01:16:08', '2025-11-22 01:16:08'),
(13, 15, '', '', '', '2025-11-28 01:22:12', '2025-11-28 01:22:12'),
(14, 16, '', '', '', '2025-12-21 17:20:56', '2025-12-21 17:20:56'),
(15, 17, '', '', '', '2025-12-21 17:23:29', '2025-12-21 17:23:29'),
(16, 12, '', '', '', '2025-12-21 17:23:49', '2025-12-21 17:23:49'),
(17, 18, '', '', '', '2025-12-21 20:43:20', '2025-12-21 20:43:20'),
(18, 19, '', '', '', '2025-12-21 22:50:58', '2025-12-21 22:50:58'),
(19, 24, '', '', '', '2025-12-21 22:51:07', '2025-12-21 22:51:07'),
(20, 22, '', '', '', '2025-12-21 22:51:14', '2025-12-21 22:51:14'),
(21, 20, '', '', '', '2025-12-21 22:51:22', '2025-12-21 22:51:22'),
(22, 23, '', '', '', '2025-12-21 22:51:29', '2025-12-21 22:51:29'),
(23, 21, '', '', '', '2025-12-21 22:52:23', '2025-12-21 22:52:23'),
(24, 30, '', '', '', '2025-12-23 15:13:38', '2025-12-23 15:13:38'),
(25, 31, 'asd', '', '', '2026-01-02 23:42:08', '2026-01-02 23:42:08');

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
(4, 11, 'programada', 'completada', 8, NULL, '2025-10-25 21:31:40'),
(5, 4, 'no_se_presento', 'cancelada', 8, NULL, '2025-11-10 19:04:01'),
(6, 5, 'programada', 'cancelada', 8, NULL, '2025-11-11 00:45:07'),
(7, 4, 'cancelada', 'completada', 8, NULL, '2025-11-14 13:26:16'),
(8, 13, 'programada', 'cancelada', 8, NULL, '2025-11-22 01:06:23'),
(9, 13, 'cancelada', 'completada', 24, NULL, '2025-11-22 01:11:55'),
(10, 13, 'completada', 'cancelada', 24, NULL, '2025-11-22 01:12:10'),
(11, 13, 'cancelada', 'completada', 24, NULL, '2025-11-22 01:12:14'),
(12, 13, 'completada', 'en_progreso', 24, NULL, '2025-11-22 01:12:16'),
(13, 13, 'en_progreso', 'confirmada', 24, NULL, '2025-11-22 01:12:17'),
(14, 13, 'confirmada', 'en_progreso', 8, NULL, '2025-11-22 01:13:48'),
(15, 13, 'en_progreso', 'confirmada', 8, NULL, '2025-11-22 01:13:53'),
(16, 13, 'confirmada', 'en_progreso', 8, NULL, '2025-11-22 01:13:54'),
(17, 13, 'en_progreso', 'completada', 8, NULL, '2025-11-22 01:13:58'),
(18, 13, 'completada', 'cancelada', 8, NULL, '2025-11-22 01:14:00'),
(19, 13, 'cancelada', 'completada', 8, NULL, '2025-11-22 01:14:03'),
(20, 13, 'completada', 'cancelada', 8, NULL, '2025-11-22 01:14:04'),
(21, 14, 'cancelada', 'en_progreso', 8, NULL, '2025-11-22 01:16:45'),
(22, 14, 'en_progreso', 'confirmada', 8, NULL, '2025-11-22 13:54:02'),
(23, 14, 'confirmada', 'completada', 8, NULL, '2025-11-22 13:54:05'),
(24, 16, 'programada', 'confirmada', 8, NULL, '2025-12-21 17:14:02'),
(25, 16, 'confirmada', 'completada', 8, NULL, '2025-12-21 17:14:07'),
(26, 13, 'programada', 'cancelada', 8, NULL, '2025-12-21 17:21:27'),
(27, 8, 'programada', 'completada', 8, NULL, '2025-12-21 17:22:41'),
(28, 1, 'confirmada', 'completada', 8, NULL, '2025-12-21 17:23:07'),
(29, 17, 'programada', 'confirmada', 8, NULL, '2025-12-21 17:23:25'),
(30, 17, 'confirmada', 'completada', 8, NULL, '2025-12-21 17:23:28'),
(31, 12, 'programada', 'completada', 8, NULL, '2025-12-21 17:23:47'),
(32, 18, 'programada', 'confirmada', 8, NULL, '2025-12-21 20:43:19'),
(33, 18, 'confirmada', 'cancelada', 8, NULL, '2025-12-21 20:59:33'),
(34, 19, 'programada', 'confirmada', 8, NULL, '2025-12-21 22:50:55'),
(35, 19, 'confirmada', 'completada', 8, NULL, '2025-12-21 22:50:57'),
(36, 24, 'programada', 'completada', 8, NULL, '2025-12-21 22:51:05'),
(37, 22, 'programada', 'completada', 8, NULL, '2025-12-21 22:51:12'),
(38, 20, 'programada', 'completada', 8, NULL, '2025-12-21 22:51:20'),
(39, 23, 'programada', 'en_progreso', 8, NULL, '2025-12-21 22:51:27'),
(40, 21, 'programada', 'completada', 8, NULL, '2025-12-21 22:52:19'),
(41, 21, 'completada', 'cancelada', 8, NULL, '2025-12-21 22:52:22'),
(42, 30, 'programada', 'cancelada', 8, NULL, '2025-12-23 15:13:37'),
(43, 23, 'en_progreso', 'confirmada', 8, NULL, '2025-12-23 15:15:49'),
(44, 23, 'confirmada', 'completada', 8, NULL, '2025-12-23 15:15:53');

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

--
-- Volcado de datos para la tabla `billing_accounts`
--

INSERT INTO `billing_accounts` (`id`, `patient_id`, `payer_patient_id`, `appointment_id`, `status`, `total_usd`, `total_bs`, `exchange_rate_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 8, 11, NULL, 'paid', 40.00, 12326.00, 1, 8, '2026-01-06 22:08:55', '2026-01-06 22:09:10');

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

--
-- Volcado de datos para la tabla `billing_account_details`
--

INSERT INTO `billing_account_details` (`id`, `account_id`, `service_id`, `description`, `quantity`, `price_usd`, `price_bs`) VALUES
(1, 1, 1, 'Consulta ORL', 1, 40.00, 12326.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `billing_account_supplies`
--

CREATE TABLE `billing_account_supplies` (
  `id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL COMMENT 'FK a billing_accounts',
  `item_id` int(11) NOT NULL COMMENT 'FK a inventory_items',
  `description` varchar(255) NOT NULL COMMENT 'Nombre copiado del insumo al momento de la carga',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Cantidad facturada',
  `price_usd` decimal(10,2) NOT NULL COMMENT 'Precio unitario USD al momento de la carga',
  `total_price_usd` decimal(10,2) NOT NULL COMMENT 'quantity * price_usd (cache para facilitar cálculos)',
  `price_bs` decimal(12,2) NOT NULL COMMENT 'Precio unitario en Bs al momento de la carga',
  `total_price_bs` decimal(12,2) NOT NULL COMMENT 'quantity * price_bs',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Insumos cargados a la cuenta del paciente';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cash_register_movements`
--

CREATE TABLE `cash_register_movements` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL COMMENT 'Sesión de caja afectada (FK a cash_register_sessions.id)',
  `payment_id` int(11) DEFAULT NULL COMMENT 'Pago que origina el ingreso (FK a payments.id)',
  `movement_type` enum('payment_in','expense_out','adjustment_in','adjustment_out','initial_balance','reversal') NOT NULL,
  `amount` decimal(12,2) NOT NULL COMMENT 'Monto del movimiento',
  `currency` enum('USD','BS') NOT NULL,
  `description` varchar(255) NOT NULL COMMENT 'Ej: Pago cuenta 123, Gasto papelería, Ajuste sobrante',
  `created_by` int(11) NOT NULL COMMENT 'Usuario que registra el movimiento (FK a users.id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Movimientos de efectivo (entradas/salidas) en una sesión';

--
-- Volcado de datos para la tabla `cash_register_movements`
--

INSERT INTO `cash_register_movements` (`id`, `session_id`, `payment_id`, `movement_type`, `amount`, `currency`, `description`, `created_by`, `created_at`) VALUES
(1, 1, 1, 'payment_in', 40.00, 'USD', 'Pago cuenta #1', 8, '2026-01-06 22:09:10');

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

--
-- Volcado de datos para la tabla `cash_register_sessions`
--

INSERT INTO `cash_register_sessions` (`id`, `user_id`, `start_time`, `end_time`, `start_balance_usd`, `start_balance_bs`, `calculated_end_balance_usd`, `real_end_balance_usd`, `calculated_end_balance_bs`, `real_end_balance_bs`, `status`, `notes`) VALUES
(1, 8, '2026-01-06 18:08:40', NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, 'open', NULL);

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
(7, 2, NULL, 11, 1, '2025-10-27 14:35:49', 'Primera vez', 'asdasd', 'asdasdasd', '2025-10-27 18:35:49', '2025-10-27 18:35:49'),
(8, 2, NULL, 11, 1, '2025-11-27 21:30:27', 'Emergencia', 'motivo de ejemplo', 'aqui el medico puede describir brevemente la enfermedad actual del paciente', '2025-11-28 01:30:27', '2025-11-28 01:30:27'),
(9, 2, NULL, 11, 1, '2025-12-31 19:21:21', 'Control', 'prueba', '', '2025-12-31 23:21:21', '2025-12-31 23:21:21'),
(10, 2, NULL, 11, 1, '2025-12-31 20:12:25', 'Consulta', 'asdas', 'sdas', '2026-01-01 00:12:25', '2026-01-01 00:12:25'),
(11, 2, NULL, 11, 1, '2025-12-31 20:24:16', 'Consulta', 'adas', 'asd', '2026-01-01 00:24:16', '2026-01-01 00:24:16'),
(12, 2, NULL, 11, 1, '2026-01-02 15:58:09', 'Consulta', 'asd', 'asd', '2026-01-02 19:58:09', '2026-01-02 19:58:09'),
(13, 2, NULL, 11, 1, '2026-01-02 19:24:31', 'Emergencia', 'ejemplo', 'dasas', '2026-01-02 23:24:31', '2026-01-02 23:24:31');

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

--
-- Volcado de datos para la tabla `daily_exchange_rates`
--

INSERT INTO `daily_exchange_rates` (`id`, `rate_date`, `rate_bcv`, `created_by`, `created_at`) VALUES
(1, '2026-01-06', 308.1500, 8, '2026-01-06 22:08:33');

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

--
-- Volcado de datos para la tabla `diagnoses`
--

INSERT INTO `diagnoses` (`id`, `encounter_id`, `diagnosis_code`, `diagnosis_description`, `diagnosis_type`, `notes`, `recorded_at`) VALUES
(1, 8, NULL, 'otitis media', 'principal', '', '2025-11-27 21:30:47'),
(2, 9, NULL, 'asd', 'principal', '', '2025-12-31 19:24:25'),
(3, 9, NULL, 'asdadasd', 'secundario', '', '2025-12-31 19:24:28'),
(4, 9, NULL, 'asdasd', 'secundario', '', '2025-12-31 19:24:34'),
(5, 6, NULL, 'asdads', 'principal', 'asd', '2025-12-31 20:26:36'),
(6, 11, NULL, 'asdads', 'principal', '', '2026-01-02 15:57:54'),
(7, 12, NULL, 'adads', 'principal', '', '2026-01-02 16:02:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_batches`
--

CREATE TABLE `inventory_batches` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `batch_number` varchar(50) DEFAULT NULL COMMENT 'Código de lote del fabricante',
  `quantity` int(11) NOT NULL DEFAULT 0 COMMENT 'Cantidad restante en este lote',
  `initial_quantity` int(11) NOT NULL DEFAULT 0 COMMENT 'Cantidad original al crear el lote',
  `expiration_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','empty','disposed','suspended') NOT NULL DEFAULT 'active',
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `inventory_batches`
--

INSERT INTO `inventory_batches` (`id`, `item_id`, `batch_number`, `quantity`, `initial_quantity`, `expiration_date`, `created_at`, `status`, `updated_at`) VALUES
(3, 13, 'L-2025-12-27', 10, 10, '2026-09-24', '2025-12-28 02:41:08', 'active', NULL),
(4, 13, 'l-2025-03-19', 12, 22, '2026-04-11', '2025-12-28 02:41:32', 'active', '2026-01-06 20:59:44');

--
-- Disparadores `inventory_batches`
--
DELIMITER $$
CREATE TRIGGER `after_batch_delete` AFTER DELETE ON `inventory_batches` FOR EACH ROW BEGIN
        UPDATE inventory_items 
        SET stock_quantity = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM inventory_batches
            WHERE item_id = OLD.item_id 
            AND status = 'active'
        )
        WHERE id = OLD.item_id;
    END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_batch_insert` AFTER INSERT ON `inventory_batches` FOR EACH ROW BEGIN
        UPDATE inventory_items 
        SET stock_quantity = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM inventory_batches
            WHERE item_id = NEW.item_id 
            AND status = 'active'
        )
        WHERE id = NEW.item_id;
    END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_batch_update` AFTER UPDATE ON `inventory_batches` FOR EACH ROW BEGIN
        -- Actualizar item del nuevo estado
        UPDATE inventory_items 
        SET stock_quantity = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM inventory_batches
            WHERE item_id = NEW.item_id 
            AND status = 'active'
        )
        WHERE id = NEW.item_id;

        -- Si por alguna razón cambia el item_id, actualizar el anterior también
        IF OLD.item_id <> NEW.item_id THEN
            UPDATE inventory_items 
            SET stock_quantity = (
                SELECT COALESCE(SUM(quantity), 0)
                FROM inventory_batches
                WHERE item_id = OLD.item_id 
                AND status = 'active'
            )
            WHERE id = OLD.item_id;
        END IF;
    END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_brands`
--

CREATE TABLE `inventory_brands` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventory_brands`
--

INSERT INTO `inventory_brands` (`id`, `name`, `description`, `is_active`, `is_deleted`, `created_at`, `updated_at`) VALUES
(1, 'Genérico', 'Marca por defecto para insumos sin laboratorio específico', 1, 0, '2025-12-27 22:59:09', '2025-12-27 22:59:09'),
(2, 'La Santé', '', 1, 0, '2025-12-27 23:06:38', '2025-12-27 23:06:38'),
(3, 'Genven', '', 1, 0, '2025-12-27 23:10:12', '2025-12-27 23:10:12'),
(4, 'Calox', '', 1, 0, '2025-12-27 23:58:36', '2025-12-27 23:58:36'),
(5, 'Pharmetique LABS', '', 1, 0, '2025-12-27 23:59:49', '2025-12-27 23:59:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL COMMENT 'Código interno o SKU',
  `name` varchar(255) NOT NULL COMMENT 'Nombre del insumo (ej. Guantes Latex M)',
  `brand_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0 COMMENT 'Cantidad actual en existencia',
  `unit_of_measure` varchar(50) NOT NULL DEFAULT 'unidad' COMMENT 'ej. unidad, ml, caja, par',
  `reorder_level` int(11) DEFAULT 5 COMMENT 'Nivel mínimo para alerta de stock bajo',
  `price_usd` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio de venta al público en USD',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Catálogo de insumos médicos';

--
-- Volcado de datos para la tabla `inventory_items`
--

INSERT INTO `inventory_items` (`id`, `code`, `name`, `brand_id`, `description`, `stock_quantity`, `unit_of_measure`, `reorder_level`, `price_usd`, `is_active`, `is_deleted`, `created_at`, `updated_at`) VALUES
(12, 'SOL-001', 'Solución Fisiológica 0.9%', 1, '', 0, 'frasco 250ml', 5, 2.50, 0, 1, '2025-12-27 19:39:58', '2025-12-28 00:14:09'),
(13, 'DCP-LST', 'Diclofenac Potásico 50mg', 2, '', 22, 'Blíster ', 1, 1.25, 1, 0, '2025-12-27 23:08:28', '2026-01-06 20:59:44'),
(14, 'M01AB05', 'Diclofenac Potásico 50mg', 3, '', 0, 'Blíster ', 5, 0.85, 1, 0, '2025-12-27 23:10:43', '2025-12-27 23:10:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL COMMENT 'FK a inventory_items',
  `movement_type` enum('in_restock','in_adjustment','out_adjustment','out_expired','out_damaged','out_internal_use','out_billed') NOT NULL COMMENT 'Tipo de movimiento',
  `quantity` int(11) NOT NULL COMMENT 'Cantidad positiva siempre, el tipo define si suma o resta',
  `notes` varchar(255) DEFAULT NULL COMMENT 'Motivo del ajuste',
  `created_by` int(11) NOT NULL COMMENT 'Usuario que realizó el movimiento',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `batch_id` int(11) DEFAULT NULL COMMENT 'Lote afectado, si aplica'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Historial de entradas y salidas manuales de stock';

--
-- Volcado de datos para la tabla `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `item_id`, `movement_type`, `quantity`, `notes`, `created_by`, `created_at`, `batch_id`) VALUES
(6, 13, 'in_restock', 10, 'Entrada Lote: L-2025-12-27', 8, '2025-12-28 02:41:08', 3),
(7, 13, 'in_restock', 20, 'Entrada Lote: l-2025-03-19', 8, '2025-12-28 02:41:32', 4),
(8, 13, 'in_adjustment', 2, 'AJUSTE Lote: l-2025-03-19. Razón: a', 8, '2025-12-28 02:42:06', 4),
(9, 13, 'out_adjustment', 1, 'AJUSTE Lote: l-2025-03-19. Razón: a', 8, '2025-12-28 02:44:02', 4),
(10, 13, 'out_adjustment', 10, 'Lote suspendido/desactivado: L-2025-12-27', 8, '2025-12-28 02:46:12', 3),
(11, 13, 'in_adjustment', 10, 'Lote reactivado: L-2025-12-27', 8, '2025-12-28 02:50:17', 3),
(12, 13, 'out_adjustment', 21, 'Lote suspendido/desactivado: l-2025-03-19', 8, '2025-12-28 21:45:24', 4),
(13, 13, 'in_adjustment', 21, 'Lote reactivado: l-2025-03-19', 8, '2025-12-28 21:45:39', 4),
(14, 13, 'out_expired', 1, 'AJUSTE Lote: l-2025-03-19. Razón: q', 8, '2025-12-28 22:22:10', 4),
(15, 13, 'out_billed', 1, 'Consumo facturado en cuenta #21 (Del Lote: l-2025-03-19)', 8, '2025-12-29 00:24:40', 4),
(16, 13, 'out_internal_use', 1, 'prueba de uso interno (Del Lote: l-2025-03-19)', 8, '2025-12-29 02:44:25', 4),
(17, 13, 'out_billed', 2, 'Consumo facturado en cuenta #22 (Del Lote: l-2025-03-19)', 8, '2025-12-29 02:45:51', 4),
(18, 13, 'in_adjustment', 1, 'AJUSTE Lote: l-2025-03-19. Razón: a', 8, '2025-12-29 03:07:56', 4),
(19, 13, 'out_adjustment', 1, 'AJUSTE Lote: l-2025-03-19. Razón: a', 8, '2025-12-29 03:08:03', 4),
(20, 13, 'out_billed', 1, 'Consumo facturado en cuenta #23 (Del Lote: l-2025-03-19)', 8, '2026-01-05 22:32:54', 4),
(21, 13, 'out_billed', 2, 'Consumo facturado en cuenta #24 (Del Lote: l-2025-03-19)', 8, '2026-01-06 00:09:42', 4),
(22, 13, 'out_billed', 1, 'Consumo facturado en cuenta #25 (Del Lote: l-2025-03-19)', 8, '2026-01-06 20:59:44', 4);

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
(1, 1, '', 'dadasdasdsadasd', '2024-02-22', '2025-10-26 21:54:39', '2025-10-26 21:54:39'),
(10, 2, 'personal_non_pathological', 'asdasdd', '0000-00-00', '2026-01-02 20:17:34', '2026-01-02 20:23:53'),
(11, 2, 'surgical', 'asdasdasd', '0000-00-00', '2026-01-02 20:17:40', '2026-01-02 20:17:40'),
(13, 2, 'medications', 'asdasd', '0000-00-00', '2026-01-02 20:17:53', '2026-01-02 20:17:53'),
(14, 2, 'allergies', 'asda', '0000-00-00', '2026-01-02 20:17:59', '2026-01-02 20:17:59'),
(15, 2, 'family', 'asdasd', '0000-00-00', '2026-01-02 20:18:04', '2026-01-02 20:18:04'),
(16, 2, 'gynecological', 'asdadsdasd', '2026-01-02', '2026-01-02 20:18:11', '2026-01-02 22:51:30');

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
(2, 11, 2, '10:30:00', '18:50:00', 'Consultas generales', '2025-10-26 00:55:53', '2025-10-26 01:31:02'),
(4, 11, 3, '08:00:00', '14:30:00', 'Solo urgencias', '2025-12-06 02:07:16', '2025-12-06 02:08:51'),
(5, 23, 3, '08:00:00', '18:00:00', 'Consultar antesasd', '2025-12-06 02:08:19', '2025-12-21 03:38:15'),
(6, 11, 2, '09:57:00', '17:57:00', NULL, '2025-12-21 03:57:32', '2025-12-21 03:57:32');

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
(2, 13, NULL, '2025-10-26 23:23:30', '2025-10-26 23:23:30'),
(3, 10, NULL, '2025-11-28 01:28:07', '2025-11-28 01:28:07');

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
(9, 2, NULL, 8, '2025-10-27', 'Referencia', NULL, '<h3>sadasasddasdasd</h3><p><br></p><p><br></p><p>dasdasdasdasd</p><p><br></p><p><br></p><h1>asddsdasdasdasdasdASDASasdadasasasdad</h1><p>ASDASDASDSA<em>adasdasd</em>dasd</p><p>asdads</p><p><br></p>', '', '2025-10-27 20:17:04', '2025-12-31 19:58:18'),
(11, 2, NULL, 11, '2025-10-27', 'Informe médico', NULL, '<p>sdadadsaddaasd</p><p><br></p><p>asd</p><p>asd</p><p>asd</p><p>as</p><p>das</p><p>d</p><p>asd</p><p>ad</p><p>as</p><p>dasdasdsad</p><p><br></p>', '', '2025-10-27 20:32:25', '2025-11-22 01:20:22'),
(12, 2, NULL, 8, '2025-11-27', 'Informe médico', NULL, '<p>aqui el medico puede redactar el informe medico del paciente, como tambien puede redactar un reposio o constancia.... </p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>', '', '2025-11-28 01:32:28', '2025-12-31 20:05:25'),
(13, 2, NULL, 8, '2025-12-31', 'Informe médico', NULL, '<p>de prueba</p>', 'draft', '2025-12-31 20:07:55', '2025-12-31 20:18:27'),
(14, 2, NULL, 8, '2025-12-31', 'Informe médico', NULL, '<p>otra prueba</p>', 'finalized', '2025-12-31 20:12:02', '2025-12-31 20:18:14'),
(15, 2, NULL, 8, '2026-01-02', 'Informe médico', NULL, '<p>adasd</p>', 'finalized', '2026-01-02 20:08:30', '2026-01-02 20:08:30'),
(16, 2, NULL, 8, '2026-01-02', 'Informe médico', NULL, '<p>adasdadsadasd</p>', 'finalized', '2026-01-02 20:08:52', '2026-01-02 20:08:52');

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

--
-- Volcado de datos para la tabla `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(7, 8, 'a784317785570c15e0d8bd071a3a827bc9e0297619e2fd5ec6d942f7dc93303a', '2025-11-09 14:06:35', '2025-11-09 17:06:35'),
(8, 24, 'a3fe4d6a76bb11fc1d20adb66513b3ec68e819f852634544d10d84b63785c4a4', '2025-11-20 21:57:55', '2025-11-21 00:57:55'),
(11, 8, 'f2c2ea757cc437721f903600a78f2891d38de4c1f9a0b779ad98a7fdd8f231d1', '2025-12-02 15:30:17', '2025-12-02 18:30:17'),
(12, 24, '2e60217ad7022677447c0a50809b4b2bd207790ea6ea7a235d59450b27d8eab8', '2025-12-02 15:34:33', '2025-12-02 18:34:33'),
(14, 24, '646678fbf35a58a6701b49cc51bb7eea40d0d0ba6438fe343b18907f4b58e2b5', '2025-12-21 20:29:12', '2025-12-21 23:29:12'),
(15, 24, 'dfb8755b4d0b2d25f574581f6743cdfbdd37676535dd4faaf523614990f72150', '2025-12-21 20:34:02', '2025-12-21 23:34:02'),
(16, 24, '8d385b4cad5f35ffb1fdd324f634bb02b052c36145206c539c429e801b5a8aa7', '2025-12-21 20:37:00', '2025-12-21 23:37:00'),
(18, 8, '559ce074d469d4e33d5411b7522738763f8709bdc92f0830ebd1fd006530edd4', '2026-01-02 22:15:13', '2026-01-03 01:15:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `full_name` varchar(128) NOT NULL,
  `cedula` varchar(20) NOT NULL,
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
(2, 'Juan Pérez', 'V-34567123', '1980-12-04', 'Masculino', 'Casado', 'Santa Ritaaaaasd', '04161234567', 'email@email.com', '2025-07-28 23:09:31', '2025-12-21 15:12:43', NULL),
(7, 'Emilio Andrade', '12234234', '1980-12-04', 'Masculino', 'Divorciado', 'Santa Rita', '04121234521', 'email@exammple.com', '2025-08-04 00:57:22', '2025-10-25 21:33:40', 8),
(8, 'Lionel Andrés Messi Cuccitini', '26110310', '1989-09-20', 'Masculino', 'Casado', 'Miami', '04129991890', 'leomessi@gmail.com', '2025-10-15 23:43:50', '2025-10-15 23:43:50', 8),
(9, 'Pedro González López  ', '28990123', '2002-11-25', 'Masculino', 'Soltero', 'Barcelona, España', '04241231219', 'pedrigonzalez8@gmail.com', '2025-10-25 21:08:32', '2025-10-25 21:08:32', 8),
(10, 'Lamine Yamal Nasraoui Ebana', '32456123', '2007-07-13', 'Masculino', 'Soltero', 'Barcelona, España', '04161234455', 'lamineyamal10@gmail.com', '2025-10-25 21:13:36', '2025-10-25 21:13:36', 8),
(11, 'Luis Alberto Suarez Díaz', '24312564', '1987-01-24', 'Masculino', 'Casado', 'Miami', '04124561234', 'luis9suarez@gmail.com', '2025-10-25 21:29:05', '2025-10-25 21:29:05', 8),
(12, 'Sergio Busquets', '18990123', '1988-07-16', 'Masculino', 'Divorciado', 'Miami', '04243214561', 'sergiobusquets@gmail.com', '2025-10-25 21:38:35', '2025-10-25 21:38:49', 8),
(13, 'Nacary Monasterio', 'V-10377120', '1969-10-05', 'Femenino', 'Soltero', 'Palo Negro', '04243503887', 'migue11monasterio24@gmail.com', '2025-10-26 23:11:58', '2025-12-31 20:03:27', 8),
(14, 'paciente ejemplo', '12321890', '2003-06-25', 'Masculino', 'Soltero', 'maracay', '04123451234', 'ejemplo@gmail.com', '2025-11-28 01:19:51', '2025-11-28 01:19:51', 8),
(19, 'Iñigo Martinez', 'V-223411', '1991-05-17', 'Masculino', '', '', '', 'inigomartinez@gmail.com', '2025-12-21 14:44:45', '2025-12-21 14:44:45', 8),
(20, 'añasdada', 'V-123312', '2018-02-06', 'Masculino', 'Casado', '', '04221234123', '', '2025-12-21 14:45:15', '2025-12-21 14:45:15', 8),
(21, 'Joaquin Perez', 'E-123452987', '2025-12-04', 'Masculino', 'Soltero', '', '04225671234', 'joaquin@gmail.com', '2025-12-21 15:13:30', '2025-12-21 15:13:30', 8),
(22, 'Jules Kounde', 'E-56789123', '1998-11-12', 'Masculino', 'Soltero', 'Barcelona, España', '04163451234', 'kounde@gmail.com', '2025-12-21 16:18:11', '2025-12-21 16:18:11', 8);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_mime` varchar(100) DEFAULT NULL,
  `attachment_data` longblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Pagos y abonos recibidos por cuentas';

--
-- Volcado de datos para la tabla `payments`
--

INSERT INTO `payments` (`id`, `account_id`, `payment_date`, `payment_method`, `amount`, `currency`, `exchange_rate_id`, `amount_usd_equivalent`, `reference_number`, `attachment_path`, `status`, `notes`, `registered_by`, `verified_by`, `created_at`, `attachment_name`, `attachment_mime`, `attachment_data`) VALUES
(1, 1, '2026-01-06 18:09:10', 'cash_usd', 40.00, 'USD', 1, 40.00, NULL, NULL, 'verified', NULL, 8, NULL, '2026-01-06 22:09:10', NULL, NULL, NULL);

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
  `annulled_reason` varchar(255) DEFAULT NULL,
  `annulled_at` datetime DEFAULT NULL,
  `annulled_by` int(11) DEFAULT NULL,
  `pdf_path` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registro de recibos de pago (no fiscales) emitidos';

--
-- Volcado de datos para la tabla `payment_receipts`
--

INSERT INTO `payment_receipts` (`id`, `receipt_number`, `account_id`, `payment_id`, `issued_by`, `issued_at`, `status`, `annulled_reason`, `annulled_at`, `annulled_by`, `pdf_path`) VALUES
(1, '2026-01-0000001', 1, 1, 8, '2026-01-06 22:09:10', 'active', NULL, NULL, NULL, '/uploads/receipts/202601/receipt_1_2026-01-0000001.pdf');

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
(1, 4, '2025-10-27 14:15:48', 'asd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'asdsadasd asdasdasdasdasd  ', NULL),
(2, 9, '2025-12-31 19:21:48', 'asdasdad', 'ads', 'asd', 'asd', 'asd', 'das', 'asd', 'asd', 'asd', 'asd', 'asdsda'),
(3, 10, '2025-12-31 20:12:42', 'asdads', 'asd', 'asd', 'asdasd', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 8, '2025-12-31 20:15:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 6, '2025-12-31 20:26:17', 'adasas', 'asdasd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 2, '2025-12-31 20:27:51', 'asdasd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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

--
-- Volcado de datos para la tabla `progress_notes`
--

INSERT INTO `progress_notes` (`id`, `encounter_id`, `note_type`, `note_content`, `created_by`, `created_at`) VALUES
(1, 9, 'Indicación', 'asdadsdsas', 8, '2025-12-31 23:24:51'),
(2, 6, 'Evolución', 'asdsa', 8, '2026-01-01 00:26:44');

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

--
-- Volcado de datos para la tabla `record_attachments`
--

INSERT INTO `record_attachments` (`id`, `medical_record_id`, `encounter_id`, `file_name`, `file_path`, `file_type`, `description`, `uploaded_by`, `uploaded_at`) VALUES
(4, 2, NULL, 'wallhaven-nzokrv.jpg', 'uploads/medical_records/att_69558cbe2d85c7.72226592.jpg', 'image/jpeg', NULL, 8, '2025-12-31 20:51:10'),
(5, 2, NULL, 'RIF-NACARY.pdf', 'uploads/medical_records/att_69558e482202c9.12694575.pdf', 'application/pdf', NULL, 8, '2025-12-31 20:57:44');

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

--
-- Volcado de datos para la tabla `services`
--

INSERT INTO `services` (`id`, `name`, `description`, `price_usd`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Consulta ORL', NULL, 40.00, 1, 8, '2025-11-06 14:52:19', '2025-11-06 14:52:19'),
(2, 'Consulta de dermatologia', NULL, 35.00, 1, 8, '2025-11-28 01:25:53', '2025-11-28 01:26:06');

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

--
-- Volcado de datos para la tabla `treatment_plans`
--

INSERT INTO `treatment_plans` (`id`, `encounter_id`, `plan_type`, `description`, `status`, `created_at`) VALUES
(1, 9, '', 'asdadasdassa', 'active', '2025-12-31 23:24:42'),
(2, 8, '', 'asd', 'active', '2026-01-01 00:18:23'),
(3, 6, '', 'asdad', 'active', '2026-01-01 00:26:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(128) NOT NULL,
  `last_name` varchar(128) NOT NULL,
  `cedula` varchar(20) NOT NULL,
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
(8, 'Miguelangel', 'Monasterio Salas', '31080925', '2005-11-24', 'Masculino', 'Palo Negro', '04243316242', 'monasteriomiguelangel81@gmail.com', '$2y$10$2CDzj9IytbC2pLBNyim7D.5RoUrQKaMmFa76gjWVmQIv6igCPXxse', NULL, '2025-07-30 20:56:13', '2026-01-05 22:22:38', 1),
(11, 'Jessir Nacary', 'Bravo Monasterio', 'V-19514942', '1989-03-16', 'Femenino', 'Palo Negro, Urb. Santa Elena calle 8 casa 6', '04244435711', 'jessirnacarybravo@gmail.com', '$2y$10$RIo3R4w7atd5M.fOi7JcuONR/rKlAYngAXCpgWui4zmS5PhStLLNu', 8, '2025-08-01 00:36:04', '2026-01-02 23:37:49', 1),
(23, 'juan', 'de la torre', 'V-23456123', '2025-08-14', 'Masculino', 'Palo Negro', '04241231212', 'miguelmonasterio2411@gmail.com', '$2y$10$Tx81K2uOgGcRkZ7XS.JtZeEqpKpV4MkRZhB8fZ8LGqXcKuclzWzye', 8, '2025-08-11 02:11:27', '2025-12-21 22:53:23', 0),
(24, 'Eduardo', 'Hernandez', '23455678', '2002-06-11', 'Masculino', 'Maracay', '04123338989', 'themiguemonasterio@gmail.com', '$2y$10$VeLdtbjGsFGvNoyBGUZbqOq4bUPuxXMiQ1pk1.8/kdZMbolMFx2vG', 8, '2025-10-25 16:10:06', '2025-11-28 01:37:42', 1),
(25, 'Alberto', 'Morales', '11234111', '1980-05-05', 'Masculino', 'caña de azucar', '04121232299', 'albertomorales@gmail.com', '$2y$10$2c/HIAfDhqhdg0pAxrpwvuomb6rcEdUCLKphsPv6/RkV7Iq5HrBDq', 8, '2025-10-25 21:27:41', '2025-10-25 21:34:54', 1),
(26, 'admin', 'admin1', 'V-12345123', '2000-01-12', 'Masculino', 'admin', '04123331245', 'admin@admin.com', '$2y$10$m.r/yft5xjQv.mV7JzpKd..r6FJy/eEHSI9Zxq/XhBR0jPkWHIFMS', 8, '2025-11-07 01:05:13', '2025-12-21 15:28:45', 1),
(27, 'asdaDasdad', 'asdadsa', 'V-12999123', '2000-02-24', 'Masculino', 'asdadasdas', '0123314512', 'example@example.com', '$2y$10$diG.JA2YfqugBgLBkbjJ0.e858WXUYxFyDARay2v8DLCLk2Yqlc1y', 8, '2025-11-09 16:20:27', '2025-12-21 16:28:34', 0),
(28, 'luis andres', 'martinez', 'V-28990156', '1999-10-12', 'Masculino', '', '04123128923', 'martinezluis@gmail.com', '$2y$10$UK9vLJ5xO4Z5IlSfii93ROq.mFGpC5vkIdf8mLyBDsr/tup2SiGBO', 8, '2025-12-21 15:26:53', '2025-12-21 16:16:57', 1),
(29, 'eliasadad', 'andrade', 'V-21890673', '1994-02-16', 'Masculino', '', '04123267823', 'eliasandrade@gmail.com', '$2y$10$pC8SgIRoGsgBLEGnGQtnRufE/rFhKk8LM/HYUx4ugRPqNo9kQE38u', 8, '2025-12-21 15:57:03', '2025-12-21 16:32:55', 1);

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
(23, '141012', 14, 12752),
(29, '123456', 12, 3456);

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
(25, 3),
(26, 1),
(27, 3),
(28, 3),
(29, 2);

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
('01a42f6d06f66d20fd47cf3ee0a5a758234c37ccaf600952f9b44fe1dfdfcfe0', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:29:20', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM0NTYwLCJleHAiOjE3NjY0MjA5NjB9.ifA6ZD0v7-vqFP7wQbJZEmRtBnTxdUi7zHi8nOLqoDY', '2025-12-21 16:32:02'),
('02231a51c290a7949da05f35bf3cf58891e4ed4812884a6c52daab04e7b9ec22', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 06:55:59', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MjY4OTU5LCJleHAiOjE3NTQyNzI1NTl9.Du_AKFcWRUby8DQw0Gl1s13Er8U28pVeFS76V2gBORk', NULL),
('02469167a7ae13bc86a2e17a535f2909f6ca3ecda76d75f68c9219676505b3c9', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 03:04:40', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQxNDgwLCJleHAiOjE3NTQzNDUwODB9.YxtHUdyIZfNeS8l_NunIfnyzFWx2DU5mvJlAMiLfXMA', NULL),
('025ebf5e29abaedaad6168408afe334c0f892cce9f2683206062d828fcf6feed', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 02:43:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEzMDIzLCJleHAiOjE3NTQ1MTY2MjN9.TsSbefwX9XQ1Wei1e-AjiWW5VAd5H44GUQPHfazPSwA', '2025-08-06 20:59:55'),
('02abaf8c5f9a79eba3a9decf7b1a6b51f8a28a13a15771c28dad5406c556cd1c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 17:37:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3MDI5ODUzLCJleHAiOjE3NjcxMTYyNTN9.Ocgjn12V9sL22e75EsLvi7N_MPF22SGlA-80nnviXrE', '2025-12-29 20:39:03'),
('02ae0adc062db17fc38d86751f8eeb3a703ba4adf18ef8d4036c6926991a7c89', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:13:11', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0NzkxLCJleHAiOjE3NjI3OTExOTF9.mT3Osi4x4aGh-Ui-4_dG6tcq8BZl0b17xhPn5k3qSlU', NULL),
('03d83ebe09bba03e708a9cfede36a6acd388ff1926c85a2dd817838016152806', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 05:07:08', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjYwODI4LCJleHAiOjE3NjEzNDcyMjh9.8s7Iw_rrytgqZCk5of90oLbyb8C70Nb03RzKZfoxmaQ', '2025-10-23 23:13:35'),
('03f44ca9932fdcc8bc86d01968f1e211bebe75c3509340e8d44e255dd7e66139', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 01:05:25', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzM0MzI1LCJleHAiOjE3NTQzMzc5MjV9.eRAwtbzSQJC1Iu8pG63qbFqYNMETEPXNW5u42KEQF7g', NULL),
('045ab6de5d6ac777c0cfdf984f34a05939bfe47153e64bdaa7bbe0a39314cc37', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 00:41:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3NDAwODg1LCJleHAiOjE3Njc0ODcyODV9.JlDv4M57tYA16MSMTf-qmHYwxoxi9XkXq_PUa6k-9jk', '2026-01-03 01:04:34'),
('069eb5e8f826158596b6c1889453ebbe475e2af5abac7d6862021f6a7c197cb4', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:16:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwNTk4LCJleHAiOjE3NTQ1OTQxOTh9.wyKKMG9MGbiy2AEp9S0jm6BXTJZveCvDar0cEMg08nI', '2025-08-07 18:16:56'),
('08274b3160ac40b94fa54324b2da6bb67f388e8cfd48d0406bfdaf7985c815fb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 23:46:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2NzkyNzkzLCJleHAiOjE3NjY4NzkxOTN9.q-KSAOWmuy95wqfyiSKJTLaMEVJSS9R4uGSXKdeftY0', '2025-12-27 03:17:48'),
('086079887e23f4481e818d15fe320c02262b0347834b2f9937af18e5da048585', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 23:37:52', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIiwibWVkaWNvIl0sImlhdCI6MTc2NzM5NzA3MiwiZXhwIjoxNzY3NDgzNDcyfQ.7FuhcGLiWGzQQrNHA3zOuHCkszhVmfB-0q2aNdBqtwA', '2026-01-02 23:38:37'),
('0996ca93ea9ec4441aba4eaec8f17bb0c202d5fb8a6bc6b1c3a3018115870308', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 01:56:35', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MjczOTc5NSwiZXhwIjoxNzYyODI2MTk1fQ.46cNp-rx8yY8-gQ7nqyOj4Rsk07OaIdLqir0PYHRFi8', '2025-11-10 01:57:17'),
('0b78b5dcfc39a4b12a0bc78bda18ad4d3ea501874985c3da92bedc69d9c0bb45', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 00:44:04', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyODIxODQ0LCJleHAiOjE3NjI5MDgyNDR9.f3r6oLKjzot5kInWdtsHUwklqQx6cYOkGW1vgseWQPw', NULL),
('0c62f0e268c1875dbcbc885aeac89e9a9e3de7c34d5da5779409b9e188325524', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 16:24:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyOTY0Njc5LCJleHAiOjE3NjMwNTEwNzl9.KYp7W2KgxVTH7gWarwkccMGE5YHdoaP5dSq_Zym1Jik', '2025-11-12 16:28:32'),
('0cb9abe9fae4fc269036142000331d6279904b864af8b7b12d15a08dc24b5f33', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 20:01:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQyMjQ3MywiZXhwIjoxNzYxNTA4ODczfQ.vIozr4F8IoWcdf0Fc_e4JRhtg4NxXyMdJ3CEzFu2_wg', '2025-10-25 20:28:26'),
('0d36a42c56cd42fb501307d97a4e8d528c13d1d8e77e3f08bf1e034520787969', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 00:53:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MzY4NjQzOCwiZXhwIjoxNzYzNzcyODM4fQ.SMZ3jHRJtuMtkE7f0wQQ-oGG68BFHBHwQQG4SHkAbho', '2025-11-21 00:55:32'),
('0d65be4ced184cb022dbda7ce7b0de4758ef29ca77c2db8a844e4c2d8523a688', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 02:30:17', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2OTc1NDE3LCJleHAiOjE3NjcwNjE4MTd9.vwV56hIXIOTOGo2_GIt-P4Fs_8KSewv9y2m1aXeZJa4', '2025-12-29 03:31:21'),
('0e1a55796099626596e9c16cad555d4606187071e962a856ccb309b0910894c2', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-22 01:18:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjM3NzQzMTgsImV4cCI6MTc2Mzg2MDcxOH0.B7K-fvMNgSmyyCiR8TqBm6MHowd-eeLlf5H2tZLGylA', '2025-11-22 01:21:40'),
('0e701a2095c4ff049dbc0c998a66fef31890de5f9ed08d6c33691c4ae964b91c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:53:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ1MTkzLCJleHAiOjE3NTQ0NDg3OTN9.dmB45Gfta4fi5TLcVnel4-p7o4PoUdIBCh6UKHO5qUo', '2025-08-06 02:31:29'),
('11826b6ed84993ae9fe098ae085eb5edb7601b3f4444b121e7d410768be48f20', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:05:00', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTM1NzkwMCwiZXhwIjoxNzYxNDQ0MzAwfQ.kOheP_iF7b9eikHGWNAPbQE8pZCi8lr9-z2lcm9M150', '2025-10-25 02:05:11'),
('11c15b9cfc788afd302bed3cc720b0c24f69380d412ce41b0e171946b68ea8f2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 01:40:46', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNjg5MjQ2LCJleHAiOjE3NjM3NzU2NDZ9.V8AKb5MZcRDd6Qc49rXIr63_84gnpisBnf8_5r3XNyU', '2025-11-21 03:01:35'),
('133e66bbea49f79aa31741db640b4e0e0b1e83f1887419fb4b74e615b695d796', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 01:15:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNjUwOTAxLCJleHAiOjE3NjI3MzczMDF9.bdy7nMeKHhSXqQAOQMLfk3zZVGuRbsUa4F6UST1saO0', '2025-11-09 02:31:07'),
('1474d50f429c9bc45f024557a6cde1d631c20b7aed675e05a1ccda64cea40fb7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 00:39:28', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyODIxNTY4LCJleHAiOjE3NjI5MDc5Njh9.x97TsyiB6MDAu83Ufj5rSTZopr89QbcekWzzMmLHpc4', '2025-11-11 00:39:35'),
('151b03a7ff9c4b3677feb00a6bb5f966e69a972bf359b6e94ec0c7e03c114be1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:34:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTA4ODUyLCJleHAiOjE3NTQ1MTI0NTJ9.vZRg59hN-XHRwkv997JL78doS9VNfyK8sOKkVb8yUuw', '2025-08-06 19:37:25'),
('1a341713cb48f3a1d18e8373d19aa9d0884a903d4e72fe57da114c0e71ba0d68', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 14:52:10', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNzM2NzMwLCJleHAiOjE3NjM4MjMxMzB9.WJxDg02LEekFEsK4FEkr1XoPzlVmjNecjA7H6wk4Frw', '2025-11-22 01:04:12'),
('1aafdb4cbb73d1f1a78f3b96ebcc4a73be590a4a2e06aaa774e55734a22fe5d2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:15:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwNTUwLCJleHAiOjE3NTQ1OTQxNTB9.x9Zfeq4X5PugA8TSxvbJezLeE6Tk2FaSHI45-IbsYZI', '2025-08-07 18:16:27'),
('1b3016fd79c9d435473ab282d8aa1d76b32e369178ee45a671ccca023daa104d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:52:56', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI3MTc2LCJleHAiOjE3NTQ0MzA3NzZ9.Ryl0oA0yrx6bM_LmjjaRwax8FgZZv-Eogk1AUp8Qbhc', '2025-08-05 20:55:23'),
('1c7e4ca68081ae6b45138d062001dc6d1a969dca091353e3939677017adfe5f2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 14:05:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDAxMTI5LCJleHAiOjE3NjE0ODc1Mjl9.OU74QIH3-JMolUEyli1W9bRnd2aa8XjtcpEMnGWfzTA', '2025-10-25 15:13:13'),
('1d0296cc2d87b55763f2071952c87596ae1d92e4d9ca51669645177192ad9322', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 04:55:14', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMDg3MzE0LCJleHAiOjE3NjEwOTA5MTR9.PrQobtYo60CkrttkwLXhjMNf7niRYvPP2zzT-Ao0Uuo', NULL),
('1dda40360a5108852600d6d6470b5a04e4066736d1e8843c94eb57121ae7da10', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 21:17:11', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyODA5NDMxLCJleHAiOjE3NjI4OTU4MzF9.YSS6mJZUIYLhkkV1BIM0RTOZL7tsUkyKPxbfayRFFkk', '2025-11-10 21:17:24'),
('1f8718e7cacf8337a9256368e53bf746d08e7ea8e968ce86b757b69b4bd6d6d1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 23:06:55', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3MjIyNDE1LCJleHAiOjE3NjczMDg4MTV9.m5-8QtkM_KS-TfRDXwKiq7_1kskqClje3PirJevimu4', '2026-01-01 00:33:03'),
('20cf8ce119598c8fe256cc5fc62ce66d486a234a8baae0dfefed24201a1d15a1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-16 16:19:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY1OTAxOTc5LCJleHAiOjE3NjU5ODgzNzl9.zL5M-DtdVd98DTcPeoTs2mLNEM2yJLWoS10eGKbOvHE', '2025-12-16 16:19:51'),
('234f1296418e9cceeda1f26fb5abf5664c6bbc0a7d57719df4d433d9172f673e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 03:07:09', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNDg0ODI5LCJleHAiOjE3NjI1NzEyMjl9.qjSNfQ_22jOCTNKvlxrNQliAjmdhM3N12TpeepMflfA', '2025-11-07 03:09:33'),
('24709891e3ab7bfcfabb322dcd7e6ec77e3a3b633e5a00ecf7da00df8eb79dce', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 19:14:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDg2MDQ0LCJleHAiOjE3NTQ0ODk2NDR9.PQWnn9BW8u5ezBY51ZMsQwZ-Abe-zT1mrUYrrPKE6rk', '2025-08-06 13:18:01'),
('26666e2592e8f12b5cb132a5d4398d85880ca10f665850171eee989e8cf57483', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:26:31', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjgzOTEsImV4cCI6MTc1NDMzMTk5MX0.8gtOIhzbcYHghu3KZo23tSMGD_NHpB2Zpmu5D3A2_mg', '2025-08-04 17:27:07'),
('271e96992511afbfd2e356d5d015b359ee5c53fc0d13bd9102765d712bb6ba59', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 01:07:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MjY1MDQzMiwiZXhwIjoxNzYyNzM2ODMyfQ.GIJBvo_XaUhsSkQdYKrBqzaqcmzoJPRqepF2vnXnRvQ', '2025-11-09 01:14:47'),
('284303543c0d3aa803eeea94b9ce3e469744b7ec69f9ace1665cb9155b5c5847', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-06 15:16:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3NzEyNTk2LCJleHAiOjE3Njc3OTg5OTZ9.2FxIgREFkWucon-NrxO6Op1sATmWWn1IDQ4PdZNrvnU', NULL),
('2a147347ed3f1fe0e27a9c689ad78ca00a2d3b68fbe590fc43edc7b1a2781ff8', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:11:31', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3NDkxLCJleHAiOjE3NTQzMzEwOTF9.fy0QXflcBsamJYDtHUcYZ0P4RZcZrZ629yTD1BtTrfc', NULL),
('2b09d38e8cd348d330a0b03cc527952a9b712be8fc75993dead5349ee9aefa79', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:09:06', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQyNTQ2LCJleHAiOjE3NTQ0NDYxNDZ9.HwTL7ALGP--S59OihLkFTc-hZUKep5ITrg6yYGvUVzw', '2025-08-06 01:14:46'),
('2e7bfa090cb660ad7fe9ccc6485450446fcee8d6e76b72f4dae3764c2047f58c', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 18:44:21', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2NzM3OTQ2MSwiZXhwIjoxNzY3NDY1ODYxfQ.1rRcvSVauUQx7dmaNIK4hOZEO1C4ujBflpQdHhPpOYc', '2026-01-02 18:45:27'),
('2f8702d20396fb169259da9b7ba394227bf2bc7892539d46c886dfeccac00466', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-23 01:14:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2NDUyNDU5LCJleHAiOjE3NjY1Mzg4NTl9.ozVZO19QMlUmwFDQfBPm5UQK9h0OfB8rb1Pm_GuiBcE', '2025-12-23 01:14:46'),
('328ad261e5e9f39453853aad06c3fbd9cf34de8ecc25ac41fad6121f3825a778', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-27 15:47:34', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2ODUwNDU0LCJleHAiOjE3NjY5MzY4NTR9.DKl0sayt72lB71hbbHbJgvOXTToAJ9EBbAwH6-2ZK08', '2025-12-28 03:27:19'),
('32a1ca8477fc0c6bd83e20464d26e932a167ed34770ee2349579a3fe497a9f69', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:11:55', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3NTE1LCJleHAiOjE3NTQzMzExMTV9.K8I2cCPcpzL0-sSby72Ed85EYJa6pA-baHbWRamlhBE', '2025-08-04 17:12:39'),
('33e465f1ae702b591c72f24b069097e585922b816f20eb24ec71b79d3dedf5f0', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-24 01:47:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ4ODc4LCJleHAiOjE3NjEzMzUyNzh9.8lLOuoaf8acy7VYwtW1mssK83KeWfAXLkgJ3HlE2vk4', '2025-10-23 23:12:32'),
('342d6cdf434bd21b63f1c195be0e0337f541e5c2be6f62009e941b002086ca72', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:26:17', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0Nzc5MTc3LCJleHAiOjE3NjQ4NjU1Nzd9.9BHd44jW4VxSBZTzrQL8LCbqJfY64X8ECwq3jNPYxNo', '2025-12-03 16:39:06'),
('34e6faba4f275e17c66e1777e33ea85e74bfcab7858750c552e0df7268d0b396', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:15:38', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0OTM4LCJleHAiOjE3NjI3OTEzMzh9.6oUpyzuClBQnZTEwesSrSA0XgROqD7QQT5O2T9d30vY', NULL),
('351cfa4254bd10c2ac3dfd8044b23b40aac49ad55ffd2f4301ce7f4697e9f4f3', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 02:38:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNjU1ODk5LCJleHAiOjE3NjI3NDIyOTl9.4o5kDtUumufIcrtGHb1G8inZgKtHlNDTwIhm8jn0anQ', '2025-11-09 03:00:58'),
('35ab41282436da65b121abcce865d2e7ae54c3d62d716e0a7d54038f6fc75090', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 00:23:45', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzIxNDI1LCJleHAiOjE3NjQ4MDc4MjV9.OkbCkLaPq7LJyDQUePwZeL2vGxLsyKicJeHopEirF_Y', '2025-12-03 01:41:44'),
('364fa2779f2c90495a21677ec0d41c9c1e97c595938ed0916f6c18bd31787eb4', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-08 04:38:02', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjA2MjgyLCJleHAiOjE3NTQ2MDk4ODJ9.QLF-m_r4CGABdvs4bhr3Eh6Y435icYM7tuxei1zqA1A', NULL),
('3675779817768b63b776a1723a1661c1f23643ca6fabac8ba9dac3970c48f3d2', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 02:25:48', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTkzNTQ4LCJleHAiOjE3NTM5OTcxNDh9.YlbqlIilF15HNilGhhzA4kz1EOxP_dj0d9mtePutfKQ', '2025-07-31 20:28:48'),
('3683012b1d7b82567a430704b3a1feec047c2d19f6168ce798692f4e5c922756', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:39:47', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MTQyODM4NywiZXhwIjoxNzYxNTE0Nzg3fQ.V7IemQemvJBEVsHZ1Jh6EOxYw39F987amEx2o129UGA', '2025-10-25 21:40:25'),
('368ea52b2266f52dc7c7bf81da6c526f7f4e6360fb8a3d654b033eb692e03e91', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:00:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwODAwMSwiZXhwIjoxNzYxNDk0NDAxfQ.P_f5O21Y7vG4KMnpQbeE1iE1Ml6rKGdBorVZouEOHsA', '2025-10-25 16:05:21'),
('378ec8a4e182efcd36d954276bf4a94476c6b2e8c3d6f1c31fbf180a37a3359f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-22 13:50:55', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzODE5NDU1LCJleHAiOjE3NjM5MDU4NTV9.iRyxtlm31_AyL0GPjRzSxUp3Z9o25cPBgukHMyxaoZ8', NULL),
('37e316030b9f1bc7b02fa10ad53799a76fef9856baf956130e500e045bef485c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 00:54:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDQwMDc5LCJleHAiOjE3NjE1MjY0Nzl9.GWBNYjbLuLSAl4jNUwUtNLJlPAykp_0yEIgrSJ6Y5pE', '2025-10-26 02:20:31'),
('394b58740d6bc888a68b1ed23fc5c5a9d15391bc6f8a2fb95b2300ece606393c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 19:32:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTM1MTM1LCJleHAiOjE3NjA1Mzg3MzV9.kHsXsROPBqqZ5k8CfdppT9ARetrMsEBc8Y6qVxrAU9w', '2025-10-15 14:29:45'),
('39724f2806e38a1c14ac47e849c81c4c141b3217c7edc76968730586fea6af45', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 19:45:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ3MDQ3MDQsImV4cCI6MTc2NDc5MTEwNH0.-BQldDtC-2iK1L6M7epK3CJYGl06cAh1idU1zLKk8hE', '2025-12-02 19:45:28'),
('3b26e6fe449548eeac853962b0fcedd66bc3c12e2a30adbf076aea376ef40984', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:33:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI2MDA5LCJleHAiOjE3NTQ0Mjk2MDl9.3NjAFxhY9k5PBIicw83C9WIbybkBwZPxbV54OKxO0vE', '2025-08-05 20:52:51'),
('3b4f97d82ac23fe02ba6e6694da2ae489c7f0c23258629795cc8675d38cf0952', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 19:09:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzE1MzgyLCJleHAiOjE3NjI4MDE3ODJ9.8eOrUkdAEaJn3InG-Jubs-k6p2LGmbPJXWWd3YSal9E', '2025-11-09 19:12:39'),
('3bce1ff2922c1a7923183243755b5e2362ad95555425426a67f20adc61422e85', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 08:31:35', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0NDc0OTUsImV4cCI6MTc1NDQ1MTA5NX0.xgbY-QKvXR5JeZNxSplB1ROf7m-7mRGXc-Ao7dzHYek', NULL),
('3c3a1e4f9af672e7896aefe4b42be4e5c258153328425e8d71ad787848d8ae50', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:59:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNjAzNTksImV4cCI6MTc1NDA2Mzk1OX0.MWCc05wIIyRzUkqBcmuUEp2IgFJtZLKk9RRew67pMs8', '2025-08-01 15:00:21'),
('3d952261cf8e370f464ab054a6fed2060c4f9963370f03eec4ad278cfe975454', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 06:06:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTczMTY0LCJleHAiOjE3NjA1NzY3NjR9.jueJlXLGtC34q4y44IbAbaufZ2Ny3DK-GsqNKMQywhs', '2025-10-16 00:21:28'),
('3dd0ca1392abbee9044b3b2e9bd66f48aebe3af3367bc24d1f72ad11433505cf', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:27:43', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4NDYzLCJleHAiOjE3NTQzMzIwNjN9.40zQV6dlSdOpOpGGEs-3uJ3rh9ciQ7EnODVB0C6JZto', NULL),
('3de1b3d2189e5ec9ed0cb47b4f308c33e3729740097b315d924e7a098530145f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 22:50:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzI4NjQyLCJleHAiOjE3NjI4MTUwNDJ9.8ML6KRMbH3AeqF1mdV_t3KQkQMhLR_NXKtYiwLEgv8s', '2025-11-09 22:51:02'),
('3def516b525a873733cc3db14519b626e39bd19f0b43e80643003aeeb3c7a640', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 18:45:52', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3Mzc5NTUyLCJleHAiOjE3Njc0NjU5NTJ9.X2YvyBvG-bzCySowtHqaPlM5mot7T0fgZBvx-8H5apk', '2026-01-02 23:48:21'),
('3df7fe5c1766eb50ac3818c3b5ccd3e248c15e7b4d1dbff863afb68e370efff7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 07:11:45', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTI5MTA1LCJleHAiOjE3NTQ1MzI3MDV9.J4ximnifTYgJpFBofxipuAQST7eQr4ne4iyEGHpSY9I', '2025-08-07 01:12:19'),
('3ecc9ed6015ce22f2e583b3614ae537abcaf696e989ec8785a54a49c8456691b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 02:38:00', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNDgzMDgwLCJleHAiOjE3NjI1Njk0ODB9.bMNOvb_Grde0hg3w5rNhnq0TEKuhDzG6r4BNmmJ59Mw', NULL),
('3f8b5de15fd497be7e1d93102a6ba23d22fb97ea6aff64a978a2b1e11e1680c5', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 02:58:04', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQxMDg0LCJleHAiOjE3NTQzNDQ2ODR9.jnQ9Dc6qOeLe6mPc80hvoxQGgpVN7l2mMSZRMqliR7I', NULL),
('44af854132d8a3c494d9cf084696c73977d1b05d6c0880d9d97cd40aa84e049d', 23, '::1', 'PostmanRuntime/7.49.0', '2025-10-25 20:15:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQyMzM0MCwiZXhwIjoxNzYxNTA5NzQwfQ.C3jDoEavR-nuMdstzaNGzgheDeODlTbvkQxGy4E3lZI', '2025-10-25 21:43:34'),
('45289a5f65b5efa5735a6151c223bee58ac917b04797ea7c1ba0bc0662d4ce30', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 19:42:49', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzA0NTY5LCJleHAiOjE3NjQ3OTA5Njl9.QsSEDrurCMJ7x9HMtrPSsOX2IIQkOAx-FL4XldNEUa0', '2025-12-02 19:44:42'),
('4554adcf40b4cec4756561051ac47a0e1ad5e8ccc9f927c3cb1672444841b298', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:26:37', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA3NTk3LCJleHAiOjE3NTQ0MTExOTd9.cGbT3bUVApK6-TIxo0IBTU30tXqe9FPvPJoHu4uv3I8', NULL),
('46071c7170802079143cae400b3fa2facf9177a1fcbc9009ae6a85b14a42d691', 8, '::1', 'PostmanRuntime/7.44.1', '2025-07-31 20:50:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTczNDA1LCJleHAiOjE3NTM5NzcwMDV9.tbjh7zupnGEAv5qpjd1pKxzoVtosKPIne7VEZgyi0Ig', '2025-07-31 15:14:33'),
('47d6b178dd940f5c8eecf8a20cd8e6e65028bb50fca3e8dea0baf49519d150f7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 19:05:31', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzQzOTMxLCJleHAiOjE3NjY0MzAzMzF9.Zf_4naA5riyQmWw1eInXItAtjjPNoAteHWh35viEOz0', '2025-12-21 21:13:06'),
('47e36a065b52eaf06fbdcb42da4a357fd14e491d76fb86e3f2e256416a1b5342', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:56:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA3NDE4LCJleHAiOjE3NjI3OTM4MTh9.KCZrAKjf4GPcgwgSUvrgU8BGDzogXHGMmwJYZ4XrNgc', '2025-11-09 17:02:20'),
('491c65ce1ed7acf9d2577514cc67f09c61ae98b8da05b4ea7b6791e5dcb1967a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 03:19:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTE1MTc2LCJleHAiOjE3NTQ1MTg3NzZ9.NJDZ2CwKiSvdfzJvy-RthpsIRKA6i7bRaQU29GNdvlQ', NULL),
('4a20761eaa2825b1b402a6dcdbbb66600d337ed3627e5cfbfbe5266a920cf9c5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 18:10:14', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTg4NjE0LCJleHAiOjE3NjE2NzUwMTR9.ywCL7_htU1cFxYwbgWrda_1nFu2JSftxq8WtqIEAB04', '2025-10-27 20:24:53'),
('4a263432b5f68dd296210aea9089c2c0c0d7e2becf20106ac8c9ca975cf3a242', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-23 15:12:59', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2NTAyNzc5LCJleHAiOjE3NjY1ODkxNzl9.DmQI7L4wFryGq0uXL2X3pr0OD37EYmDc-6iL_brR1W8', '2025-12-23 17:17:41'),
('4c33c092e19c2d0d3bc876ea6f96153b35db1a46019decdbfa206b53c1f68261', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:30:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA4MjA0LCJleHAiOjE3NTQwMTE4MDR9.xDM5GJZM4aRB2eM7AEGZnpncIk_Q9sZrC0_IiGKACfA', '2025-08-01 00:38:37'),
('4cf8ba7b225d55585dee794c5147b4c6496d7fea831dd38269cd5ddae778d438', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:34:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkxNjkxLCJleHAiOjE3NTQ1OTUyOTF9.lkA8kQc11RF2W5SXsWhF6S5M-f0FLzItTZ5kFS87s6k', '2025-08-07 19:34:28'),
('4d62483b6e66291235607f0fc6a865a17e4e191a800c8e87eb4e817320ad3054', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:10:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMDA1LCJleHAiOjE3NTQwNjQ2MDV9.X08QpkkVpiWCdkU0H4EtcJfdRYNdCCxGQUDJ83FtaTI', '2025-08-01 15:10:59'),
('4d657148488e317a4f6c5087d84cad8784900e25a7c0e137fc796e5d31fc059b', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 02:56:28', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQwOTg4LCJleHAiOjE3NTQzNDQ1ODh9.VRRJ1Eu6qd6EjELDz5rcj4mXnuNl_5uV_7_Lk5cYxd8', NULL),
('4dc217f8ebfdbd154b0aa9c563aa3da952724f9c8a1f6f8d0422bdb7dc549bd5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 13:55:23', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzgyOTIzLCJleHAiOjE3NjI4NjkzMjN9.s2n16cuIF0SRzf_AOxztDlchNMSVeSAnb1VVlKImoUg', '2025-11-10 14:06:40'),
('4e11301d180bb8979f72477ab6990dce9ad8aff2447e0daa4c0bcb59716306e3', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 22:22:36', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzQ0NTU2LCJleHAiOjE3NjE0MzA5NTZ9.xs6ny0hKFtqf37Edg6NKN2jdK_B-CDNkaXo1wzimUuY', '2025-10-25 00:03:55'),
('4e34da70295ca68a3d38a58936296468b8de7fea36c7b4c6a16757f1897fc6fd', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 01:55:17', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ2NDA1MTcsImV4cCI6MTc2NDcyNjkxN30.U9az0J8HEBVzz_wbIKOMQLpfdGwwBEW1NKjGpxVw2FI', '2025-12-02 02:00:16'),
('4e434bbef3f1dc127081690f78a82e7e86b09d5b1fa89631409c01a66cd67b2f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 03:00:22', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTE0MDIyLCJleHAiOjE3NTQ1MTc2MjJ9.AArPV8fohDpelUFLJFebbwsv4i0aVpY-X200RZEr9L8', '2025-08-06 21:19:24'),
('4e6e8ff5b05f63244c209640eec655764d77b0551c0b70e148f5a9a6180ab516', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 01:41:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU2NDY0LCJleHAiOjE3NjE0NDI4NjR9.JDdyrFDx7pzmDkPE0i5o0SBzRgVY4mFvMY80GZwztq8', '2025-10-25 02:04:32'),
('4eac8ee189f12ecb8903c902c74fd3bff8c5704d048b44171df514b7d7279138', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:55:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ4NzczMTgsImV4cCI6MTc1NDg4MDkxOH0.tdXjw7Jhl10CRYTPZLedZXyrVCl7UQAVcBPF1TRfxnk', '2025-08-11 01:55:33'),
('4eb14977533ea849994b7e7a6906c3d48af18210f0fa54c78c8a9adf641d4f78', 26, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 01:05:22', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI2LCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTc2MjQ3NzUyMiwiZXhwIjoxNzYyNTYzOTIyfQ.rmNVT29fjoHheaWgxzzDBJu2OOLGewTGM9s83JVSuVo', '2025-11-07 02:20:00'),
('52010506e92e8d5c5d5d4e073ee8bc22c4722402616755c546e526c96e4008b1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 02:30:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NjQyNjM4LCJleHAiOjE3NjQ3MjkwMzh9.CNbsn0nh4fOW3PYKuCRJX7j0aFlm1uE6RioxPR6WZQQ', '2025-12-02 02:35:16'),
('561d710e70ea1ba55ed2436df78a7a7a9c8a56166c2eda76861c863bc024e800', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 19:43:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzkwOTg1LCJleHAiOjE3NjQ4NzczODV9.hOJ2QMCs1SJLU5pCOy3cdokwJke34akVcINBeU_TWZo', '2025-12-03 19:45:41'),
('56c4efebe02228c1cc7cbce71d6989ec3429e22e83d701cb110235edb34c76f3', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 20:19:49', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNjMzMTg5LCJleHAiOjE3NjI3MTk1ODl9.FtZc6NVhNlnBzjAa4y4KGHOwe7UAXNi32k7REljGpMQ', '2025-11-08 20:54:15'),
('571b639a459b7f85d0496349e2cac169a8040d3118492db2e19921d50e3e33bb', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:45:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA5MTM5LCJleHAiOjE3NTQwMTI3Mzl9.9vQ2IYvHacVQ3xZtGLwJujHCJp6nK77x_QQ_Y7MWcyI', '2025-08-01 00:45:52'),
('587d7f87375133329bda8af86fee6e1860c71c15740adaf820e4787b0b84649b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 19:01:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzE0OTExLCJleHAiOjE3NjI4MDEzMTF9.dZaC_uGQ2ZHBUWVU52oVt4Nw6Hr3nMYT6lKalW8mi7w', '2025-11-09 19:07:04'),
('59504939f0d4511315039864f562c85a5d202fede475b1eb03d549416a696e4e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:14:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQyODk3LCJleHAiOjE3NTQ0NDY0OTd9.OcTBgi4TtQkN75bMVUaIRHu70JkIwrF6qKnLPRioj4A', '2025-08-06 01:27:44'),
('595a9dbcfe42635efffccb49011c5f9c52540617d5d687e5ec918bad2ac6fc5a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 20:03:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNTgyNjA1LCJleHAiOjE3NjM2NjkwMDV9.b2TJyLJVChMqc_nV5hezi_xe0JDg_k-HRVV4N-Sz18M', '2025-11-19 20:03:31'),
('5d055f1db7d80e8abddab1db7da369abdd696abae73642f5bf77eaf7c3be2d25', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 23:39:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzYwMzcyLCJleHAiOjE3NjY0NDY3NzJ9.HJoIc753kyOq4pgCrgnEIj-VvE6WhSEvru-2y7KE5WE', '2025-12-21 23:55:04'),
('5f05deeb29d7e2149de241390a4b1bee44f119dd9272a572f7f1a06149e4b329', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:08:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA4NTIzLCJleHAiOjE3NjE0OTQ5MjN9.UV9bQUEsThlbGpsXXazoy8nnRnVx5gplAuDMzL0byNo', '2025-10-25 16:10:12'),
('5fa6ee327282fec2559039bfa51caf99172b723034dc5a554ad15e8c983c4227', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:47:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzUxMjMzLCJleHAiOjE3NTQzNTQ4MzN9.4iK8i-wp1RbazTuPHnnA1D9jWMKUCgOitZPdRbgBAnU', '2025-08-04 23:53:43'),
('5fe7d527695bdf21b1a659930c04bbe193d61a2e751fb11f4e32649b2303fb16', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 15:20:03', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA1NjAzLCJleHAiOjE3NjE0OTIwMDN9.Pv4cIq8nCOVK0OrvxtgnruL-cQXIg20Dk7yzMT5nU18', '2025-10-25 15:30:26'),
('615d7d31bdb5c0aa76f3099707ba7695ef819e3e8792599c45f5afa58e166a8b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 23:56:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQyMTk5LCJleHAiOjE3NjEzMjg1OTl9.KZ6edycCjg0SZxyOZ_PzeH-IVoFDvMQaolxa-quAAaw', '2025-10-23 18:25:55'),
('6271e68841e4c5a29e380396ac759d35f3a29496b9f3edbca7945c838d234ccc', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 16:04:06', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NjkxNDQ2LCJleHAiOjE3NjQ3Nzc4NDZ9.-FLbeHpqvfi5Enp419BiUK36nRqjoqlbPJm--JdMQvw', '2025-12-02 16:05:52'),
('63176293eec9437ad364dea309a0ac12fd645e65aa783e14bc69059f63c20033', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 01:04:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNDc3NDU4LCJleHAiOjE3NjI1NjM4NTh9.yi9DpEEsU9UP-wYxMzvkdY9tnWKWuOJD-T_vAxXQpvc', '2025-11-07 01:05:16'),
('6333199664b9075865a7bd453c30c69bbdc072d1475d87ddafb5216bebe40d2f', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 01:53:45', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2NDY0MDQyNSwiZXhwIjoxNzY0NzI2ODI1fQ.uoFdWISVodr0Lx4XXKlOTTPkdZ5-AVq7ReyUTJQ8q6Q', '2025-12-02 01:55:01'),
('635269003c931087c030576e5329bb8fd2c53721e415d0d72d732c29234ecae2', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:20:16', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ3Nzg4MTYsImV4cCI6MTc2NDg2NTIxNn0.-b9C4RPy9thwMIW0jaOi5M0gMrggCEAbD69l2HkMI8Y', '2025-12-03 16:26:02'),
('6584129f54351d63132b719b96b07157736a2c314b96658dcc8fe407838b09df', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-07 07:53:45', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTMxNjI1LCJleHAiOjE3NTQ1MzUyMjV9.SvLci9-T2J27p9rE1a_IdB3zZ4_3mcCfB3cTpODx3Qc', NULL),
('66803d1daaf8b9ec0062c7b8f5be878f8c12c98f9f61356e85ce410d460a6bb8', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 03:39:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzQxOTk4LCJleHAiOjE3NjE0MjgzOTh9.pkWCdEtMR0aOiWYvtsrl73dnXracOzX7ek2NPtZxiIw', '2025-10-24 22:22:31'),
('66f41cf1f00877a2203e6879815ebb1d48571bf763aac867769fdbcbfbde77ce', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 15:35:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0Nzc2MTE1LCJleHAiOjE3NjQ4NjI1MTV9.3gLI1F8ipr8Sj9K80HQyspdswRRhhZgsqUrJ2TP6zkc', '2025-12-03 16:19:59');
INSERT INTO `user_sessions` (`id`, `user_id`, `ip_address`, `device_info`, `login_time`, `session_status`, `token`, `logout_time`) VALUES
('6721b9675d12b20e26fe747ba2417978ba9ca95967fba4239f897baac6531fc4', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 15:13:21', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwNTIwMSwiZXhwIjoxNzYxNDkxNjAxfQ.cnFY_CbfEEs8Rp2mNn2XrWtzmGl9pQ4LZaRsrqW31oE', '2025-10-25 15:19:57'),
('67521295e45717c8fa13c401b3a6ddd214eb9b01e03b493f774e5d10ec278e9c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 20:52:23', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1NTQzLCJleHAiOjE3NTQ0MDkxNDN9.6rwJ4tIH-nPAS8AuOJT9y4H6kPF3r8lFev1fq_iTCFE', '2025-08-05 14:52:47'),
('679a6c08e14f100733016d4346c1aff3972265ee721bcdfd1cb49971c903eb93', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 01:42:02', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ3MjYxMjIsImV4cCI6MTc2NDgxMjUyMn0.RWpxImRKmQMhoH-uWWP2SChUZGx7AXo-E60TDf1P6Wk', '2025-12-03 02:59:53'),
('698b9fa0585baa1dbd312ce2d2ab59bfd519ddb7398daf91ed8058e233043b81', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:27:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQzNjcwLCJleHAiOjE3NTQ0NDcyNzB9.1KVfwZa1dFNvSM7hNHxfWK1AGyfJGJqrsRlZiYTtPkY', '2025-08-06 01:28:02'),
('6a7f4f51c7de4af9962e43794c3bc6f8e8f3c694294f24ea698ca345af814e0a', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-07 01:58:53', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEwMzMzLCJleHAiOjE3NTQ1MTM5MzN9.pY8YuKUuFCX2-z9uJsbp-Q1hkqbSMPydbdtNef9wkOM', '2025-08-06 20:00:54'),
('6a97620a03e5e52b9cae8142951fb36b9e0fb8319c33ff5c0c46a1f3f843d93b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 20:44:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI1MDY2LCJleHAiOjE3NjE1MTE0NjZ9.EbHfHZWjhb49K-_etzWM5YNORl1GDlsMXANlng-RVKY', '2025-10-25 20:49:40'),
('6ac8bced984fbe9e5a0eee6950d60d30ce48df44a0ef68632141dd4c3d990ed0', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:35:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDkwOTU3LCJleHAiOjE3NTQ0OTQ1NTd9.Mo9Nma8aM3mRRWBNTyxN1HMw1PHKti0ySeUUh0M5VCQ', '2025-08-06 14:43:25'),
('6b510c87089f01106c7cd2d9cd32fb0dbeb3b2dffb96d3fe9449359ea26f7164', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:25:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MzMwLCJleHAiOjE3NTQzMzE5MzB9.bzFwvrreOMEKsso-fdmaDzuB-9flnJKTSmqyucXGbV4', '2025-08-04 17:26:25'),
('6ce536855ae8af8448043fa5a5f862ac5169a0919359c0efde04e84fdb7465bc', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-11 00:48:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY1NDE0MDkyLCJleHAiOjE3NjU1MDA0OTJ9.lesRnEyR_Lvg1vEPFc83Td7duaw_jBu_8szYSa61_Mo', '2025-12-11 00:49:10'),
('6d8599a65bf367050c63d61c1807945a6495b58a7947b8c66fda5639b0e8b0a9', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-01 16:22:16', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NjA2MTM2LCJleHAiOjE3NjQ2OTI1MzZ9.evE-wjQGuTZJHQrNKZSVwu28vQVk9noFSQ8vtbtKwzQ', '2025-12-01 16:44:23'),
('6d870921254c9f4e1a1506ad3286c524213922d93ff41280b7134c8c3e0c2a4d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 02:06:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NjQxMTg1LCJleHAiOjE3NjQ3Mjc1ODV9.cwpsWxF1fWZEcwfbCaT3TnAJL4tSBUfyBhSoK8HkCZE', '2025-12-02 02:27:17'),
('6dacdeea6403e7655723b4a141753a75efffa1c553ee165bfc2de72a20b9ff0a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:36:53', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5ODEzLCJleHAiOjE3NjE0NDYyMTN9.b-fztuhhURwBq3uz6nXTj_007JF3SO2T3Pc9qi3Ro7s', '2025-10-25 02:36:55'),
('6e43fed0bde45e3d241e8b1123ad3e22bff23e1d49fa114dc3894bad899dd4b9', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 23:39:06', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjczOTcxNDYsImV4cCI6MTc2NzQ4MzU0Nn0.1k9ZqjuoeTZr7kMcEyK-CllM0R6N5-nZXwara9ZuieA', '2026-01-02 23:48:29'),
('6ff7011b0a5877a17f469205034f3845caa31112e5bf2406a0844712b7e51e81', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 21:13:20', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2NjM1MTYwMCwiZXhwIjoxNzY2NDM4MDAwfQ.FUVQix3Zcg4qw0x0zRMLlINNi15C_w-W1T6tS773inQ', '2025-12-21 21:14:01'),
('6ff96b007f46dc6811dbd1d60ea3a11d4d77b1bd32d4e07afc38b169e02fd9d8', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-25 04:07:35', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzQzNjU1LCJleHAiOjE3NjE0MzAwNTV9.ke4Uaz2QIi1PQ1mUPraLLNqeiSGCvGV3fNRBibNIIz0', '2025-10-25 02:37:54'),
('7094f1cfda1fae753ec011ca85f1d8fabe1010a813fafc31b40ec2b8963d1e25', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-06 08:30:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ3NDU3LCJleHAiOjE3NTQ0NTEwNTd9.OKPgK68UOTTeEwdmS424toiN0AmI4_zhohW4-dWNV0U', '2025-08-06 02:52:00'),
('70f4d76a5955adfd6bd0362072347891bae84ca7119debb06ce53c4c8221f0e4', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:15:58', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0OTU4LCJleHAiOjE3NjI3OTEzNTh9.0BpFj5Z6U0LoubIuH6j6UCuKOnjkc-uSpSXT298Ekhk', NULL),
('7112ed3487ecd1f65385f0acb4cf88941bbbf0e0912a9520bf49c631980cfa89', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:13:14', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMTk0LCJleHAiOjE3NTQwNjQ3OTR9.oyVUnx39twtCguWjcnmZHFW-qygixeY8fkj_RdOYELE', '2025-08-01 15:13:27'),
('712fc062a3fa0c55a9d737440a9d7d2e5d84a268e3ceba2829b1c2c6069b892d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 23:04:06', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyODE1ODQ2LCJleHAiOjE3NjI5MDIyNDZ9.cv8orSOxIPRu9z-TOWGRFW_vG80toVzGhfI8_zfZVhA', '2025-11-10 23:05:59'),
('71bc52eb74c3c5cd4a0781928f128f4efb84b7c09c9ebce5fd2ad4116a0754fb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:40:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NDQxLCJleHAiOjE3NjE1MTQ4NDF9.eDyHm9OSLQHfKYS6jeqx6QD8asQfKy9m44_MpJ3wS88', '2025-10-25 21:40:46'),
('71cc5e7a9546b22046d496aed518ba8fc3684e84b92885912aaca4437c838d2b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 21:49:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjM0NTUzLCJleHAiOjE3NjEyMzgxNTN9.I9nwvJPHgxUiw1ZqujHdjFzeP1I26hD03nO3lC2vyQY', '2025-10-23 15:54:29'),
('75029a3214921cbc30f26b2b7a39048cd97aeab569bd79858493d5803bfa780f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:40:56', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NDU2LCJleHAiOjE3NjE1MTQ4NTZ9.jJAy9AG-ABDYemdPELRjYVe2aVBLTjQv39LHw3I62fw', '2025-10-25 21:40:59'),
('751fa242bc2141022df701773b8b74488c8015d962d3a85ca4f66d04ee8fc0ae', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-05 20:57:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0OTY4MjM4LCJleHAiOjE3NjUwNTQ2Mzh9.zCo-HHxzsw3P-woEx3SYMCODIXTIh1Dc0xTyzHaJa9E', '2025-12-05 21:16:30'),
('753a80cecfd65a43e476b420f81f6658ad4d15e8aeb1983a306f11f89509d2c2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 05:41:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjYyODk5LCJleHAiOjE3NjEzNDkyOTl9.NfvTTpDCo76pFgF5A5xiLTF6m-hkUXdo5ADeFX3wA0g', '2025-10-24 00:51:24'),
('754f9b616896a40e18ead4f877c125b1e75055f58e29ced60d9c4a36fe565514', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:43:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0OTE0MTAsImV4cCI6MTc1NDQ5NTAxMH0.HamDqMSWb9Mtu47IVlfz1OPnyDKDhkn2i_ZhDdu5d04', '2025-08-06 14:43:56'),
('762dc40820fedfcc60cb15f1dd663e5df2862fd8cd0150a92d2c59555c125af2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:36:23', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM0OTgzLCJleHAiOjE3NjY0MjEzODN9.WTpjuAFnRXtSR-cGL0hurkqJRJqIXoKwB-qg13045uQ', '2025-12-21 16:39:09'),
('763cf5577ccad57de406939daedcf2e07fc6bba3701a23f17bc2e80ba130f150', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 20:54:17', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1NjU3LCJleHAiOjE3NTQ0MDkyNTd9.F8LnMHWepGUG97RZ6d2v9-vnLd7QRHK-9gDsfULtjdc', NULL),
('765a0fca079f24b95f60327b6852102b9cde2490bd3bc11e9ab4c09620fe1aea', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:38:44', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDU5MTI0LCJleHAiOjE3NTQwNjI3MjR9.AN5JSG10uw9SAwoZ5mLjWw7G16gp3ru4nrX5auwHCt4', '2025-08-01 14:47:59'),
('766b3ca5fa9eea8636d99d4d4f201df98f5d2a0c690f3253641c8dbe2dab14ba', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 14:06:53', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzI2MDEzLCJleHAiOjE3NjY0MTI0MTN9.bMQBeagL6dAC0JR3bCH75WK4_wXWq67tyvbcctzUIkE', '2025-12-21 16:18:59'),
('7750bdac1997bf8c9a6ae6e3d171826d07000980d65697dc9e81928c122dff6a', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:06:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4Nzk5LCJleHAiOjE3NTQzNTIzOTl9.WZ2zFHk5bkWpG6ck64j9XRBcPEkIuglmUQSXMzfzyfM', '2025-08-04 23:10:22'),
('77d79f7c3a2ca2324731b67d29b868ab8318efc2b340390541f9eddcb8503c97', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 15:34:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2NzYzMjY0LCJleHAiOjE3NjY4NDk2NjR9.0cF_2ukEVV_uF5ZEu3-4LeCJENiqoX7yL3irxz86yY8', '2025-12-26 15:40:43'),
('78c5aada30cc80394142e2a90fc2cfcf49ca654f30fbc56690c11fa71a7df291', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 19:04:49', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2NzM4MDY4OSwiZXhwIjoxNzY3NDY3MDg5fQ.AJnBiVxnjnZ9dOqHrtkdcixRbyp0X3D805AKO86015Y', '2026-01-02 19:05:57'),
('795ac90ff96186d682d4e8580d8a1a3ddcddd91348d7c672fd8c07ab7e3eba75', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 13:27:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzMTI2ODU4LCJleHAiOjE3NjMyMTMyNTh9.c-zyiCO84VacoXCAafspB62Icpe2-f5gkFc4v62WlYk', '2025-11-14 13:27:53'),
('79aae2ecebb6316d2ac7fb0197eb463dc814abc0ae49f4e6f82c1c577303dc42', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:25:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTM1OTE1MSwiZXhwIjoxNzYxNDQ1NTUxfQ.7pdG65jH6UG3KEJ0wxotQLhJ53qsfd0krzAo5SOZQ0A', '2025-10-25 02:27:00'),
('7a2e4ff0e457b7470964676510765d084d5a3a008d678976a1eb01dd4c9f203f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 20:58:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3MDQxOTIwLCJleHAiOjE3NjcxMjgzMjB9.cZm6WBZGOgwIMmu7jQoZieP-h7ckPxLskiPY1DUe-vE', '2025-12-29 21:56:26'),
('7af72eb230364f7bc3c699e12e7322fe9f7c127d8b275e7561d03e85c8b58367', 8, '::1', 'PostmanRuntime/7.44.1', '2025-07-31 21:15:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTc0OTAxLCJleHAiOjE3NTM5Nzg1MDF9.Hns3WYWFY7o6eJF14HrN1cLLfMNwO7GPGW8yitlPJto', '2025-07-31 15:15:23'),
('7b1115fbfdb6244af30837bcd62d308669efd8619738c52a6acc7d71aed98f0b', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:26:54', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYyMDE0LCJleHAiOjE3NTQwNjU2MTR9.k_wBa-tDlxapZdntVTlbbImUdCfTw_BZoDQapI2B0dc', '2025-08-01 15:27:49'),
('7bc078e2f30e090c2d88a700b4203849197065dfc00ed5d31020b5c5360343f3', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:06:48', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4ODA4LCJleHAiOjE3NTQzNTI0MDh9.wNjuz1yhC_eB-JZl9zkaC-EzcUFpevHWyd6pnMaHphA', NULL),
('7bc2ae231c4eeae2d1a599a4f681a3d6e43119ba8a6d716af42a3f219ff09ca4', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:25:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM0MzE1LCJleHAiOjE3NjY0MjA3MTV9.SyUtEOsBkqo4ue9De6YNb5CqyGS3rNy8F419exdk6n8', '2025-12-21 16:25:31'),
('7c175b255057f1568e64f8cff8ced5dd7851ad605b2329d7d340dad1f0bf16fe', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:21:21', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI3MjgxLCJleHAiOjE3NjE1MTM2ODF9.MEj1aML7u-_sSDdSiO9fI5LGQIcl8hTqsMtc9x1tnYo', '2025-10-25 21:39:02'),
('7cfc06e6d07aa23441b1bf8fdcbb54ce17e00b695256c0eca1fc2ddba2f17588', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-23 21:54:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjM0ODQxLCJleHAiOjE3NjEyMzg0NDF9.MUgd6Y2_AlvDlfbZ9ySR7CNqWplh5OpEY8xKapETR4w', '2025-10-23 15:54:23'),
('7f23e7c2a56795d4c6954fcbe4742214e362d44f94e9692ad51174c27867849e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:51:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3MDYxLCJleHAiOjE3NTQ4ODA2NjF9.ZuXbBOQWtqckrSmkT4zYiLXIZtNXvlmU7aHdaR-aZ3E', '2025-08-11 01:55:06'),
('7f440274434d5107f8a16f8aa86f36b8a8684711e338e933f7436e8283ea13fa', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 01:43:22', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjM2ODk0MDIsImV4cCI6MTc2Mzc3NTgwMn0.AqyJUShbqYaSJAWZbha78Br9pzZHXMwBb1L4-OQoSs0', NULL),
('7fbaa0dd484057002ad307a10e0106fa6cebcbff439860f8887fc3cb2babdf01', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 14:58:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzAwMzE4LCJleHAiOjE3NjI3ODY3MTh9.zynplNXporNcow1_mxxtSHKu1yf9J2gNaFA6oa--0M8', '2025-11-09 16:09:49'),
('8135eca9054a63b6747e869429473d77d3a04b0a45a2eb80ab7826e4bad8ca4f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 23:58:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzE5OTA0LCJleHAiOjE3NjQ4MDYzMDR9.jq6NQX6eeNVUR-icIxZhg9Ul3D417GVcTzS85KwZ8Fc', '2025-12-02 23:58:40'),
('8166a355776aa26676859275e4d1613faa6d29f3b72a1ebfa41eeff58453cf37', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-28 01:08:28', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0MjkyMTA4LCJleHAiOjE3NjQzNzg1MDh9.APUGC6aidXma92bkaPXc5vACKiuWVCycNJK1l7A8EgA', '2025-11-28 01:16:39'),
('81718b29f4efb83bd3affd3cfab2d3f3c16b927c3d9105252295b6ae7ddbf542', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-05 21:16:45', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2NDk2OTQwNSwiZXhwIjoxNzY1MDU1ODA1fQ.Wzs9LaQtbUFOYZdhDmcji3NWraXTgKYP63iNa108Ps0', '2025-12-05 21:17:53'),
('8309317d9f3e8c1707cc835ad0f15592d27f5d82afb98165732ca840f6c59553', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-12 01:49:20', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY1NTA0MTYwLCJleHAiOjE3NjU1OTA1NjB9.M-pdY-a6Hf9PpomAtDy75ojHQOi_fq3rDp1vVQnWaa4', NULL),
('8344c23488de5d32143b0ab9dec66b81913ae747b1d82120c9be4746a8bb5f43', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 13:06:56', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzMTI1NjE2LCJleHAiOjE3NjMyMTIwMTZ9.5MLPOsL_Or_e11cD1f9-B4BAV8CThc_55Qy5qmQbLC8', '2025-11-14 13:27:00'),
('83930c24e8b01ef1df8162f375a1dd7433d03cf7e6ccca62fae091354362906d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 18:53:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3MjA3MTkxLCJleHAiOjE3NjcyOTM1OTF9.ZZMZZTg5TPh5Lgn9TX9XcrRFBnX4LjVxyLs2udgv5gs', '2025-12-31 20:59:49'),
('8398fdd6511ac1791f8af30d1f37b4cd5d8fc223bf7fa0eb75ea7ade092c2adc', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:41:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NTAwLCJleHAiOjE3NjE1MTQ5MDB9.bozLFSBbYXiGxtAI45nznRhql9jtCwN61WNtQrZ-m7Q', '2025-10-25 21:42:28'),
('8469d7a8f364d9762d35e9d69a678963801a4e6643516add4c90a9575850291f', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:10:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MTQwODYxOCwiZXhwIjoxNzYxNDk1MDE4fQ.W2OAW-vG5tZC3XEZGxJUbqn3TMoVJBXx1Rkx66ZDuLE', '2025-10-25 16:13:33'),
('86435772d8449ab5e0a76e86ac1cbb590c3b19892e865826d07ebf3c415f7bd1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:13:14', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0Nzk0LCJleHAiOjE3NjI3OTExOTR9.s1iCiZF1RBBE0q57RAaxWHw5WLBvxwes6Y3auRwtfhU', NULL),
('86df8f2d3210933540e553f3445954880f49ea9c08a372555e0848e5509cdd6f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 21:40:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI4NDUwLCJleHAiOjE3NjE1MTQ4NTB9.s9_EyQWYVuV-PEJGgAr8aeUAN2f0jd9hV8sYrH-2DlE', '2025-10-25 21:40:52'),
('87fdfe8f5c8558017c2460a9a5bd11a827d232a3ee494d5d0f6da3274595f943', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-17 16:15:08', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjMzOTYxMDgsImV4cCI6MTc2MzQ4MjUwOH0.CX5B6GBS4dZsXw4icJ_ykM3h_IyNT3hTV_QSqDQreZ8', '2025-11-17 16:16:48'),
('88adae52c0b6a9582fcc2d01ca7ffbf15c9fbd1be9e45737a99790aa3efe6c70', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-22 04:56:43', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMDg3NDAzLCJleHAiOjE3NjEwOTEwMDN9.asrCfEFU-Uy1p3CRdVpzUbVnoy-KnBbwC_wIk-UGPCM', NULL),
('88d0c77fe5a67dcca4b0ca6d8dc649ca3396ff10064a5cae2da537441def58a3', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 01:01:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNjg2OTAwLCJleHAiOjE3NjM3NzMzMDB9.pvrzndFVQpJgIa-cLNCO5EB0CgKPBg9L0MvgYq9Q5mQ', '2025-11-21 01:02:33'),
('88dfeb93fae572748ac458f86ce4af5d1f2c53fc768bb1fb53a4e3eaa15393cf', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 07:22:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDExMzM5LCJleHAiOjE3NTQwMTQ5Mzl9.Rhvb7UhcXpFowXZ0MBWBBbD6SAybDOHxzEbT0G3cJeE', '2025-08-01 01:32:15'),
('8977a2d691e2b84d5452a711f670e54984d0075ac9a4f6a5fd82b49d6e6ef35f', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:04:10', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3MDUwLCJleHAiOjE3NTQzMzA2NTB9.jtUPGcOLeQE-OTkWuGYh7H1SDQbBdffCc12PMuy4zHo', NULL),
('89a94e08d30b20156c2532e40573ba2a0f02a3661644fa09d763e7aa17a0e21b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 08:14:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTMyODk4LCJleHAiOjE3NTQ1MzY0OTh9.zWkQ-G3f4gi-HpCUIbgrnyHKTvVdGfTwd_qtdKn3sq8', '2025-08-07 02:56:21'),
('89ab06cb68173478e7fffc830468a0053efaf519eaec5018362c2f7a3f46ffcf', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:12:16', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMTM2LCJleHAiOjE3NTQwNjQ3MzZ9.poYdj8Ml3WCizDf9yJZ3bnXsn1OiUP38XVIpwbnOEcE', '2025-08-01 15:13:08'),
('89b285a267ad911b37cbbe83e59b12c35023649a747e6ad41c1f3827497d2cba', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-23 20:52:04', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjMxMTI0LCJleHAiOjE3NjEyMzQ3MjR9.9tjUwgl422Vpkg1LFK0gq1PlzrEiedGZkkeXu8As2kU', NULL),
('8aa6fcd63223ca219369f79b33e347750341217d9e596c27c1fb24b2292f1d30', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-06 00:20:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3NjU4ODU4LCJleHAiOjE3Njc3NDUyNTh9.9ydO7Y5YmGTkf0fMm8f7xO6kUpiJlM1DDpayq5HZfFM', '2026-01-06 15:16:09'),
('8ad3b94ddc2e12061f565695d054b7ffdb7dfad9c38d836f14adff03be7a2f7d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 21:57:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzI1NDM4LCJleHAiOjE3NjI4MTE4Mzh9.ClaYfwXRtQChQWzgBeXSlFBP34XgzdTrfgEdN13sBRM', '2025-11-09 22:50:32'),
('8b312d50d9fa2a5931d18c016b78c69bd23d2806095842a6257beb4e802f3ddb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:09:54', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0NTk0LCJleHAiOjE3NjI3OTA5OTR9.OJaCGIR8Ozqjpy01IxFA7VOJ5isvfe3XsShpvVucYas', NULL),
('8b5e9940990f0bcdae5d376c74127af234ccff8b2bd8d6e972deccd8682e8483', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-17 16:05:31', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzMzk1NTMxLCJleHAiOjE3NjM0ODE5MzF9.kIEHlGKN-8xAWhLHsz1DmIJ54MfPHvNkMv6rQnCGAy8', '2025-11-17 16:14:57'),
('8bd38a0688235a126a55cbaca6fba12f9716a760d928dc83761cb6f1d36cca11', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 20:57:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDI1ODU4LCJleHAiOjE3NjE1MTIyNTh9.4e7FoZS00DO9EowY-7zVzz4o4WwqHFqHhlj5JKm-sS0', '2025-10-25 21:21:12'),
('8c4bee6e31007018c00ce02e70dfeedd2f0230c3d8af583e5f46f05a9797d54d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:13:12', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0NzkyLCJleHAiOjE3NjI3OTExOTJ9.ymhSh1-yRPqKvqhhlaGQPIlj3adqyaauz0lc2YuKWrk', NULL),
('8cf28dae5cbbf72ff667bd100a556141ab17c8e9cdcee8e8b8b0a4bab39e59b1', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:04:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTM1Nzg4MiwiZXhwIjoxNzYxNDQ0MjgyfQ.KV017Bb-r5BCo3p13vfOMloH0h81ZM3wTvEDH_7kuEI', '2025-10-25 02:04:46'),
('8fa9a129654fb744cf22f6f4a0579f6f21d47dbf36c08cde8d4b9db75e572425', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-05 22:23:02', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3NjUxNzgyLCJleHAiOjE3Njc3MzgxODJ9.WIUVnshfiGGs_xhamdFhQX8BhUwCMeYzh7S6eR3Chs8', '2026-01-06 00:20:23'),
('917b35b7e54203323dc8221064434789ecc710ef5805efa928826f33af83a2bd', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 18:48:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzE0MTA5LCJleHAiOjE3NjI4MDA1MDl9._FN2gXblJQGGsNc3j2augUZQsc_KeJKrwBu_II-d5PA', '2025-11-09 18:48:32'),
('9257166a3bdae9513fa5405768a2e6df848907eb1fa4f65750ccc29271f24f48', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:36:00', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM0OTYwLCJleHAiOjE3NjY0MjEzNjB9.moTqCcy_x9rR6PlvK0ZbTtuv8YKM-rbdtGn3dsdGtgI', '2025-12-21 16:36:05'),
('925ec46617481481f4b37bdbffc1670622d1cafee4f0f90f3fecc39925e6d8d7', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-28 01:37:55', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2NDI5Mzg3NSwiZXhwIjoxNzY0MzgwMjc1fQ.6UixmMzzTJAMiRMzxtB0lZp4raY_RJ-r_ozw8_Ax1QY', '2025-11-28 01:38:23'),
('9570ed3a3fce8198ab1c0a3656b5ff21c93b9e05ba32957a26bc7e5624b54c53', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 00:59:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNjg2NzgxLCJleHAiOjE3NjM3NzMxODF9.0za-28IXzvfR02z6mai4vqile66tK7uOY8RiejVx-uE', '2025-11-21 01:00:01'),
('9591aa7df93152b75a57a319b71d7214918c27d3934779a001e413f321c8894c', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:39:10', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwMDg3NTAsImV4cCI6MTc1NDAxMjM1MH0.cy6m1V3m8rwHPOGGno9SZRnnN_eD6qb4hvWxX9VbC6U', '2025-08-01 00:40:38'),
('9822c40a66e61132792448cb738ab1b04652d9d1493e1f20ee777e28751950eb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 02:00:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NjQwODMyLCJleHAiOjE3NjQ3MjcyMzJ9.zD04UwaIvjd-2VEgwGjLDKKfeuR0nWnQT_c8MkufcTk', '2025-12-02 02:05:03'),
('98f148ff454dd2dcee9bd3d3f85394fa68e7eff2b1c76bb53e96f810fe7e529c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:28:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5MzMwLCJleHAiOjE3NjE0NDU3MzB9.XUuzulfhGOMGYDlis0usyDQfhWF6-uYCCJfqXiKTtjw', '2025-10-25 02:29:28'),
('9953601b0b143beb8e0f94aedd375db86cad8d66fdd5ce86213d09e75ce6b9c8', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:34:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ4MDc4LCJleHAiOjE3NjEzMzQ0Nzh9.Kmn94jj7kOM3sVXouugYqQxFCY-Wnz4XfI8Nihqabsk', '2025-10-23 19:44:35'),
('99af8455510b3f9546c0c6bada06bb96f6f61b2128aca8173ad4f770d3bd25b1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:37:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5ODUwLCJleHAiOjE3NjE0NDYyNTB9.HKHb0ugweBLApl5t1qYzvFckwaLz4MM3-27f1NfQij0', '2025-10-25 02:37:33'),
('9a02199aadf40ddcf252cc3074bbecb1e40f451a11993f5aa2f0547ead3ebe4b', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 02:05:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ2NDExMTksImV4cCI6MTc2NDcyNzUxOX0.JKlwDj02rTuSL8VB7LMINT4x4dOvN9FnrAxSbv8psQc', '2025-12-02 02:06:11'),
('9aa1733fd5161760e5895af1348a16f12fc2c1d99dec29b1f60d5f440fa03311', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:45:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA5MTU4LCJleHAiOjE3NTQwMTI3NTh9.ky-u64D0Q6Xio7I_R1EcKdpnjdhzl6LpUGZf30uo5y8', '2025-08-01 00:48:35'),
('9b54b802bfbff5bed1bc740f98bf75fe961f7fcc097474e2ba020dc33e2a6d81', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:28:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNjIwOTIsImV4cCI6MTc1NDA2NTY5Mn0.purQkp745Fj8EGnyRDqQmtdOI2sokX5YUkykroM1XvI', '2025-08-01 16:12:48'),
('9bd1e913d909cbb6f3d59c585b81370a89bc55de64c225332293178a0255c377', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 00:18:45', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NjM0NzI1LCJleHAiOjE3NjQ3MjExMjV9.JczPHmLvblXQQD8eXEtP5wE5pd9kYqoQgYJIoS0JGIk', '2025-12-02 01:47:32'),
('9bd44b79323128238cf18767f9d30bac60a867c16dcf1dba1e018677d71e2c7d', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-25 20:14:44', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDIzMjg0LCJleHAiOjE3NjE1MDk2ODR9.LbLSB9-g5c4XilW_0LKy32poVHcon7f0bOtAzkEEwJc', '2025-10-25 20:15:19'),
('9c292c95353498adc56d704b063cf84e52b4e4ecef5dc254a615493e3596ff44', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 04:57:42', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjA3NDYyLCJleHAiOjE3NTQ2MTEwNjJ9.z_8WO5P4nr_k8e2Rjq0ATOaHloouiA8X3JsLIe9jlI8', NULL),
('9c34ef04ac102afb6590298fc51c793d73635e26efdac5eac3ed5362b9969f9f', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 00:52:31', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjM2ODYzNTEsImV4cCI6MTc2Mzc3Mjc1MX0.aehg59NjknG-PNq82CCvzl4k7Z_pznN72lxpEraZoVA', '2025-11-21 00:53:22'),
('9dbeddc4d45e2bda3bb7bc275c92cc4d51ee531eb7b391f664b5f6c992ae5d89', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 01:55:59', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzM5NzU5LCJleHAiOjE3NjI4MjYxNTl9.HkBtbFRaeLkSM6C8HwExRgL1oL-rUOVv22o60vQ_WF0', '2025-11-10 01:56:23'),
('9de6801a0682a0e3d1fc3860cdb57d22244fafada63d4b44ab9332c83a23d8c4', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:29:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjg1NDUsImV4cCI6MTc1NDMzMjE0NX0.5OaOE4H65olbRTVb1FNTEtb0xniOLU3f3APSI6cZ2S8', '2025-08-04 17:29:16'),
('9de719fe6859061d8d931f11cfc4227a594d5b3940fa4963e44fecf328f20be2', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 19:18:09', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0ODYyODksImV4cCI6MTc1NDQ4OTg4OX0.SE1T3sY_O4QoAnaHz_Htj3GuM38taDdJHYk9Hxml1IA', NULL),
('9f5967a7db8892b807de8bc19c3ce9ad8bd37be8c61a68ec13e34d5822b2d90b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-22 01:05:08', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNzczNTA4LCJleHAiOjE3NjM4NTk5MDh9.IGYTCxqEgrvATSoJimFbLeDj5gG8yrZLWpvLH8mw3qc', '2025-11-22 01:18:08'),
('9fbc374d868f86b8e32d5aabe54d6ccb7b56cf6d1e5c818af04155f780250248', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 01:39:30', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTk1NTcwLCJleHAiOjE3NTQ1OTkxNzB9.Dgs-oWsaqM-dm3dC_HuK6NIlq6xtGW1RQ-0AyWZsGVU', NULL),
('a012ffee50c078b2ee69bd276d88f7096f5c891adc8ac79120d9ac2290cecfad', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 06:32:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MjY3NTYzLCJleHAiOjE3NTQyNzExNjN9.xOpU_uby3G_kUi64hux6lPq-lVYcwNjr9ZW9Ox7PzaE', '2025-08-04 00:33:28'),
('a0469362fde2dd19135547ee10e843feb0a72e8aac6ca79136ffd8af9653cb94', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-16 16:15:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjU5MDE3MjQsImV4cCI6MTc2NTk4ODEyNH0.aFXROy9CwjNv3P7pWphGLSSTYPn13HaEaEqzY9cICDc', '2025-12-16 16:18:13'),
('a11c71ad7adafdcbc1760ba134cea369df73794ec05851a8781e0b01748e2a11', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-26 00:53:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDQwMDA2LCJleHAiOjE3NjE1MjY0MDZ9.mbUZlD8PJrEvHMSNu0BBCu0VORDs1Mbki4jVzkaPXvQ', '2025-10-26 01:27:36'),
('a22ccb0e3d1e4911d9b44e1c2adf5ad7105099ceeb89c7b9a1b89ab56d75b290', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 02:27:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ2NDI0NTIsImV4cCI6MTc2NDcyODg1Mn0.qkYsGxGPrQE5F6SwhrfYKK_KwT377LWh8zp2RD1zxPo', '2025-12-02 02:28:33'),
('a252f8f46b916b09bf55c276908cb695f15910329a48ba56bca6d7cf8ff84215', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:06:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwODM2NSwiZXhwIjoxNzYxNDk0NzY1fQ.mFVilKJHJKXwvaY0vybzUk_dk0NIoxoeFIxJUqX9FMI', '2025-10-25 16:08:39'),
('a3294cfa920a7bfe6c18b41a7adecd475975fea213812e0a3168d546fe6c0040', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 21:23:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNTg3NDA1LCJleHAiOjE3NjM2NzM4MDV9.Do8ziB22SOTutn-6mJi5Kd-3qALKamK3XyJmVjs1nyk', '2025-11-19 22:12:07'),
('a3ca1c857cbdc0094c410285d661c3eed49632530a20804022adb9223d4ae0a9', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 13:28:10', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjMxMjY4OTAsImV4cCI6MTc2MzIxMzI5MH0.hqweNvjJy282MdXnoIdRWw6gIlbNeDaa-nwPaLspTbo', '2025-11-14 13:30:48'),
('a41d5ea938a73325cee07689793babeb2d634833a6aa8b6570bec0a18c12a02d', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:13:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzLCJlbWFpbCI6Im1pZ3VlMTFtb25hc3RlcmlvMjRAZ21haWwuY29tIiwicm9sZXMiOlsibWVkaWNvIl0sImlhdCI6MTc2MTQwODgyMSwiZXhwIjoxNzYxNDk1MjIxfQ.qKl-1AiRqBYXL7suBm8GxZ_dVU6xHmnw49EltPjgg8c', '2025-10-25 16:22:44'),
('a6d2e1434688bc4f06685bc7c7d323b0affab8b05177d5c0b57b3ea8dacaa65e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 17:21:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA4ODg1LCJleHAiOjE3NjI3OTUyODV9.jNB-dzc3ARHODatoZQ9BVBJBq--haHsLq4ewRKUy6SI', '2025-11-09 17:22:11'),
('a888645e058b006c6a4658669c388778964c01680fefe094c41f2bd7f4b1a373', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:05:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU3OTI0LCJleHAiOjE3NjE0NDQzMjR9.EXti47BTfjq2M0KIyV2-DxXg9SgDnpbQuY2aRXA8IZ8', '2025-10-25 02:05:31'),
('aa9a00ee6eb4e4e7778ea3ff2a3086e95782c7eae01045fb71f0ebf4a57e15fb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:22:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MTUyLCJleHAiOjE3NTQzMzE3NTJ9.Glu2qfaEwDbk9xuAPI766g7aTPIapwYohDXBcsyrEWI', '2025-08-04 17:22:48'),
('ab651a2972f422b81b812d459a0a991e065eea5b84b62bd874e5eac91c58f5bd', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:42:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTA5MzUzLCJleHAiOjE3NTQ1MTI5NTN9.isuSYloG8E4Hm9lmBSehDKMZ8RoRnseNrCtl0_ORdJo', '2025-08-06 20:09:02'),
('abe368c4d0143dcf19b00caae4ccbbe9db74acf047ca896288e0b8c135a3ba86', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:24:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDkwMjczLCJleHAiOjE3NTQ0OTM4NzN9.v81D1tQc0Kaswf8C6o3ZV_jBf8t7RrN2C4gdIewuBJI', '2025-08-06 14:28:38'),
('ac363f19f0ea8cb2c6d535504de914e86509cf538c718126a5c7354ea0e08a11', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 20:32:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTk3MTcxLCJleHAiOjE3NjE2ODM1NzF9.QGFQTT1RxLBa4RRfyjra-gzbPaFEzSOioQqOWplCn3o', '2025-10-27 21:22:23'),
('acc758a30883f2f70ac8640b07058e2c739df3714cc0744f13c378c79a1d700f', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 01:47:53', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ2NDAwNzMsImV4cCI6MTc2NDcyNjQ3M30.iCVlO7cyD7CfdO5ec8DeRtydhSHf13oXPcfOp9hIvVs', '2025-12-02 01:53:27'),
('acf6be2056200a1007aa2c99c6672643679a9679790686837b5de1ed792caf1a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-16 16:13:06', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY1OTAxNTg2LCJleHAiOjE3NjU5ODc5ODZ9.j52cdAKlwTal76lL3LlqYXX-o-uq_F2GvIQIbFIdv1E', '2025-12-16 16:15:14'),
('ad0571a7a02d7a5492c28c61e4dcca0caa69ca09afc9a8901b18af389a218efb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 16:05:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA4MzI2LCJleHAiOjE3NjE0OTQ3MjZ9.S7egBxU5JyY8FHb8qCEebdfP8J28e7_pb_r-s1KghPY', '2025-10-25 16:05:57'),
('ae9e187be70e19c358ca7123618b5bab42a137b90ffa0ded3361516317eb7b4c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:10:11', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0NjExLCJleHAiOjE3NjI3OTEwMTF9.6Ev4pNeEGUedFJXec8A5yXow7lT2ScUaT4D62j68zuM', NULL);
INSERT INTO `user_sessions` (`id`, `user_id`, `ip_address`, `device_info`, `login_time`, `session_status`, `token`, `logout_time`) VALUES
('aebd0c74eaa92ed9289f2da310e387f2c4bb68409ae8d1b199b44404153fb59b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0', '2026-01-06 01:31:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3NjYzMTAwLCJleHAiOjE3Njc3NDk1MDB9.vsU_l4mn4Gubm_XfqjoGhBHIlWZbmWHD-xTWGlBo9WI', '2026-01-06 02:07:13'),
('aee1542248d81610138829a8811cec0d4e5913215a1a71213f400d1028f06706', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 00:59:47', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3MzE1NTg3LCJleHAiOjE3Njc0MDE5ODd9.KEUONKpJRA7RlDdJpdWTCUO74oazzov1nxpotpWt1Xs', '2026-01-02 01:08:05'),
('b10203f9f2c13bf2973c867312afcacc8d2b931b1a50a08195a48f20494b8a45', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 19:07:31', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzE1MjUxLCJleHAiOjE3NjI4MDE2NTF9.Xvy85-8pZ4rqm1fn8-PBeidCUBMke1afQfsdmXHuTTo', '2025-11-09 19:08:11'),
('b1ffb9f53fd48146f5d03e33dbabecc66e28d4ad8b8c2f017151e8d93094bcf0', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-22 06:21:15', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMDkyNDc1LCJleHAiOjE3NjEwOTYwNzV9.Ftaj0n1Th9KdLw4e1C1mKO2fBQxabGA3BSg1tf7gt9M', NULL),
('b263692b74ad0972633c16eaae7ed2bdcf1399d52583e99bde44a5c1ed39e9f1', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-11 07:57:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3NDYyLCJleHAiOjE3NTQ4ODEwNjJ9.zRHgDZBuKRk6pBG1Sz0iFmdpv2qYMcKhw5OxdtVO9lU', '2025-08-11 02:01:15'),
('b318d328857f1e9b2e9a2d2d4a3cb868a33596ad6e762fd533554ae348e9d4b8', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 19:28:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzAzNzEwLCJleHAiOjE3NjQ3OTAxMTB9.Tl9-J-wDHdZzuqcqRFH9GMMosiyORq27XHN5QZVLK1g', '2025-12-02 19:41:30'),
('b387494d9e24ee933ebcd83349c63e595fe79825c2e7f562614409c23b6e2acd', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 13:29:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2NDEwMTQ0LCJleHAiOjE3NjY0OTY1NDR9.9M3NAYanNRjkPMcmbfEY8z0KDzS1jb56VUJTypRNORw', '2025-12-22 13:29:53'),
('b38ead2b974df8143a8b1abf4d8cf41b374ccc5f08a3479578f5efa2422a39da', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 00:40:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyODIxNjM5LCJleHAiOjE3NjI5MDgwMzl9.53HOwjxHmTl-vaTJWZF6uSJRqRmwqExNJRM4Up_tgQ0', '2025-11-11 00:42:21'),
('b53210bd91516eeb6ba030ca218150bcd5fada7572b35d6d0d3f332aa606fb32', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 05:00:34', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4NDM0LCJleHAiOjE3NTQzNTIwMzR9.4bdfTU3MAdEw2uCQ1FxaIPfeVs_aHxaGLHqZVluPtXs', '2025-08-04 23:19:15'),
('b546859074afbd2f9c4b01c4d983e34b8577ef974f3079e85f0285eb9ab2cb49', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 06:09:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjExNzU5LCJleHAiOjE3NTQ2MTUzNTl9.cAMZgiW_EDOnX-TQxKGYaAg5UxIBIcJ6Cg3Ms4LMVmQ', '2025-08-08 00:10:12'),
('b7cb117c821a6bb9af7e9b36d3d97af23f4aa4e9a06071d3d3a70485cbdd3d1b', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 00:09:22', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ3MjA1NjIsImV4cCI6MTc2NDgwNjk2Mn0.ShLYobUXwpHF_UXG8tHPBpD1JIhSHLtxtmDxG5Jr-ig', '2025-12-03 00:23:31'),
('b80526a5a50a048dbb537ef4b770798047927709bdb81cfe5ca0698f94bfa7c1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 03:55:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDMwOTI0LCJleHAiOjE3NTQ0MzQ1MjR9.NP8kHtxFAGAce8FExeadJF03J3nL6GXWjhIHMgaCMcA', '2025-08-05 22:38:03'),
('b91f14b9031b24aeeb69bd27e540dab6085ee97b14f49e51f2d8b5588abed7b7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 15:14:34', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0Njg4NDc0LCJleHAiOjE3NjQ3NzQ4NzR9.2YKn7qdkHElIcrQrazBUlaoYP07YEBnY6HfgRM-Xs68', '2025-12-02 15:16:23'),
('ba664c5dee9f6047e977b9cca2bafd9c3d854ec9d62ea9778a09bceccba57851', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:03:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA2MjEwLCJleHAiOjE3NTQ0MDk4MTB9.gupgCSDnh4I_hsRjgOiVCpMCKt-DeotrUwKRxvTHjzo', '2025-08-05 15:22:56'),
('bae6f444cab02972a2294c22fed68f657e123489b79026471cd121e8850c8cf5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 21:09:05', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc5MzQ1LCJleHAiOjE3NTQ1ODI5NDV9.uC3_YoFxsc8tU1WuYqB3l3BhUWHSzseFjtr6hI1PR1E', NULL),
('bb436158918b88f87c8fbc963c5dc1f620e583b77d6d630026e28e267fcbbe88', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 20:03:39', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc1NDE5LCJleHAiOjE3NTQ1NzkwMTl9.qNnTyvPAP4Lg7_zYe2eEBrkabcJRljWoxywStZCi1MY', NULL),
('bd01103d16f5b0eb055dd711882ba97ab724b71a4c8ae13619555e22756f164d', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 13:31:03', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2MzEyNzA2MywiZXhwIjoxNzYzMjEzNDYzfQ.t3KVC1cfPq0y5vVlR0dLW1GiY84Fc_AcIthz6C5GQSY', '2025-11-14 13:32:03'),
('c0d612e0b4ee7cade213414ae012daf62c5f23d9c1025ef4eb68e9092af00aef', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 20:55:21', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjMxMzIxLCJleHAiOjE3NjEyMzQ5MjF9.P2kBQTUMEK2f-bTWiEyWVc4UeCAsde0sm0q-STGXzV0', '2025-10-23 15:48:58'),
('c15613c89b24a45700c4a831e62ae879411a9841e69aa6eaca3c96e6889f7dcb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 05:41:00', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzUwODYwLCJleHAiOjE3NTQzNTQ0NjB9.Zq3Av09k3oj6Y-tr4baRoGrfdZzUGj0NIORJIVmqppc', '2025-08-04 23:41:04'),
('c3186ef49ff3cbcfc853d83b950d1701ad7325bc934c2faa66465b54b1c8d1b5', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 02:28:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2NDY0MjUzMCwiZXhwIjoxNzY0NzI4OTMwfQ._TKKwCnFw6Ely9BHwSchGLnaMAQRktzT7ABH_7hNrso', '2025-12-02 02:30:27'),
('c3fac46dac9bdea93f9a6f6ef6b3fe284bafce209db575fd005a00399b17d1ca', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 01:20:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY3NDAzMjE5LCJleHAiOjE3Njc0ODk2MTl9.XHGGaQhpnVBIAV7ERebnVBvV9QYj7EbcsUgje9McbYc', '2026-01-03 01:21:11'),
('c5adc203977080e1259ebe41949999fb9fc3eee9b36d969f0b6dca57882b29a1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 15:29:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0Njg5MzgzLCJleHAiOjE3NjQ3NzU3ODN9.z_FXnb7ScATTJf2UJMxaR4iJvBiQ0ol7B5DNKyKSJtI', '2025-12-02 15:29:51'),
('c664e0911079e41e7e7ed7215c0a625bd8b28e633f0cb15a0054c7811c06cefe', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 17:02:22', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM2NTQyLCJleHAiOjE3NjY0MjI5NDJ9.GcUd2cjHXIDSCNiySM2VNqMtSfjUxaP9qgApkUKJQzg', '2025-12-21 18:56:37'),
('c68181b7dc90dd112122dcc0f0d6b404154bdb910df3d6be1ca704768a85a67c', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 08:04:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzU5NDY5LCJleHAiOjE3NTQzNjMwNjl9.aszjVW8VjMdfZD_BYA4DhUBpdHkETBfN2y2YbTF1dpA', '2025-08-05 02:08:32'),
('c685cc7a09abbab75ed6c0bb514a4d9ce2763cb67f93ecd931b96128a796657f', 26, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 02:33:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI2LCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTc2MjQ4MjgwNCwiZXhwIjoxNzYyNTY5MjA0fQ.dzyNQj7zVPaUSnCD8euY-FLLw4F76C2V73BTvSFzTFk', '2025-11-07 02:35:42'),
('c69b9187b9ea3b2229526bf9c80ca273b1eb32f5f2a5f2ac10d9c2dd474c49e3', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:28:48', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0OTA1MjgsImV4cCI6MTc1NDQ5NDEyOH0.33eiOHTeg-xuW5VzYJqfzHBAyPU5OJCPSLctjJ0ZP2c', '2025-08-06 14:29:05'),
('c8d764f45e455fb98238c9ba7a8fe2871901426e3a4477ea4f0080975d2ee591', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:55:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3MzM5LCJleHAiOjE3NTQ4ODA5Mzl9.SoPvE6ZCvTPdlajbOgT2RoYtZEPG5Zo8bBfoLzXzTxI', '2025-08-11 02:12:21'),
('c9583be2ea8e1a21a6bf7db85bab003cc297634b3da0c23fb1a28428b6d7c9de', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 07:12:30', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTI5MTUwLCJleHAiOjE3NTQ1MzI3NTB9.IhqmvKgwNkDTmWxXVAUxh8LoJZPS2YeX5O76UiaQhLo', NULL),
('cada10e932b4cefdff862186692a6652774aac345bf3f94f43842d12f75881be', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 04:38:08', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDMzNDg4LCJleHAiOjE3NTQ0MzcwODh9.eiwYSt3DPY7XE_rMvspPHxl3VIbx8Cph95zYWgr0YpI', NULL),
('cbcafba4a2b6deee3320313c67722c77dd5dc293ff226e3574f8ef28204489f5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:28:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM0NDk4LCJleHAiOjE3NjY0MjA4OTh9.WahvJZvpJKGeIodCBhLV2pTmw4oF1Hg3lslyTsQBlT8', '2025-12-21 16:28:46'),
('cd03a27ee6f73f4957d5a81e9e086d4362735113f7ed74b2274fdcd1e074a947', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-06 01:10:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0OTgzNDMyLCJleHAiOjE3NjUwNjk4MzJ9.IDnfA-VH40rLtMEsi8vxAgWqUvK3AtA8-FvaI--5Ml0', '2025-12-06 02:19:24'),
('cd14e4bcce4723bcc5295ac692b6b3051512a7a3f21dd9fbf778dcb248302bd8', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-17 16:17:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzMzk2MjIxLCJleHAiOjE3NjM0ODI2MjF9.5-cp6wkoyc9wltQFi9WFZNczxII3CaBtZGjVzgvmls8', '2025-11-17 16:24:05'),
('cd2671953df5199644d4679dfdebfc38d3c29d293a499ae78687eba98b19f8a9', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:05:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3MTA0LCJleHAiOjE3NTQzMzA3MDR9.yOCLpux3rjH2lAC75f6zGdNewPosVNJAxP7AksIo9DA', '2025-08-04 17:06:45'),
('cd66f502eac082bcb6567b7d0eb58421b8bb4b48f245401ad8df3c1c837e6ac1', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 06:51:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzU1MTEwLCJleHAiOjE3NTQzNTg3MTB9.RW5xCW6mW77mBO_D_5qQlPwVXJG0QFod245b-WUPbX8', '2025-08-05 01:45:18'),
('cea29cbb78a596c76949d4f394fb44d1b8859a55eda8611022603781cc6b7ab3', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 20:57:47', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1ODY3LCJleHAiOjE3NTQ0MDk0Njd9.ZtbNDq59HA7XBjooMbxQ7rYRDcliECMDeUiuHnBtp_g', '2025-08-05 15:02:55'),
('cf4ab04d9715e040273ca14b12dcc320f851351d2d798cca328e06686e0d5586', 11, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:13:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjc1OTMsImV4cCI6MTc1NDMzMTE5M30.EJ5OH01ShAnMJ9ZkM9ShQE8lOq1Mx9lTV6cMIEgD64A', '2025-08-04 17:27:23'),
('cf7ced66968a2fc753650e664b40de15e818148ecd0ee838692c5aca31e3d7cb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 00:54:10', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzMzNjUwLCJleHAiOjE3NTQzMzcyNTB9.AvCur8QPMg8RFEp0Kl68a-2JscdrK39PqjcfFtYQ19I', '2025-08-04 18:58:34'),
('d1aa0c8afc3445efcd536570ec8cfb9631625b177c8c5b39d2b86933b4594c32', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 19:57:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc1MDUyLCJleHAiOjE3NTQ1Nzg2NTJ9.mw2jEXZFOgwSGPoIsyKSDhelR2OU8Wdh0SbOdbvt3zE', '2025-08-07 13:58:46'),
('d2e0b86eb130686ef5cf80898494d60ecb665fa0c976e01e8eba75bc4563c8b9', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:56:48', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA3NDA4LCJleHAiOjE3NjI3OTM4MDh9.hr-nC6Mrtq8c2PbwIV6lgUaCV4alUOs4LP1TH-CTNio', '2025-11-09 16:56:52'),
('d2e6e2ef2dbdd42f7826fcb6e8619369c49482151289e766deaa81848b7dda8c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-28 20:58:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2OTU1NTIxLCJleHAiOjE3NjcwNDE5MjF9.6nDeaH4ixp-GOUKsRsTMe0pO7BNaMRpxrS7J3yWKA9A', '2025-12-29 01:24:25'),
('d32c0f712574f26d02f64775ae37f51aa818c18cc0deb632f6765de5240344d5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:03:02', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA2MTgyLCJleHAiOjE3NTQ0MDk3ODJ9.k4H6yCp33z8rAuXFIrbOzQGqT_pIn4Cq3qeH6pyX0GY', '2025-08-05 15:03:05'),
('d3fdaaf92d74cae7e8551c267b1f205cbd8c3c9aa4a4531801bdc2ac16d64126', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-28 01:35:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQyOTM3NTgsImV4cCI6MTc2NDM4MDE1OH0.kor3mGrObdKs3JspOCzodsoziurzH5ymbZyyWHS9VDw', '2025-11-28 01:36:31'),
('d4d587da193e48445b2130c92912b33d3da8d78b5f7d4b0c49989d8c381767b0', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 21:36:17', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNTE0NTc3LCJleHAiOjE3NjE2MDA5Nzd9.c1ma_k4tBmXmkjZRDv6YEZIavphsObpKdF7WvUvHPVA', '2025-10-26 23:35:42'),
('d56377e41efb34c912541492696219a6512c01bb8ddab6c3cedc80ff5c2dbd01', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 22:13:03', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDY0NzgzLCJleHAiOjE3NTQwNjgzODN9.GCt7PH1zos2Vton2LD3QmUlTTeDEkOBKWrtxbc3Ym0g', '2025-08-01 16:13:51'),
('d6ccd5a804acb23179b42f6820a0fdd903171122c01aae3751c34be0e7c68d92', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:08:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwMTEwLCJleHAiOjE3NTQ1OTM3MTB9.wg9Xb3Z8kOR6K21oKy3meZ5OEFZnk-CH0dzwkITNyUA', '2025-08-07 18:08:38'),
('d78f857ac3e81ffd06c3e74a5e4ab1ee9e9bf666fa391cdef553cde5cf2074d4', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-22 01:09:40', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI0LCJlbWFpbCI6InRoZW1pZ3VlbW9uYXN0ZXJpb0BnbWFpbC5jb20iLCJyb2xlcyI6WyJyZWNlcGNpb25pc3RhIl0sImlhdCI6MTc2Mzc3Mzc4MCwiZXhwIjoxNzYzODYwMTgwfQ.GJVDR5wy77t90X18TVVRE5NocC4j318XylEwQWzEl2g', '2025-11-22 01:18:16'),
('d7b5d9532ffe19d3214c5a4eb714885e2d24af4691234aa766b1aa3499d0ce12', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 00:08:56', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzIwNTM2LCJleHAiOjE3NjQ4MDY5MzZ9.Q9aj91f5Eob4XN7PBQqstbgQrEIrKseoBuVFGzQsjGY', '2025-12-03 00:09:06'),
('d80f6d0f8972c8a71a3b304cebb99663f8716c6cc0080cb40a7b42b69d3dc29b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-24 17:43:23', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2NTk4MjAzLCJleHAiOjE3NjY2ODQ2MDN9.Kd6uqNsBvfAhh13qq8fGf3Jfb4XU79bZpG4uUH_AaW4', '2025-12-24 17:44:39'),
('d8501019246c602466e7e2ecf1514bef0d311cdb038154697d7c59a9d980f58a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 18:38:17', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzAwNjk3LCJleHAiOjE3NjQ3ODcwOTd9.mzulKXHM8q36BMODC1j4GmaJ8QQQUVO8GwrDW42Kq3M', '2025-12-02 19:07:22'),
('d8c2a88fd2f1dc2905a12140d62839d5056c18930204f381f6c3294b0a115fb2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 00:39:59', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyODIxNTk5LCJleHAiOjE3NjI5MDc5OTl9.FVbQnXmTj_emSOMSIWwTCRRnJ-VgbkzvZaSTt7ZFQRY', '2025-11-11 00:40:02'),
('d900fb1c53d17e69645c8bf51b269a4a52fc07113bcbdf57e4229301fee93df1', 8, '::1', 'PostmanRuntime/7.49.0', '2025-10-23 23:46:29', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQxNTg5LCJleHAiOjE3NjEyNDUxODl9.lWYIswjlClVcuNDFN5hCGoZ52Y9ULmg-q2A9Pr9e6b4', NULL),
('dc0ab816cfe87eefd1ead86cc880c14abd583b5a35d08829ffb82f4ae1074cdc', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-20 22:01:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MjY4MTAyLCJleHAiOjE3NjYzNTQ1MDJ9.l0ElUpa2F4Ule6fcyb0fNKxeO6tBf4zviv-DebG_2dk', '2025-12-21 03:58:35'),
('dc895511b91c771de0c7627d762e57838487bd03efac2b180362b49467e88c1d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 15:59:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDA3OTgxLCJleHAiOjE3NjE0OTQzODF9.rABUL1RyS-jsH_dPEpadDYG-pa_8w_fgEDORASmg9sY', '2025-10-25 15:59:52'),
('dc97d45d88a74a2eaa76af9d6a3abe271a86bd9fb0edf441da3fa4c12ec139e6', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 08:56:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTM1Mzk2LCJleHAiOjE3NTQ1Mzg5OTZ9.JBV9cly46MYEBzAt5-w1Q3liKewfpMWWZEcct-k-QP0', NULL),
('df166e60df170ba644845915a6a0663678478e86311edd50616515e872b75a57', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 19:00:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyODAxMjUwLCJleHAiOjE3NjI4ODc2NTB9.yxzX5IT7KLxNK1cMToRynVv0ZDezsV7V3G1cNUp6AgQ', '2025-11-10 19:04:37'),
('df768302c420189b1c2a1468502eb1d4edde8cd95675477ebddc3e098b158dd5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 00:11:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzUxMDYxLCJleHAiOjE3NjE0Mzc0NjF9.pWnYo2N0gy0gZniCT2o6A9g_KWCZuDCD3HaWxxAbhnQ', '2025-10-25 00:35:49'),
('e0687b79e2dfa2cc021303314535d423f333b191125cdeeb3390e4d705a02749', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-28 01:37:34', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0MjkzODU0LCJleHAiOjE3NjQzODAyNTR9.6BA8MiD41pzcT98C8xBJsiLe-X2SiYZm-Uka3j6cgUg', '2025-11-28 01:37:45'),
('e141cbab7413c4dfcf1c08afe7533c986fd54cf9f6067ce67ed6f84860d49b4f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:13:13', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA0NzkzLCJleHAiOjE3NjI3OTExOTN9.V1DFnAwEqIVeHsm4xL00NLneFpEhhoIey3rCU8CHAP4', NULL),
('e1cc06a49c9a1428d033c6399fc956a15d98aaf264d6bcc8e230979f0c769f85', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-07 03:11:14', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNDg1MDc0LCJleHAiOjE3NjI1NzE0NzR9.lmdrp6CZwc1at5RffQL8J49TrUONAbtwqrH8I1THV5w', NULL),
('e1f88a379105277cb412f40e2fd49031f2b81f74a3768938c35b20e9fc8e940d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 22:13:20', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTgzMjAwLCJleHAiOjE3NTQ1ODY4MDB9.HD8i-ESThzUmyY87mRYhWaOsGKWnwsQwjaAEWxw93hE', NULL),
('e1f99663fd4f34f5e4522310a7b7008e3c1be53f61e6f3d0c8fb676c1c154629', 8, '::1', 'PostmanRuntime/7.45.0', '2025-10-16 05:13:05', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTY5OTg1LCJleHAiOjE3NjA1NzM1ODV9.bh-dnJ2xxQcl038KQfJCWI2D1HpmlBYHKlISvvb1lrc', NULL),
('e2b047c5f5a921d3fd9c0bc07a7135d6dc3da796363e97ca0792e77493d6dec1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:35:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM0OTEzLCJleHAiOjE3NjY0MjEzMTN9.d8nEVyiumKRjb9TQdHhfZ4H982QqxQft9UUqfxzdjVU', '2025-12-21 16:35:17'),
('e3a63e499d90b812bf62ec0c5e182c19105b368dcfb39251865c9f5c0145465b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:55:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI3MzI5LCJleHAiOjE3NTQ0MzA5Mjl9.NCIYIK1A81vsC0E0hxpCScm7ss55yVbxpmRGwxfwExQ', '2025-08-05 21:10:50'),
('e4f3321b121773949bf81a9f3766ed2b5184780247e5c0de8dd6845c826ad48b', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-27 20:25:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjE1OTY3MDEsImV4cCI6MTc2MTY4MzEwMX0.kZx2ptuJ-KSDWltMXACV5LgvSKtF_P4KbqHOrZaIDE4', '2025-10-27 20:32:46'),
('e57ea35847ae1b835fc8ae2b1859f2c505aabdc3822bc1fc334f08c3ccd3885a', 8, '::1', 'PostmanRuntime/7.49.0', '2025-11-08 01:59:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNTY3MTU4LCJleHAiOjE3NjI2NTM1NTh9.Sp6CdOWGLN7U_fZza-q3jpcZ_Ryb5iOjG7UzUnUNq04', '2025-11-08 02:03:40'),
('e5f04acab57c33aa75213664bfce3ed9744d29b72ee71d11ab99e64db3966e42', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 16:50:00', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0Njk0MjAwLCJleHAiOjE3NjQ3ODA2MDB9.RSPknMK4a0L5euBoeLg_ialNBLiIyGBo0VmkCR8qWq4', '2025-12-02 16:50:03'),
('e68c91160572d5e2e31011bccb191ada834b3e9d184746e095f79cc9bb62a004', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 02:09:07', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEwOTQ3LCJleHAiOjE3NTQ1MTQ1NDd9.Vj3sgZjKUzGELQt4YfrCq7VCa3EvD8-hWl483zvmxwQ', '2025-08-06 20:43:38'),
('ecf6e574167164634df22933fbde2caae97c15effdfcec4b666b534dd6993e49', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 03:11:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI4MjYxLCJleHAiOjE3NTQ0MzE4NjF9.LFxlPBOpnLrPBpknebWc3G8v-n2Rc37yDP52z3G5rSk', '2025-08-05 21:15:48'),
('ed906bdcb97fe5a736cc2958fef3dd3f61d4563d6ac324ee5081006686666f9b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 03:00:09', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0NzMwODA5LCJleHAiOjE3NjQ4MTcyMDl9.OXGXvHFS7AUcTyN-7ArZokFq9DgCjyf8wTamKcWH-_s', '2025-12-03 03:01:24'),
('ef048eaeb20a23cc5ea35ee50acc2107f2219cb2058f485e260f2a770b1a9e89', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 01:00:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzM2NDEyLCJleHAiOjE3NjI4MjI4MTJ9.SP0yGwgb2HuKUCqTyFmIrboka06xPvi3guJlnl2A6JE', '2025-11-10 01:55:41'),
('ef36e9d201ae2aefcb26e4c11ef38a2252a61dc6d8c6310d870a63cfd1ebdda7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 05:04:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTY5NDc2LCJleHAiOjE3NjA1NzMwNzZ9.O3k3aJ7Z_s-wILq-GnrLA2T3ZtRnF6GjxERAkkaCS6A', NULL),
('f020c2f8be228e032909d15ecdca8c4d8f67365fc1d7c186f3aaa348a470500c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 23:47:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNjQ1NjMyLCJleHAiOjE3NjI3MzIwMzJ9.Howuq5QCZBYqQMcF-Cm8dyta6VhT6d8JixnUJXzA55c', '2025-11-09 01:07:08'),
('f0275b3bf6fd222a892f562ff109f3e09379b2012fdd29adb4026b577c85e8af', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:48:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIiwibWVkaWNvIl0sImlhdCI6MTc1NDA1OTczNywiZXhwIjoxNzU0MDYzMzM3fQ.RVeCkv6RFKHeEqxn4-UsidANKVVwGZpEwOcyBb_VMN0', '2025-08-01 14:58:25'),
('f1980982ba2b9b661d6d55f7be65176c9517144740fb17a3acbb4939252fb86b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:23:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MjA1LCJleHAiOjE3NTQzMzE4MDV9.PhCZkaJQhfWK0DdeXup-IZYUDvzHch0fPaNMvNrp_xQ', '2025-08-04 17:24:37'),
('f220abb0ae7083c91fa62cf04be961642637ea87d67da759a9c25aaa1f23caad', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:19:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzMzOTU1LCJleHAiOjE3NjY0MjAzNTV9.0qwSov84DgtS2Dvo8oagvouV-nOI9-icc2kioJxuD-I', '2025-12-21 16:25:00'),
('f28a39ed1cd87e1e4c3533ffbe6918cb97fc243aa2ccb7d6166a889e125329bb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 16:17:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYyNzA1MDQ0LCJleHAiOjE3NjI3OTE0NDR9.E1hTOU0maqBUETZqGcVi_lYcezSlWhEZ7NmSzIylpS8', '2025-11-09 16:23:27'),
('f39d23f50a0190f65983b1735bf5d40696fe9e4435ad5bad427964936d163abb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 22:35:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzU2NTI2LCJleHAiOjE3NjY0NDI5MjZ9.uIbKUh5PLLoHKTN2jimAy2f2MXpn5aw2pal3oVCwKHs', '2025-12-21 23:34:52'),
('f3a4748129b2542a86d75ea83e0c9e6d9c4d41d7dde87550845e2a9eb7e3d339', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:51:27', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ5MDg3LCJleHAiOjE3NjEzMzU0ODd9.7eLRf9XFhjN-VLfMZB6CKH8p2ku_SciT3xthPEEMJyw', '2025-10-23 21:38:15'),
('f44a18080949f97747342cfad2bc01b1764cdb5deb63e30884fbb2979f9bbd11', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 01:25:41', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNjg4MzQxLCJleHAiOjE3NjM3NzQ3NDF9.YuEqMFpbAchqhQ_ow8b5e3eEk_1F5kQkNRuybGp4t2w', '2025-11-21 01:40:31'),
('f53b3803e7637144bc25c300ec6c96ef4663c310dc0701e09039dea29de0db76', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 02:34:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMzU5Njk3LCJleHAiOjE3NjE0NDYwOTd9.VkO5IxKHoCr5K8xWhRyFaWkt99DBzgiX_nybGAQCaKE', '2025-10-25 02:35:38'),
('f5467c7321f833abcb9164bcd9e42d3e776e1937ba9ccc5b5bfeedba40faad36', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:37:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNTkwMzUsImV4cCI6MTc1NDA2MjYzNX0.EMZ9e4FZAVseb82ZbTcFAONarE9_lQTQ9_ZO-qm7ol0', '2025-08-01 14:38:12'),
('f58587d88458cb18007ac215681c0a68975be529a42032915e935f4c70b0f4ac', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-25 23:13:38', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxNDM0MDE4LCJleHAiOjE3NjE1MjA0MTh9.TZVz6yEcUTPW46UX6l0oBMdWgfrThSxPw8V87Zq-15I', NULL),
('f6173b60fae8d83a15aed3953422f44d586c4390a6cf810fda728f75f25d0395', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 13:32:28', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzMTI3MTQ4LCJleHAiOjE3NjMyMTM1NDh9.2CgRd5jBV6PhCROmbxLcWASyAvqo0wQwS7VFqx6i9SU', '2025-11-14 13:33:33'),
('f624106850483beaa86d6cd13920ce64ac82a249c9aeab6fbee0084837f9f21e', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:39:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ1MDkxNTksImV4cCI6MTc1NDUxMjc1OX0.TsifnncyPQOlxnP8iSAHCzoBWW7WvAIyvPUZPBYZeH8', '2025-08-06 19:42:28'),
('f62c713bb85bbfdff122fa28daf8270060a0c269c0f4f46d85fa29da83551d96', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-28 01:18:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0MjkyNjkzLCJleHAiOjE3NjQzNzkwOTN9.RcHD3PmOk8subakHCPrGmp7ShsYmrhyrV1LoVmyNhLc', '2025-11-28 01:35:17'),
('f675d3558d73654dce8483490b46adb1561119f78376e51e75ccec639b6f38f9', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-21 16:32:26', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY2MzM0NzQ2LCJleHAiOjE3NjY0MjExNDZ9.HozKABueaU0HTSjwvkZDGC2Dqa2ohSs6eHLLDRT4Y_0', '2025-12-21 16:33:00'),
('f7b2c6a61d56087d28e713d6b8cbc15779f59819b9464c6817c21011fb489a24', 8, '::1', 'PostmanRuntime/7.39.1', '2025-08-06 08:28:37', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ3MzE3LCJleHAiOjE3NTQ0NTA5MTd9.-VASuhoUUAzb2y7pJFKA-QFlBgKdMoYENTnXAs1xw28', '2025-08-06 02:30:21'),
('f9be3caf10473c323a4ec0124684c6e76b0f6891c083aa2de1dda2dc7bfe2c45', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-26 23:10:08', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjE1MjAyMDgsImV4cCI6MTc2MTYwNjYwOH0.wy_vLiqs34qKT-yXvMGzjISIJEFIKwsJvQaLSOgXcjA', '2025-10-26 23:36:10'),
('f9fc9795f9d1b328d5372dfdcc8ace8c092e582887662ce21c9b4061f88d46b9', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-21 00:53:35', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYzNjg2NDE1LCJleHAiOjE3NjM3NzI4MTV9.sM5bcjY1-KxUryzMELGn_niaA1QxZ7x3EShXYICeoug', '2025-11-21 00:53:45'),
('fbf1b360b54401d5eed4fdbe5a85f9f3f53bfc5c09fe05075ed37ebe7a6f704d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 03:42:37', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjU1NzU3LCJleHAiOjE3NjEzNDIxNTd9.Jhm-g-UmslAPSqTfbyqXsTkP0-F5qnLJi2dGv__3oJs', '2025-10-23 22:50:47'),
('fc427e90dd0d5aab9786954d0daee35c2d86be17eb5791572e448b7dccad93f4', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 01:44:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYxMjQ4NjgyLCJleHAiOjE3NjEzMzUwODJ9.sWeMbUmMurP8_S4wMSqfIDSB510QDTEspqIQUNawKhE', '2025-10-23 19:51:15'),
('fc8199996711f9e14693bf44c7fe72875f15b7e97a22357dc24d01cfcb0b459d', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:28:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4NTE4LCJleHAiOjE3NTQzMzIxMTh9.91gaw4CsAmuEJKL1NF3BuUqmB5CZwHGCUPLnyBl4o6g', '2025-08-04 17:30:22'),
('fcf07f6c7ab39802c27b1cb9d59f95c785425e10502be7f2cd3328b426ce5d9b', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-05 21:18:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NjQ5Njk0OTMsImV4cCI6MTc2NTA1NTg5M30.k0RgqPTsWN4dwUtXRgM5C5CI5hl8tmBBtmw1UL2Fvek', '2025-12-05 21:20:56'),
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
(23, 2),
(23, 3),
(23, 4),
(23, 5),
(23, 6),
(23, 7),
(23, 9),
(23, 18),
(29, 25);

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
(2, 2, NULL, '2025-10-27 14:11:22', 120, 80, 82, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 2, NULL, '2025-12-31 15:16:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 2, NULL, '2025-12-31 15:20:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 2, NULL, '2025-12-31 19:26:36', 120, 80, 80, NULL, NULL, NULL, 75.00, 1.65, 27.55, NULL),
(13, 2, 9, '2025-12-31 19:44:04', 120, 80, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 2, 9, '2025-12-31 19:45:17', NULL, NULL, NULL, NULL, NULL, NULL, 75.00, 1.69, 26.26, NULL),
(15, 2, NULL, '2025-12-31 19:50:14', 120, 75, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 2, 9, '2025-12-31 20:02:37', 1230, 50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 2, 9, '2025-12-31 20:11:26', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 2, 9, '2025-12-31 20:11:26', 120, 85, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 2, 10, '2025-12-31 20:13:02', 120, 80, 85, 12, 35.0, NULL, 75.00, 1.65, 27.55, 'sada'),
(20, 2, 8, '2025-12-31 20:15:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 2, 8, '2025-12-31 20:15:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 2, 8, '2025-12-31 20:15:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 2, 8, '2025-12-31 20:15:14', 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 2, 11, '2025-12-31 20:24:21', 123, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 2, 6, '2025-12-31 20:26:24', 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 2, 2, '2025-12-31 20:27:56', 130, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 2, NULL, '2026-01-02 15:51:46', 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 2, NULL, '2026-01-02 16:00:24', 1230, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 2, 12, '2026-01-02 16:02:36', 123, 123, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 2, NULL, '2026-01-02 16:02:56', 123, 123, 13, 123, 123.0, 123, 123.00, 99.99, 0.01, 'asd'),
(31, 2, NULL, '2026-01-02 16:05:26', NULL, NULL, NULL, NULL, 1.0, NULL, NULL, NULL, NULL, NULL);

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
-- Indices de la tabla `billing_account_supplies`
--
ALTER TABLE `billing_account_supplies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supply_account` (`account_id`),
  ADD KEY `idx_supply_item` (`item_id`);

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
-- Indices de la tabla `inventory_batches`
--
ALTER TABLE `inventory_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `expiration_date` (`expiration_date`);

--
-- Indices de la tabla `inventory_brands`
--
ALTER TABLE `inventory_brands`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_inventory_code` (`code`),
  ADD KEY `fk_inventory_items_brand` (`brand_id`);

--
-- Indices de la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_movement_item` (`item_id`),
  ADD KEY `idx_movement_type` (`movement_type`),
  ADD KEY `fk_movement_user` (`created_by`),
  ADD KEY `fk_movement_batch` (`batch_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `appointment_medical_info`
--
ALTER TABLE `appointment_medical_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `appointment_status_history`
--
ALTER TABLE `appointment_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `billing_accounts`
--
ALTER TABLE `billing_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `billing_account_details`
--
ALTER TABLE `billing_account_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `billing_account_supplies`
--
ALTER TABLE `billing_account_supplies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cash_register_movements`
--
ALTER TABLE `cash_register_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `cash_register_sessions`
--
ALTER TABLE `cash_register_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `clinical_encounters`
--
ALTER TABLE `clinical_encounters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `daily_exchange_rates`
--
ALTER TABLE `daily_exchange_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `diagnoses`
--
ALTER TABLE `diagnoses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `inventory_batches`
--
ALTER TABLE `inventory_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `inventory_brands`
--
ALTER TABLE `inventory_brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `medical_colleges`
--
ALTER TABLE `medical_colleges`
  MODIFY `id` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `medical_history`
--
ALTER TABLE `medical_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `medical_preferred_schedules`
--
ALTER TABLE `medical_preferred_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `medical_reports`
--
ALTER TABLE `medical_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `medical_specialties`
--
ALTER TABLE `medical_specialties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `payment_receipts`
--
ALTER TABLE `payment_receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `physical_exams`
--
ALTER TABLE `physical_exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `progress_notes`
--
ALTER TABLE `progress_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `record_attachments`
--
ALTER TABLE `record_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `treatment_plans`
--
ALTER TABLE `treatment_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `vital_signs`
--
ALTER TABLE `vital_signs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

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
-- Filtros para la tabla `billing_account_supplies`
--
ALTER TABLE `billing_account_supplies`
  ADD CONSTRAINT `fk_supply_account` FOREIGN KEY (`account_id`) REFERENCES `billing_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_supply_item` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`);

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
-- Filtros para la tabla `inventory_batches`
--
ALTER TABLE `inventory_batches`
  ADD CONSTRAINT `fk_batch_item` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD CONSTRAINT `fk_inventory_items_brand` FOREIGN KEY (`brand_id`) REFERENCES `inventory_brands` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `fk_movement_batch` FOREIGN KEY (`batch_id`) REFERENCES `inventory_batches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_movement_item` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_movement_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

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
