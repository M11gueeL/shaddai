<p>Estimado/a <strong><?php echo $patientName; ?></strong>,</p>
<p>Nos complace informarle que su cita ha sido agendada exitosamente en nuestro sistema.</p>

<div class='info-box'>
    <p style='margin: 5px 0;'><strong>Médico Tratante:</strong> Dr./Dra. <?php echo $doctorName; ?></p>
    <p style='margin: 5px 0;'><strong>Especialidad:</strong> <?php echo $specialty; ?></p>
    <p style='margin: 5px 0;'><strong>Fecha:</strong> <?php echo date('d/m/Y', strtotime($date)); ?></p>
    <p style='margin: 5px 0;'><strong>Hora:</strong> <?php echo date('h:i A', strtotime($time)); ?></p>
</div>

<p>Por favor, recuerde llegar 15 minutos antes de su hora programada.</p>
<p>Si necesita reprogramar o cancelar su cita, le agradecemos contactarnos con al menos 24 horas de anticipación.</p>