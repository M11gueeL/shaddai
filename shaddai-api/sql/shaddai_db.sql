-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-07-2025 a las 23:40:40
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
(2, 'Juan Pérez', '12345678', '1980-12-04', 'Masculino', 'Casado', 'Santa Rita', '04121234567', 'email@email.com', '2025-07-28 23:09:31', '2025-07-28 23:21:16', NULL);

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
(8, 'Miguelangel', 'Moansterio Salas', '31080925', '2005-11-24', 'Masculino', 'Palo Negro', '04243316242', 'monasteriomiguelangel81@gmail.com', '$2y$10$03jo4oyAlcJQ2wKqV.2J1egVyr2E09kqdG1kqAYIjgQG41F3Aaeqm', NULL, '2025-07-30 20:56:13', '2025-07-30 21:38:09', 1);

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
(8, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` text DEFAULT NULL,
  `session_start` timestamp NOT NULL DEFAULT current_timestamp(),
  `session_end` timestamp NULL DEFAULT NULL,
  `status` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_specialties`
--

CREATE TABLE `user_specialties` (
  `user_id` int(11) NOT NULL,
  `specialty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Índices para tablas volcadas
--

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
-- AUTO_INCREMENT de la tabla `medical_colleges`
--
ALTER TABLE `medical_colleges`
  MODIFY `id` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `medical_specialties`
--
ALTER TABLE `medical_specialties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de la tabla `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

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
