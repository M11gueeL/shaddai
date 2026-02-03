<?php
// $date y $time ya vienen formateados desde el script
?>
<div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #0056B3; margin-bottom: 5px; font-size: 22px;">¡Recordatorio de Cita!</h2>
    <p style="color: #718096; margin-top: 0; font-size: 16px;">Tu salud es nuestra prioridad</p>
</div>

<p>Hola <strong><?php echo htmlspecialchars($patientName); ?></strong>,</p>

<p>Esperamos que estés teniendo un excelente día. Te escribimos para recordarte que tienes una cita programada con nosotros próximamente.</p>

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 10px 15px; vertical-align: middle; border-bottom: 1px solid #edf2f7;">
                <span style="font-size: 13px; color: #64748b; display: block; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Fecha</span>
                <strong style="font-size: 18px; color: #1e293b;"><?php echo $date; ?></strong>
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 15px; vertical-align: middle;">
                <span style="font-size: 13px; color: #64748b; display: block; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Hora</span>
                <strong style="font-size: 18px; color: #1e293b;"><?php echo $time; ?></strong>
            </td>
        </tr>
    </table>
</div>

<p style="font-size: 15px; color: #475569; text-align: center; margin-top: 30px;">
    ¡Te esperamos!
</p>