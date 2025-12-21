<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Rendimiento</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header h1 { color: #0056b3; margin: 0; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        .meta { margin-bottom: 20px; }
        .meta table { width: 100%; }
        .meta td { padding: 5px; }
        .summary-cards { width: 100%; margin-bottom: 30px; }
        .card { background-color: #f8f9fa; border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 5px; width: 30%; display: inline-block; margin-right: 2%; }
        .card h3 { margin: 0 0 10px 0; color: #0056b3; font-size: 28px; }
        .card span { font-weight: bold; color: #555; text-transform: uppercase; font-size: 10px; }
        
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table.data-table th { background-color: #0056b3; color: white; padding: 10px; text-align: left; font-weight: bold; }
        table.data-table td { padding: 10px; border-bottom: 1px solid #eee; }
        table.data-table tr:nth-child(even) { background-color: #f9f9f9; }
        
        .bar-container { width: 100px; height: 10px; background-color: #eee; border-radius: 5px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 5px; }
        .bar-fill { height: 100%; display: block; }
        .bar-green { background-color: #10b981; }
        .bar-red { background-color: #ef4444; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <p>Reporte de Indicadores de Rendimiento</p>
    </div>

    <div class="meta">
        <table>
            <tr>
                <td><strong>Dimensión de Análisis:</strong> <?php echo ucfirst($type === 'specialty' ? 'Especialidad' : ($type === 'doctor' ? 'Médico' : 'Paciente')); ?></td>
                <td style="text-align: right;"><strong>Periodo:</strong> <?php echo date('d/m/Y', strtotime($startDate)); ?> - <?php echo date('d/m/Y', strtotime($endDate)); ?></td>
            </tr>
            <tr>
                <td><strong>Fecha de Generación:</strong> <?php echo date('d/m/Y H:i'); ?></td>
                <td style="text-align: right;"><strong>Generado por:</strong> Sistema Administrativo</td>
            </tr>
        </table>
    </div>

    <?php
    // Calcular totales generales para las tarjetas
    $totalAppointments = 0;
    $totalCompleted = 0;
    $totalCanceled = 0;
    foreach ($data as $row) {
        $totalAppointments += $row['total_appointments'];
        $totalCompleted += $row['completed_appointments'];
        $totalCanceled += $row['canceled_appointments'];
    }
    ?>

    <div class="summary-cards">
        <table style="width: 100%;">
            <tr>
                <td style="width: 33%; padding: 10px;">
                    <div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 15px; text-align: center; border-radius: 8px;">
                        <h3 style="color: #4f46e5; margin: 0; font-size: 24px;"><?php echo $totalAppointments; ?></h3>
                        <span style="color: #4338ca; font-size: 11px; font-weight: bold;">TOTAL AGENDADAS</span>
                    </div>
                </td>
                <td style="width: 33%; padding: 10px;">
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; text-align: center; border-radius: 8px;">
                        <h3 style="color: #059669; margin: 0; font-size: 24px;"><?php echo $totalCompleted; ?></h3>
                        <span style="color: #047857; font-size: 11px; font-weight: bold;">COMPLETADAS</span>
                    </div>
                </td>
                <td style="width: 33%; padding: 10px;">
                    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; text-align: center; border-radius: 8px;">
                        <h3 style="color: #dc2626; margin: 0; font-size: 24px;"><?php echo $totalCanceled; ?></h3>
                        <span style="color: #b91c1c; font-size: 11px; font-weight: bold;">CANCELADAS</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>Nombre / Entidad</th>
                <th style="text-align: center;">Total</th>
                <th style="text-align: center;">Completadas</th>
                <th style="text-align: center;">% Éxito</th>
                <th style="text-align: center;">Canceladas</th>
                <th style="text-align: center;">% Cancelación</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $row): 
                $successRate = $row['total_appointments'] > 0 ? round(($row['completed_appointments'] / $row['total_appointments']) * 100, 1) : 0;
                $cancelRate = $row['total_appointments'] > 0 ? round(($row['canceled_appointments'] / $row['total_appointments']) * 100, 1) : 0;
            ?>
            <tr>
                <td><?php echo htmlspecialchars($row['name']); ?></td>
                <td style="text-align: center; font-weight: bold;"><?php echo $row['total_appointments']; ?></td>
                <td style="text-align: center; color: #059669;"><?php echo $row['completed_appointments']; ?></td>
                <td style="text-align: center;">
                    <?php echo $successRate; ?>%
                </td>
                <td style="text-align: center; color: #dc2626;"><?php echo $row['canceled_appointments']; ?></td>
                <td style="text-align: center;">
                    <?php echo $cancelRate; ?>%
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="footer">
        <p>Este documento es confidencial y para uso exclusivo de la administración de Centro de Especialidades Médicas Shaddai Rafa.</p>
        <p>Página 1 de 1</p>
    </div>
</body>
</html>