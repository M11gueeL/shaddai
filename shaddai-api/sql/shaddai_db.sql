-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-10-2025 a las 21:31:04
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
  `chief_complaint` varchar(255) DEFAULT NULL COMMENT 'Motivo principal de consulta',
  `symptoms` text DEFAULT NULL COMMENT 'Síntomas principales reportados',
  `notes` text DEFAULT NULL COMMENT 'Notas adicionales del recepcionista',
  `created_by` int(11) NOT NULL COMMENT 'Recepcionista que registró la cita',
  `confirmed_by` int(11) DEFAULT NULL COMMENT 'Quien confirmó la cita',
  `confirmation_date` timestamp NULL DEFAULT NULL,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `cancelled_by` int(11) DEFAULT NULL,
  `reminder_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

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
(2, 'Juan Pérez', '12345670', '1980-12-04', 'Masculino', 'Casado', 'Santa Rita', '04121234567', 'email@email.com', '2025-07-28 23:09:31', '2025-10-15 23:42:54', NULL),
(7, 'Emilio Andrade', '12234234', '1980-12-04', 'Masculino', 'Casado', 'Santa Rita', '04121234521', 'email@exammple.com', '2025-08-04 00:57:22', '2025-08-04 00:57:22', 8),
(8, 'Lionel Andrés Messi Cuccitini', '26110310', '1989-09-20', 'Masculino', 'Casado', 'Miami', '04129991890', 'leomessi@gmail.com', '2025-10-15 23:43:50', '2025-10-15 23:43:50', 8);

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
(8, 'Miguelangel', 'Monasterio Salas', '31080925', '2005-11-24', 'Masculino', 'Palo Negro', '04243316242', 'monasteriomiguelangel81@gmail.com', '$2y$10$03jo4oyAlcJQ2wKqV.2J1egVyr2E09kqdG1kqAYIjgQG41F3Aaeqm', NULL, '2025-07-30 20:56:13', '2025-08-11 01:56:06', 1),
(11, 'Jessir Nacary', 'Bravo Monasterio', '19514942', '1989-03-16', 'Femenino', 'Palo Negro, Urb. Santa Elena calle 8 casa 6', '04244435711', 'jessirnacarybravo@gmail.com', '$2y$10$7arddun7URMM/AoC5PN9/.I9B3GzlXq4oDXL9z1XCFbO21FqSc/6S', 8, '2025-08-01 00:36:04', '2025-08-11 02:04:42', 1),
(23, 'juan', 'de la torre', '20989787', '2025-08-14', 'Masculino', 'Palo Negro', '04241231212', 'juandvp0303@gmail.com', '$2y$10$8MZrNLqe9SypSVixel9d8uVMCIaxPFb3a4/h070OxRs94eMdHc/a6', 8, '2025-08-11 02:11:27', '2025-08-11 02:12:06', 0);

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
(23, 2);

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
('02231a51c290a7949da05f35bf3cf58891e4ed4812884a6c52daab04e7b9ec22', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 06:55:59', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MjY4OTU5LCJleHAiOjE3NTQyNzI1NTl9.Du_AKFcWRUby8DQw0Gl1s13Er8U28pVeFS76V2gBORk', NULL),
('02469167a7ae13bc86a2e17a535f2909f6ca3ecda76d75f68c9219676505b3c9', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 03:04:40', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQxNDgwLCJleHAiOjE3NTQzNDUwODB9.YxtHUdyIZfNeS8l_NunIfnyzFWx2DU5mvJlAMiLfXMA', NULL),
('025ebf5e29abaedaad6168408afe334c0f892cce9f2683206062d828fcf6feed', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 02:43:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEzMDIzLCJleHAiOjE3NTQ1MTY2MjN9.TsSbefwX9XQ1Wei1e-AjiWW5VAd5H44GUQPHfazPSwA', '2025-08-06 20:59:55'),
('03f44ca9932fdcc8bc86d01968f1e211bebe75c3509340e8d44e255dd7e66139', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 01:05:25', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzM0MzI1LCJleHAiOjE3NTQzMzc5MjV9.eRAwtbzSQJC1Iu8pG63qbFqYNMETEPXNW5u42KEQF7g', NULL),
('069eb5e8f826158596b6c1889453ebbe475e2af5abac7d6862021f6a7c197cb4', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:16:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwNTk4LCJleHAiOjE3NTQ1OTQxOTh9.wyKKMG9MGbiy2AEp9S0jm6BXTJZveCvDar0cEMg08nI', '2025-08-07 18:16:56'),
('0e701a2095c4ff049dbc0c998a66fef31890de5f9ed08d6c33691c4ae964b91c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:53:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ1MTkzLCJleHAiOjE3NTQ0NDg3OTN9.dmB45Gfta4fi5TLcVnel4-p7o4PoUdIBCh6UKHO5qUo', '2025-08-06 02:31:29'),
('151b03a7ff9c4b3677feb00a6bb5f966e69a972bf359b6e94ec0c7e03c114be1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:34:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTA4ODUyLCJleHAiOjE3NTQ1MTI0NTJ9.vZRg59hN-XHRwkv997JL78doS9VNfyK8sOKkVb8yUuw', '2025-08-06 19:37:25'),
('1aafdb4cbb73d1f1a78f3b96ebcc4a73be590a4a2e06aaa774e55734a22fe5d2', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:15:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwNTUwLCJleHAiOjE3NTQ1OTQxNTB9.x9Zfeq4X5PugA8TSxvbJezLeE6Tk2FaSHI45-IbsYZI', '2025-08-07 18:16:27'),
('1b3016fd79c9d435473ab282d8aa1d76b32e369178ee45a671ccca023daa104d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:52:56', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI3MTc2LCJleHAiOjE3NTQ0MzA3NzZ9.Ryl0oA0yrx6bM_LmjjaRwax8FgZZv-Eogk1AUp8Qbhc', '2025-08-05 20:55:23'),
('24709891e3ab7bfcfabb322dcd7e6ec77e3a3b633e5a00ecf7da00df8eb79dce', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 19:14:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDg2MDQ0LCJleHAiOjE3NTQ0ODk2NDR9.PQWnn9BW8u5ezBY51ZMsQwZ-Abe-zT1mrUYrrPKE6rk', '2025-08-06 13:18:01'),
('26666e2592e8f12b5cb132a5d4398d85880ca10f665850171eee989e8cf57483', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:26:31', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjgzOTEsImV4cCI6MTc1NDMzMTk5MX0.8gtOIhzbcYHghu3KZo23tSMGD_NHpB2Zpmu5D3A2_mg', '2025-08-04 17:27:07'),
('2a147347ed3f1fe0e27a9c689ad78ca00a2d3b68fbe590fc43edc7b1a2781ff8', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:11:31', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3NDkxLCJleHAiOjE3NTQzMzEwOTF9.fy0QXflcBsamJYDtHUcYZ0P4RZcZrZ629yTD1BtTrfc', NULL),
('2b09d38e8cd348d330a0b03cc527952a9b712be8fc75993dead5349ee9aefa79', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:09:06', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQyNTQ2LCJleHAiOjE3NTQ0NDYxNDZ9.HwTL7ALGP--S59OihLkFTc-hZUKep5ITrg6yYGvUVzw', '2025-08-06 01:14:46'),
('32a1ca8477fc0c6bd83e20464d26e932a167ed34770ee2349579a3fe497a9f69', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:11:55', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3NTE1LCJleHAiOjE3NTQzMzExMTV9.K8I2cCPcpzL0-sSby72Ed85EYJa6pA-baHbWRamlhBE', '2025-08-04 17:12:39'),
('364fa2779f2c90495a21677ec0d41c9c1e97c595938ed0916f6c18bd31787eb4', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-08 04:38:02', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjA2MjgyLCJleHAiOjE3NTQ2MDk4ODJ9.QLF-m_r4CGABdvs4bhr3Eh6Y435icYM7tuxei1zqA1A', NULL),
('3675779817768b63b776a1723a1661c1f23643ca6fabac8ba9dac3970c48f3d2', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 02:25:48', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTkzNTQ4LCJleHAiOjE3NTM5OTcxNDh9.YlbqlIilF15HNilGhhzA4kz1EOxP_dj0d9mtePutfKQ', '2025-07-31 20:28:48'),
('394b58740d6bc888a68b1ed23fc5c5a9d15391bc6f8a2fb95b2300ece606393c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 19:32:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTM1MTM1LCJleHAiOjE3NjA1Mzg3MzV9.kHsXsROPBqqZ5k8CfdppT9ARetrMsEBc8Y6qVxrAU9w', '2025-10-15 14:29:45'),
('3b26e6fe449548eeac853962b0fcedd66bc3c12e2a30adbf076aea376ef40984', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:33:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI2MDA5LCJleHAiOjE3NTQ0Mjk2MDl9.3NjAFxhY9k5PBIicw83C9WIbybkBwZPxbV54OKxO0vE', '2025-08-05 20:52:51'),
('3bce1ff2922c1a7923183243755b5e2362ad95555425426a67f20adc61422e85', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 08:31:35', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0NDc0OTUsImV4cCI6MTc1NDQ1MTA5NX0.xgbY-QKvXR5JeZNxSplB1ROf7m-7mRGXc-Ao7dzHYek', NULL),
('3c3a1e4f9af672e7896aefe4b42be4e5c258153328425e8d71ad787848d8ae50', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:59:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNjAzNTksImV4cCI6MTc1NDA2Mzk1OX0.MWCc05wIIyRzUkqBcmuUEp2IgFJtZLKk9RRew67pMs8', '2025-08-01 15:00:21'),
('3d952261cf8e370f464ab054a6fed2060c4f9963370f03eec4ad278cfe975454', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 06:06:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTczMTY0LCJleHAiOjE3NjA1NzY3NjR9.jueJlXLGtC34q4y44IbAbaufZ2Ny3DK-GsqNKMQywhs', '2025-10-16 00:21:28'),
('3dd0ca1392abbee9044b3b2e9bd66f48aebe3af3367bc24d1f72ad11433505cf', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:27:43', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4NDYzLCJleHAiOjE3NTQzMzIwNjN9.40zQV6dlSdOpOpGGEs-3uJ3rh9ciQ7EnODVB0C6JZto', NULL),
('3df7fe5c1766eb50ac3818c3b5ccd3e248c15e7b4d1dbff863afb68e370efff7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 07:11:45', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTI5MTA1LCJleHAiOjE3NTQ1MzI3MDV9.J4ximnifTYgJpFBofxipuAQST7eQr4ne4iyEGHpSY9I', '2025-08-07 01:12:19'),
('3f8b5de15fd497be7e1d93102a6ba23d22fb97ea6aff64a978a2b1e11e1680c5', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 02:58:04', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQxMDg0LCJleHAiOjE3NTQzNDQ2ODR9.jnQ9Dc6qOeLe6mPc80hvoxQGgpVN7l2mMSZRMqliR7I', NULL),
('4554adcf40b4cec4756561051ac47a0e1ad5e8ccc9f927c3cb1672444841b298', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:26:37', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA3NTk3LCJleHAiOjE3NTQ0MTExOTd9.cGbT3bUVApK6-TIxo0IBTU30tXqe9FPvPJoHu4uv3I8', NULL),
('46071c7170802079143cae400b3fa2facf9177a1fcbc9009ae6a85b14a42d691', 8, '::1', 'PostmanRuntime/7.44.1', '2025-07-31 20:50:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTczNDA1LCJleHAiOjE3NTM5NzcwMDV9.tbjh7zupnGEAv5qpjd1pKxzoVtosKPIne7VEZgyi0Ig', '2025-07-31 15:14:33'),
('491c65ce1ed7acf9d2577514cc67f09c61ae98b8da05b4ea7b6791e5dcb1967a', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 03:19:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTE1MTc2LCJleHAiOjE3NTQ1MTg3NzZ9.NJDZ2CwKiSvdfzJvy-RthpsIRKA6i7bRaQU29GNdvlQ', NULL),
('4c33c092e19c2d0d3bc876ea6f96153b35db1a46019decdbfa206b53c1f68261', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:30:04', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA4MjA0LCJleHAiOjE3NTQwMTE4MDR9.xDM5GJZM4aRB2eM7AEGZnpncIk_Q9sZrC0_IiGKACfA', '2025-08-01 00:38:37'),
('4cf8ba7b225d55585dee794c5147b4c6496d7fea831dd38269cd5ddae778d438', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:34:51', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkxNjkxLCJleHAiOjE3NTQ1OTUyOTF9.lkA8kQc11RF2W5SXsWhF6S5M-f0FLzItTZ5kFS87s6k', '2025-08-07 19:34:28'),
('4d62483b6e66291235607f0fc6a865a17e4e191a800c8e87eb4e817320ad3054', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:10:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMDA1LCJleHAiOjE3NTQwNjQ2MDV9.X08QpkkVpiWCdkU0H4EtcJfdRYNdCCxGQUDJ83FtaTI', '2025-08-01 15:10:59'),
('4d657148488e317a4f6c5087d84cad8784900e25a7c0e137fc796e5d31fc059b', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 02:56:28', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQwOTg4LCJleHAiOjE3NTQzNDQ1ODh9.VRRJ1Eu6qd6EjELDz5rcj4mXnuNl_5uV_7_Lk5cYxd8', NULL),
('4e434bbef3f1dc127081690f78a82e7e86b09d5b1fa89631409c01a66cd67b2f', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 03:00:22', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTE0MDIyLCJleHAiOjE3NTQ1MTc2MjJ9.AArPV8fohDpelUFLJFebbwsv4i0aVpY-X200RZEr9L8', '2025-08-06 21:19:24'),
('4eac8ee189f12ecb8903c902c74fd3bff8c5704d048b44171df514b7d7279138', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:55:18', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ4NzczMTgsImV4cCI6MTc1NDg4MDkxOH0.tdXjw7Jhl10CRYTPZLedZXyrVCl7UQAVcBPF1TRfxnk', '2025-08-11 01:55:33'),
('571b639a459b7f85d0496349e2cac169a8040d3118492db2e19921d50e3e33bb', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:45:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA5MTM5LCJleHAiOjE3NTQwMTI3Mzl9.9vQ2IYvHacVQ3xZtGLwJujHCJp6nK77x_QQ_Y7MWcyI', '2025-08-01 00:45:52'),
('59504939f0d4511315039864f562c85a5d202fede475b1eb03d549416a696e4e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:14:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQyODk3LCJleHAiOjE3NTQ0NDY0OTd9.OcTBgi4TtQkN75bMVUaIRHu70JkIwrF6qKnLPRioj4A', '2025-08-06 01:27:44'),
('5fa6ee327282fec2559039bfa51caf99172b723034dc5a554ad15e8c983c4227', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:47:13', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzUxMjMzLCJleHAiOjE3NTQzNTQ4MzN9.4iK8i-wp1RbazTuPHnnA1D9jWMKUCgOitZPdRbgBAnU', '2025-08-04 23:53:43'),
('6584129f54351d63132b719b96b07157736a2c314b96658dcc8fe407838b09df', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-07 07:53:45', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTMxNjI1LCJleHAiOjE3NTQ1MzUyMjV9.SvLci9-T2J27p9rE1a_IdB3zZ4_3mcCfB3cTpODx3Qc', NULL),
('67521295e45717c8fa13c401b3a6ddd214eb9b01e03b493f774e5d10ec278e9c', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 20:52:23', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1NTQzLCJleHAiOjE3NTQ0MDkxNDN9.6rwJ4tIH-nPAS8AuOJT9y4H6kPF3r8lFev1fq_iTCFE', '2025-08-05 14:52:47'),
('698b9fa0585baa1dbd312ce2d2ab59bfd519ddb7398daf91ed8058e233043b81', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 07:27:50', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQzNjcwLCJleHAiOjE3NTQ0NDcyNzB9.1KVfwZa1dFNvSM7hNHxfWK1AGyfJGJqrsRlZiYTtPkY', '2025-08-06 01:28:02'),
('6a7f4f51c7de4af9962e43794c3bc6f8e8f3c694294f24ea698ca345af814e0a', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-07 01:58:53', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEwMzMzLCJleHAiOjE3NTQ1MTM5MzN9.pY8YuKUuFCX2-z9uJsbp-Q1hkqbSMPydbdtNef9wkOM', '2025-08-06 20:00:54'),
('6ac8bced984fbe9e5a0eee6950d60d30ce48df44a0ef68632141dd4c3d990ed0', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:35:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDkwOTU3LCJleHAiOjE3NTQ0OTQ1NTd9.Mo9Nma8aM3mRRWBNTyxN1HMw1PHKti0ySeUUh0M5VCQ', '2025-08-06 14:43:25'),
('6b510c87089f01106c7cd2d9cd32fb0dbeb3b2dffb96d3fe9449359ea26f7164', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:25:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MzMwLCJleHAiOjE3NTQzMzE5MzB9.bzFwvrreOMEKsso-fdmaDzuB-9flnJKTSmqyucXGbV4', '2025-08-04 17:26:25'),
('7094f1cfda1fae753ec011ca85f1d8fabe1010a813fafc31b40ec2b8963d1e25', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-06 08:30:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ3NDU3LCJleHAiOjE3NTQ0NTEwNTd9.OKPgK68UOTTeEwdmS424toiN0AmI4_zhohW4-dWNV0U', '2025-08-06 02:52:00'),
('7112ed3487ecd1f65385f0acb4cf88941bbbf0e0912a9520bf49c631980cfa89', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:13:14', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMTk0LCJleHAiOjE3NTQwNjQ3OTR9.oyVUnx39twtCguWjcnmZHFW-qygixeY8fkj_RdOYELE', '2025-08-01 15:13:27'),
('754f9b616896a40e18ead4f877c125b1e75055f58e29ced60d9c4a36fe565514', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:43:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0OTE0MTAsImV4cCI6MTc1NDQ5NTAxMH0.HamDqMSWb9Mtu47IVlfz1OPnyDKDhkn2i_ZhDdu5d04', '2025-08-06 14:43:56'),
('763cf5577ccad57de406939daedcf2e07fc6bba3701a23f17bc2e80ba130f150', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 20:54:17', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA1NjU3LCJleHAiOjE3NTQ0MDkyNTd9.F8LnMHWepGUG97RZ6d2v9-vnLd7QRHK-9gDsfULtjdc', NULL),
('765a0fca079f24b95f60327b6852102b9cde2490bd3bc11e9ab4c09620fe1aea', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:38:44', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDU5MTI0LCJleHAiOjE3NTQwNjI3MjR9.AN5JSG10uw9SAwoZ5mLjWw7G16gp3ru4nrX5auwHCt4', '2025-08-01 14:47:59'),
('7750bdac1997bf8c9a6ae6e3d171826d07000980d65697dc9e81928c122dff6a', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:06:39', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4Nzk5LCJleHAiOjE3NTQzNTIzOTl9.WZ2zFHk5bkWpG6ck64j9XRBcPEkIuglmUQSXMzfzyfM', '2025-08-04 23:10:22'),
('7af72eb230364f7bc3c699e12e7322fe9f7c127d8b275e7561d03e85c8b58367', 8, '::1', 'PostmanRuntime/7.44.1', '2025-07-31 21:15:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzUzOTc0OTAxLCJleHAiOjE3NTM5Nzg1MDF9.Hns3WYWFY7o6eJF14HrN1cLLfMNwO7GPGW8yitlPJto', '2025-07-31 15:15:23'),
('7b1115fbfdb6244af30837bcd62d308669efd8619738c52a6acc7d71aed98f0b', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:26:54', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYyMDE0LCJleHAiOjE3NTQwNjU2MTR9.k_wBa-tDlxapZdntVTlbbImUdCfTw_BZoDQapI2B0dc', '2025-08-01 15:27:49'),
('7bc078e2f30e090c2d88a700b4203849197065dfc00ed5d31020b5c5360343f3', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-05 05:06:48', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4ODA4LCJleHAiOjE3NTQzNTI0MDh9.wNjuz1yhC_eB-JZl9zkaC-EzcUFpevHWyd6pnMaHphA', NULL),
('7f23e7c2a56795d4c6954fcbe4742214e362d44f94e9692ad51174c27867849e', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-11 07:51:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3MDYxLCJleHAiOjE3NTQ4ODA2NjF9.ZuXbBOQWtqckrSmkT4zYiLXIZtNXvlmU7aHdaR-aZ3E', '2025-08-11 01:55:06'),
('88dfeb93fae572748ac458f86ce4af5d1f2c53fc768bb1fb53a4e3eaa15393cf', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 07:22:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDExMzM5LCJleHAiOjE3NTQwMTQ5Mzl9.Rhvb7UhcXpFowXZ0MBWBBbD6SAybDOHxzEbT0G3cJeE', '2025-08-01 01:32:15'),
('8977a2d691e2b84d5452a711f670e54984d0075ac9a4f6a5fd82b49d6e6ef35f', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:04:10', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI3MDUwLCJleHAiOjE3NTQzMzA2NTB9.jtUPGcOLeQE-OTkWuGYh7H1SDQbBdffCc12PMuy4zHo', NULL),
('89a94e08d30b20156c2532e40573ba2a0f02a3661644fa09d763e7aa17a0e21b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 08:14:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTMyODk4LCJleHAiOjE3NTQ1MzY0OTh9.zWkQ-G3f4gi-HpCUIbgrnyHKTvVdGfTwd_qtdKn3sq8', '2025-08-07 02:56:21'),
('89ab06cb68173478e7fffc830468a0053efaf519eaec5018362c2f7a3f46ffcf', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:12:16', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDYxMTM2LCJleHAiOjE3NTQwNjQ3MzZ9.poYdj8Ml3WCizDf9yJZ3bnXsn1OiUP38XVIpwbnOEcE', '2025-08-01 15:13:08'),
('9591aa7df93152b75a57a319b71d7214918c27d3934779a001e413f321c8894c', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:39:10', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwMDg3NTAsImV4cCI6MTc1NDAxMjM1MH0.cy6m1V3m8rwHPOGGno9SZRnnN_eD6qb4hvWxX9VbC6U', '2025-08-01 00:40:38'),
('9aa1733fd5161760e5895af1348a16f12fc2c1d99dec29b1f60d5f440fa03311', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 06:45:58', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDA5MTU4LCJleHAiOjE3NTQwMTI3NTh9.ky-u64D0Q6Xio7I_R1EcKdpnjdhzl6LpUGZf30uo5y8', '2025-08-01 00:48:35'),
('9b54b802bfbff5bed1bc740f98bf75fe961f7fcc097474e2ba020dc33e2a6d81', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 21:28:12', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNjIwOTIsImV4cCI6MTc1NDA2NTY5Mn0.purQkp745Fj8EGnyRDqQmtdOI2sokX5YUkykroM1XvI', '2025-08-01 16:12:48'),
('9c292c95353498adc56d704b063cf84e52b4e4ecef5dc254a615493e3596ff44', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 04:57:42', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjA3NDYyLCJleHAiOjE3NTQ2MTEwNjJ9.z_8WO5P4nr_k8e2Rjq0ATOaHloouiA8X3JsLIe9jlI8', NULL),
('9de6801a0682a0e3d1fc3860cdb57d22244fafada63d4b44ab9332c83a23d8c4', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:29:05', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQzMjg1NDUsImV4cCI6MTc1NDMzMjE0NX0.5OaOE4H65olbRTVb1FNTEtb0xniOLU3f3APSI6cZ2S8', '2025-08-04 17:29:16'),
('9de719fe6859061d8d931f11cfc4227a594d5b3940fa4963e44fecf328f20be2', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 19:18:09', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ0ODYyODksImV4cCI6MTc1NDQ4OTg4OX0.SE1T3sY_O4QoAnaHz_Htj3GuM38taDdJHYk9Hxml1IA', NULL),
('9fbc374d868f86b8e32d5aabe54d6ccb7b56cf6d1e5c818af04155f780250248', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 01:39:30', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTk1NTcwLCJleHAiOjE3NTQ1OTkxNzB9.Dgs-oWsaqM-dm3dC_HuK6NIlq6xtGW1RQ-0AyWZsGVU', NULL),
('a012ffee50c078b2ee69bd276d88f7096f5c891adc8ac79120d9ac2290cecfad', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 06:32:43', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MjY3NTYzLCJleHAiOjE3NTQyNzExNjN9.xOpU_uby3G_kUi64hux6lPq-lVYcwNjr9ZW9Ox7PzaE', '2025-08-04 00:33:28'),
('aa9a00ee6eb4e4e7778ea3ff2a3086e95782c7eae01045fb71f0ebf4a57e15fb', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:22:32', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MTUyLCJleHAiOjE3NTQzMzE3NTJ9.Glu2qfaEwDbk9xuAPI766g7aTPIapwYohDXBcsyrEWI', '2025-08-04 17:22:48'),
('ab651a2972f422b81b812d459a0a991e065eea5b84b62bd874e5eac91c58f5bd', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:42:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTA5MzUzLCJleHAiOjE3NTQ1MTI5NTN9.isuSYloG8E4Hm9lmBSehDKMZ8RoRnseNrCtl0_ORdJo', '2025-08-06 20:09:02'),
('abe368c4d0143dcf19b00caae4ccbbe9db74acf047ca896288e0b8c135a3ba86', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 20:24:33', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDkwMjczLCJleHAiOjE3NTQ0OTM4NzN9.v81D1tQc0Kaswf8C6o3ZV_jBf8t7RrN2C4gdIewuBJI', '2025-08-06 14:28:38'),
('b263692b74ad0972633c16eaae7ed2bdcf1399d52583e99bde44a5c1ed39e9f1', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-11 07:57:42', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0ODc3NDYyLCJleHAiOjE3NTQ4ODEwNjJ9.zRHgDZBuKRk6pBG1Sz0iFmdpv2qYMcKhw5OxdtVO9lU', '2025-08-11 02:01:15'),
('b53210bd91516eeb6ba030ca218150bcd5fada7572b35d6d0d3f332aa606fb32', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 05:00:34', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzQ4NDM0LCJleHAiOjE3NTQzNTIwMzR9.4bdfTU3MAdEw2uCQ1FxaIPfeVs_aHxaGLHqZVluPtXs', '2025-08-04 23:19:15'),
('b546859074afbd2f9c4b01c4d983e34b8577ef974f3079e85f0285eb9ab2cb49', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 06:09:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NjExNzU5LCJleHAiOjE3NTQ2MTUzNTl9.cAMZgiW_EDOnX-TQxKGYaAg5UxIBIcJ6Cg3Ms4LMVmQ', '2025-08-08 00:10:12'),
('b80526a5a50a048dbb537ef4b770798047927709bdb81cfe5ca0698f94bfa7c1', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 03:55:24', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDMwOTI0LCJleHAiOjE3NTQ0MzQ1MjR9.NP8kHtxFAGAce8FExeadJF03J3nL6GXWjhIHMgaCMcA', '2025-08-05 22:38:03'),
('ba664c5dee9f6047e977b9cca2bafd9c3d854ec9d62ea9778a09bceccba57851', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-05 21:03:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDA2MjEwLCJleHAiOjE3NTQ0MDk4MTB9.gupgCSDnh4I_hsRjgOiVCpMCKt-DeotrUwKRxvTHjzo', '2025-08-05 15:22:56'),
('bae6f444cab02972a2294c22fed68f657e123489b79026471cd121e8850c8cf5', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 21:09:05', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc5MzQ1LCJleHAiOjE3NTQ1ODI5NDV9.uC3_YoFxsc8tU1WuYqB3l3BhUWHSzseFjtr6hI1PR1E', NULL),
('bb436158918b88f87c8fbc963c5dc1f620e583b77d6d630026e28e267fcbbe88', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 20:03:39', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTc1NDE5LCJleHAiOjE3NTQ1NzkwMTl9.qNnTyvPAP4Lg7_zYe2eEBrkabcJRljWoxywStZCi1MY', NULL),
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
('d56377e41efb34c912541492696219a6512c01bb8ddab6c3cedc80ff5c2dbd01', 8, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 22:13:03', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MDY0NzgzLCJleHAiOjE3NTQwNjgzODN9.GCt7PH1zos2Vton2LD3QmUlTTeDEkOBKWrtxbc3Ym0g', '2025-08-01 16:13:51'),
('d6ccd5a804acb23179b42f6820a0fdd903171122c01aae3751c34be0e7c68d92', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-08 00:08:30', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTkwMTEwLCJleHAiOjE3NTQ1OTM3MTB9.wg9Xb3Z8kOR6K21oKy3meZ5OEFZnk-CH0dzwkITNyUA', '2025-08-07 18:08:38'),
('dc97d45d88a74a2eaa76af9d6a3abe271a86bd9fb0edf441da3fa4c12ec139e6', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 08:56:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTM1Mzk2LCJleHAiOjE3NTQ1Mzg5OTZ9.JBV9cly46MYEBzAt5-w1Q3liKewfpMWWZEcct-k-QP0', NULL),
('e1f88a379105277cb412f40e2fd49031f2b81f74a3768938c35b20e9fc8e940d', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-07 22:13:20', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTgzMjAwLCJleHAiOjE3NTQ1ODY4MDB9.HD8i-ESThzUmyY87mRYhWaOsGKWnwsQwjaAEWxw93hE', NULL),
('e1f99663fd4f34f5e4522310a7b7008e3c1be53f61e6f3d0c8fb676c1c154629', 8, '::1', 'PostmanRuntime/7.45.0', '2025-10-16 05:13:05', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTY5OTg1LCJleHAiOjE3NjA1NzM1ODV9.bh-dnJ2xxQcl038KQfJCWI2D1HpmlBYHKlISvvb1lrc', NULL),
('e3a63e499d90b812bf62ec0c5e182c19105b368dcfb39251865c9f5c0145465b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 02:55:29', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI3MzI5LCJleHAiOjE3NTQ0MzA5Mjl9.NCIYIK1A81vsC0E0hxpCScm7ss55yVbxpmRGwxfwExQ', '2025-08-05 21:10:50'),
('e68c91160572d5e2e31011bccb191ada834b3e9d184746e095f79cc9bb62a004', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 02:09:07', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NTEwOTQ3LCJleHAiOjE3NTQ1MTQ1NDd9.Vj3sgZjKUzGELQt4YfrCq7VCa3EvD8-hWl483zvmxwQ', '2025-08-06 20:43:38'),
('ecf6e574167164634df22933fbde2caae97c15effdfcec4b666b534dd6993e49', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-06 03:11:01', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDI4MjYxLCJleHAiOjE3NTQ0MzE4NjF9.LFxlPBOpnLrPBpknebWc3G8v-n2Rc37yDP52z3G5rSk', '2025-08-05 21:15:48'),
('ef36e9d201ae2aefcb26e4c11ef38a2252a61dc6d8c6310d870a63cfd1ebdda7', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 05:04:36', 'active', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzYwNTY5NDc2LCJleHAiOjE3NjA1NzMwNzZ9.O3k3aJ7Z_s-wILq-GnrLA2T3ZtRnF6GjxERAkkaCS6A', NULL),
('f0275b3bf6fd222a892f562ff109f3e09379b2012fdd29adb4026b577c85e8af', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:48:57', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIiwibWVkaWNvIl0sImlhdCI6MTc1NDA1OTczNywiZXhwIjoxNzU0MDYzMzM3fQ.RVeCkv6RFKHeEqxn4-UsidANKVVwGZpEwOcyBb_VMN0', '2025-08-01 14:58:25'),
('f1980982ba2b9b661d6d55f7be65176c9517144740fb17a3acbb4939252fb86b', 8, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-04 23:23:25', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4MjA1LCJleHAiOjE3NTQzMzE4MDV9.PhCZkaJQhfWK0DdeXup-IZYUDvzHch0fPaNMvNrp_xQ', '2025-08-04 17:24:37'),
('f5467c7321f833abcb9164bcd9e42d3e776e1937ba9ccc5b5bfeedba40faad36', 11, '::1', 'PostmanRuntime/7.44.1', '2025-08-01 20:37:15', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQwNTkwMzUsImV4cCI6MTc1NDA2MjYzNX0.EMZ9e4FZAVseb82ZbTcFAONarE9_lQTQ9_ZO-qm7ol0', '2025-08-01 14:38:12'),
('f624106850483beaa86d6cd13920ce64ac82a249c9aeab6fbee0084837f9f21e', 11, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-07 01:39:19', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjExLCJlbWFpbCI6Implc3Npcm5hY2FyeWJyYXZvQGdtYWlsLmNvbSIsInJvbGVzIjpbIm1lZGljbyJdLCJpYXQiOjE3NTQ1MDkxNTksImV4cCI6MTc1NDUxMjc1OX0.TsifnncyPQOlxnP8iSAHCzoBWW7WvAIyvPUZPBYZeH8', '2025-08-06 19:42:28'),
('f7b2c6a61d56087d28e713d6b8cbc15779f59819b9464c6817c21011fb489a24', 8, '::1', 'PostmanRuntime/7.39.1', '2025-08-06 08:28:37', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ3MzE3LCJleHAiOjE3NTQ0NTA5MTd9.-VASuhoUUAzb2y7pJFKA-QFlBgKdMoYENTnXAs1xw28', '2025-08-06 02:30:21'),
('fc8199996711f9e14693bf44c7fe72875f15b7e97a22357dc24d01cfcb0b459d', 8, '::1', 'PostmanRuntime/7.45.0', '2025-08-04 23:28:38', 'closed', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjgsImVtYWlsIjoibW9uYXN0ZXJpb21pZ3VlbGFuZ2VsODFAZ21haWwuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0MzI4NTE4LCJleHAiOjE3NTQzMzIxMTh9.91gaw4CsAmuEJKL1NF3BuUqmB5CZwHGCUPLnyBl4o6g', '2025-08-04 17:30:22');

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
(23, 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patient_id` (`patient_id`),
  ADD KEY `idx_doctor_id` (`doctor_id`),
  ADD KEY `idx_appointment_date` (`appointment_date`),
  ADD KEY `idx_office_number` (`office_number`),
  ADD KEY `idx_specialty_id` (`specialty_id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `fk_appointments_confirmed_by` (`confirmed_by`),
  ADD KEY `fk_appointments_cancelled_by` (`cancelled_by`);

--
-- Indices de la tabla `medical_colleges`
--
ALTER TABLE `medical_colleges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `abbreviation` (`abbreviation`);

--
-- Indices de la tabla `medical_specialties`
--
ALTER TABLE `medical_specialties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

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
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

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
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `medical_colleges`
--
ALTER TABLE `medical_colleges`
  MODIFY `id` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `medical_specialties`
--
ALTER TABLE `medical_specialties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appointments_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_appointments_confirmed_by` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_appointments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_appointments_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `medical_specialties` (`id`);

--
-- Filtros para la tabla `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
