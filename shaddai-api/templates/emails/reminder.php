<p>Hola <strong><?php echo $patientName; ?></strong>,</p>
<p>Este es un recordatorio amable de su cita programada para el día de hoy.</p>

<div class='info-box'>
    <p style='margin: 5px 0;'><strong>Fecha:</strong> <?php echo date('d/m/Y', strtotime($date)); ?></p>
    <p style='margin: 5px 0;'><strong>Hora:</strong> <?php echo date('h:i A', strtotime($time)); ?></p>
</div>

<p>¡Le esperamos!</p>