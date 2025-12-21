<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #0056b3; font-size: 24px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #0056b3; color: white; padding: 10px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status { font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
        /* Clases dinámicas para status */
        .status-confirmada { color: #15803d; background: #dcfce7; }
        .status-cancelada { color: #b91c1c; background: #fee2e2; }
        .status-programada { color: #0369a1; background: #e0f2fe; }
        .status-completada { color: #4338ca; background: #e0e7ff; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #aaa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Citas - Centro de Especialidades Médicas Shaddai Rafa</h1>
        <div class="meta">
            <strong>Rango:</strong> <?php echo $startDate; ?> al <?php echo $endDate; ?> <br>
            <strong>Generado por:</strong> <?php echo htmlspecialchars($generatedBy); ?> <br>
            <strong>Generado el:</strong> <?php echo date('d/m/Y H:i A'); ?>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $row): 
                $statusClass = 'status-' . str_replace('_', '-', $row['status']);
                $statusLabel = ucfirst(str_replace('_', ' ', $row['status']));
            ?>
            <tr>
                <td><?php echo date('d/m/Y', strtotime($row['appointment_date'])); ?></td>
                <td><?php echo date('h:i A', strtotime($row['appointment_time'])); ?></td>
                <td>
                    <?php echo $row['patient_name']; ?><br>
                    <small style="color:#777"><?php echo $row['patient_cedula']; ?></small>
                </td>
                <td><?php echo $row['doctor_name']; ?></td>
                <td><?php echo $row['specialty_name']; ?></td>
                <td>
                    <span class="status <?php echo $statusClass; ?>">
                        <?php echo $statusLabel; ?>
                    </span>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="footer">
        Documento generado automáticamente por Sistema Médico Shaddai.
    </div>
</body>
</html>