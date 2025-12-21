<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0056B3 0%, #D81B60 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .content { padding: 40px 30px; color: #4a5568; line-height: 1.6; font-size: 16px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #edf2f7; }
        .info-box { background-color: #f0f9ff; border-left: 4px solid #0056B3; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        strong { color: #2d3748; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #0056B3; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><?php echo $title; ?></h1>
        </div>
        <div class="content">
            <?php echo $content; ?>
        </div>
        <div class="footer">
            <p>&copy; <?php echo date('Y'); ?> Centro de Especialidades Médicas Shaddai Rafa. Todos los derechos reservados.</p>
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
        </div>
    </div>
</body>
</html>