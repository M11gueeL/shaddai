-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-10-2025 a las 02:21:37
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
(2, 11, 2, '10:30:00', '18:30:00', 'Consultas generales', '2025-10-26 00:55:53', '2025-10-26 00:56:48');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `medical_preferred_schedules`
--
ALTER TABLE `medical_preferred_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_medical_day_start` (`medical_id`,`day_of_week`,`start_time`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `medical_preferred_schedules`
--
ALTER TABLE `medical_preferred_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `medical_preferred_schedules`
--
ALTER TABLE `medical_preferred_schedules`
  ADD CONSTRAINT `fk_preferred_schedule_medical` FOREIGN KEY (`medical_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
