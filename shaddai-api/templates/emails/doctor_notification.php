<p>Estimado/a Dr./Dra. <strong><?php echo $doctorName; ?></strong>,</p>
<p>Se ha agendado una nueva cita en su calendario.</p>

<div class='info-box'>
    <p style='margin: 5px 0;'><strong>Paciente:</strong> <?php echo $patientName; ?></p>
    <p style='margin: 5px 0;'><strong>Motivo/Especialidad:</strong> <?php echo $specialty; ?></p>
    <p style='margin: 5px 0;'><strong>Fecha:</strong> <?php echo date('d/m/Y', strtotime($date)); ?></p>
    <p style='margin: 5px 0;'><strong>Hora:</strong> <?php echo date('h:i A', strtotime($time)); ?></p>
</div>

<p>Puede ver más detalles ingresando al sistema administrativo.</p>