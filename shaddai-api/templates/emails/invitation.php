<p>Hola <strong><?php echo $userName; ?></strong>,</p>
<p>Se ha creado una cuenta para usted en el sistema de Centro de Especialidades Médicas Shaddai Rafa.</p>

<p>Para completar su registro y definir su contraseña, haga clic en el siguiente botón:</p>

<div style="text-align: center;">
    <a href="<?php echo $inviteLink; ?>" class="btn" style="color: #ffffff;">Aceptar Invitación</a>
</div>

<p style="margin-top: 30px; font-size: 14px; color: #718096;">
    Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br>
    <a href="<?php echo $inviteLink; ?>" style="color: #0056B3; word-break: break-all;"><?php echo $inviteLink; ?></a>
</p>

<p>Este enlace expirará en 24 horas.</p>
