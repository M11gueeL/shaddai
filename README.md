<div align="center">
  <h1>🏥 Sistema Médico Shaddai</h1>
  <p>
    <strong>Plataforma Full Stack para la gestión clínica y administrativa</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP" />
    <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  </p>
</div>

## 📖 Descripción General

El **Sistema Médico Shaddai** es una solución de software integral que digitaliza las operaciones de clínicas y consultorios. Su objetivo principal es centralizar el agendamiento de citas, el manejo de historias clínicas, el control de inventario de insumos y el ciclo completo de facturación.

Para garantizar el máximo rendimiento y control sobre la lógica de negocio, la **API RESTful fue diseñada y construida desde cero utilizando PHP nativo y MySQL**, sin depender de frameworks de backend (*demostrando un dominio real de la lógica de servidor y arquitectura de bases de datos*). Esta API robusta alimenta una interfaz web moderna, rápida y fluida desarrollada con **React y Tailwind CSS**.

---

## ✨ Características Principales

El sistema está dividido en módulos estratégicos que cubren todas las necesidades del centro médico:

### 1. 📅 Gestión de Citas
- **Agendamiento Inteligente:** Asignación y administración de citas por especialidad y médico.
- **Automatización:** Envío de recordatorios automáticos a pacientes y alertas de asistencia.
- **Calendarios Médicos:** Visualización de horarios y disponibilidad en tiempo real.

### 2. 💰 Gestión de Caja y Facturación
- **Manejo de Pagos:** Registro de ingresos, control de métodos de pago y cuentas por cobrar.
- **Emisión y Control de Recibos:** Creación, impresión (PDF) y anulación segura de recibos.
- **Reportes y Estadísticas:** Generación de cortes de caja, reportes financieros y exportación de datos para análisis (Excel/PDF).

### 3. 📦 Control de Inventario
- **Gestión de Insumos Médicos:** Registro detallado de productos, medicamentos y materiales clínicos.
- **Control de Vencimientos:** Sistema estricto basado en *lotes*, diseñado para alertar sobre productos próximos a caducar para garantizar la seguridad del paciente.
- **Trazabilidad:** Reportes de entradas y salidas de inventario.

### 4. 📝 Historias Clínicas Electrónicas
- **Expedientes Digitales:** Almacenamiento seguro del historial del paciente, diagnósticos y tratamientos.
- **Informes Médicos:** Creación estandarizada de informes y recetas.
- **Colaboración Médica:** Capacidad para que los médicos tratantes compartan perfiles y expedientes clínicos internamente, facilitando las interconsultas.

---

## 👥 Sistema de Roles y Accesos

La plataforma cuenta con un middleware robusto de autenticación basado en JWT que segmenta la funcionalidad según perfiles:

- 👑 **Administrador:** Acceso total al sistema, gestión de usuarios, auditoría, estadísticas financieras e inventario completo.
- 👨‍⚕️ **Médico:** Acceso a sus agendas, expedientes de pacientes, historias clínicas, creación de informes y herramientas de diagnóstico.
- 👩‍💻 **Recepcionista:** Gestión de citas, admisiones, cobros iniciales, facturación regular y atención al paciente.

---

## 🛠️ Arquitectura y Tecnologías

### 🖥️ Frontend (`shaddai-app/`)
- **React.js (Vite):** Arquitectura basada en componentes y hooks para un rendimiento fluido de tipo *Single Page Application (SPA)*.
- **Tailwind CSS:** Diseño responsivo, moderno y altamente personalizable.
- **Node.js:** Entorno de ejecución para herramientas de compilación y empaquetado.

### ⚙️ Backend (`shaddai-api/`)
- **PHP Nativo:** API RESTful modular construida desde cero.
- **MySQL:** Base de datos relacional optimizada con integridad referencial estricta.
- **Arquitectura MVC Modificada:** Separación limpia de la lógica en `Controllers`, `Models`, `Routes`, `Middlewares` y `Services` (Facturación, Reportes, Emails, etc.).
- **Composer & Librerías Secundarias:** Autoload PSR-4, JWT para seguridad, PHPMailer para notificaciones, DomPDF para recibos y PhpSpreadsheet para exportaciones en Excel.

---

## 🚀 Instalación y Configuración

Sigue estos pasos para desplegar el proyecto en un entorno de desarrollo local (ej. XAMPP/WAMP/MAMP).

### Requisitos Previos
- Servidor web (Apache/Nginx).
- PHP 8.0 o superior.
- MySQL 8.0 o MariaDB.
- Node.js (v18+) y npm.
- Composer.

### 1️⃣ Configuración de la Base de Datos
1. Inicia tu servidor MySQL.
2. Crea una base de datos vacía, por ejemplo `shaddai_db`.
3. Importa el esquema de la base de datos ubicado en: `shaddai-api/sql/shaddai_db.sql`.

### 2️⃣ Configuración del Backend (API)
```bash
# Navega al directorio de la API
cd shaddai-api

# Instala las dependencias de Composer (Autoload, DomPDF, PHPMailer, etc.)
composer install
```
4. Configura tus credenciales de base de datos editando el archivo de conexión ubicado en `shaddai-api/config/Database.php`.
5. Asegúrate de configurar tus variables de entorno para correo (SMTP) en el módulo correspondiente si deseas probar los recordatorios automáticos.

### 3️⃣ Configuración del Frontend (App)
```bash
# Navega al directorio del frontend
cd shaddai-app

# Instala las dependencias de Node
npm install

# Inicia el servidor de desarrollo Vite
npm run dev
```
La aplicación web estará disponible típicamente en `http://localhost:5173`. No olvides asegurar que tu entorno local consuma la API correctamente (verifica la URL base configurada en `shaddai-app/src/api/` hacia tu `localhost/shaddai/shaddai-api/public/`).

---

## 💡 Tareas Automatizadas y Scripts (CRON)
En la carpeta `shaddai-api/bin/` se encuentran scripts ejecutables diseñados para correr en segundo plano (Cron Jobs) que mantienen el sistema en óptimas condiciones:
- `clean_sessions.php`: Purga tokens y sesiones expiradas.
- `send_reminders.php`: Dispara correos y notificaciones automáticas de citas próximas.

---

<div align="center">
  <i>Desarrollado con dedicación para optimizar la gestión de la salud y el bienestar.</i>
</div>
