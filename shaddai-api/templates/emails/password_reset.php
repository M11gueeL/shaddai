<p>Hola <strong><?php echo $userName; ?></strong>,</p>
<p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta en el sistema de Centro de Especialidades Médicas Shaddai Rafa.</p>

<p>Si usted no realizó esta solicitud, puede ignorar este correo de forma segura.</p>

<p>Para continuar con el proceso de restablecimiento, haga clic en el siguiente botón:</p>

<div style="text-align: center;">
    <a href="<?php echo $resetLink; ?>" class="btn" style="color: #ffffff;">Restablecer Contraseña</a>
</div>

<p style="margin-top: 30px; font-size: 14px; color: #718096;">
    Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br>
    <a href="<?php echo $resetLink; ?>" style="color: #0056B3; word-break: break-all;"><?php echo $resetLink; ?></a>
</p>

<p>Este enlace expirará en 1 hora por razones de seguridad.</p>