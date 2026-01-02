<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0056b3; padding-bottom: 15px; }
        .header h1 { margin: 0 0 5px 0; color: #0056b3; font-size: 22px; text-transform: uppercase; }
        .header h2 { margin: 0; color: #555; font-size: 16px; font-weight: normal; }
        
        .patient-info { margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .patient-info table { width: 100%; border: none; }
        .patient-info td { border: none; padding: 2px 5px; }
        .label { font-weight: bold; color: #64748b; width: 120px; }
        
        .meta { font-size: 10px; color: #94a3b8; text-align: right; margin-bottom: 10px; }

        .vitals-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .vitals-table th { background-color: #0056b3; color: white; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .vitals-table td { border-bottom: 1px solid #e2e8f0; padding: 8px; font-size: 11px; }
        .vitals-table tr:nth-child(even) { background-color: #f1f5f9; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 9px; text-align: center; color: #cbd5e1; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        
        .note { font-style: italic; color: #64748b; font-size: 10px; margin-top: 2px; display: block; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Ficha de Evolución - Signos Vitales</h2>
    </div>

    <div class="patient-info">
        <table>
            <tr>
                <td class="label">Paciente:</td>
                <td><strong><?php echo htmlspecialchars($patient['patient_name']); ?></strong></td>
                <td class="label">Cédula:</td>
                <td><?php echo htmlspecialchars($patient['patient_cedula']); ?></td>
            </tr>
            <tr>
                <td class="label">Historia Nº:</td>
                <td><?php echo htmlspecialchars($patient['record_number'] ?? 'N/A'); ?></td>
                <td class="label">Fecha Reporte:</td>
                <td><?php echo date('d/m/Y H:i'); ?></td>
            </tr>
        </table>
    </div>

    <div class="meta">
        Rango de datos: <?php echo $startDate ? date('d/m/Y', strtotime($startDate)) : 'Inicio'; ?> 
        al <?php echo $endDate ? date('d/m/Y', strtotime($endDate)) : 'Actualidad'; ?>
        <?php if($startTime || $endTime): ?>
            (<?php echo $startTime ? date('H:i', strtotime($startTime)) : '00:00'; ?> - 
             <?php echo $endTime ? date('H:i', strtotime($endTime)) : '23:59'; ?>)
        <?php endif; ?>
    </div>

    <table class="vitals-table">
        <thead>
            <tr>
                <th width="15%">Fecha / Hora</th>
                <th width="10%">P.A. (mmHg)</th>
                <th width="10%">Pulso (lpm)</th>
                <th width="10%">F.R. (rpm)</th>
                <th width="10%">Temp (°C)</th>
                <th width="10%">Sat O₂ (%)</th>
                <th width="10%">Peso (kg)</th>
                <th width="25%">Notas</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($data)): ?>
                <tr><td colspan="8" style="text-align:center; padding: 20px;">No se encontraron registros en el rango seleccionado.</td></tr>
            <?php else: ?>
                <?php foreach ($data as $row): ?>
                <tr>
                    <td>
                        <strong><?php echo date('d/m/Y', strtotime($row['recorded_at'])); ?></strong><br>
                        <?php echo date('H:i', strtotime($row['recorded_at'])); ?>
                    </td>
                    <td>
                        <?php 
                            if($row['systolic_bp'] && $row['diastolic_bp']) 
                                echo $row['systolic_bp'] . '/' . $row['diastolic_bp'];
                            else echo '-';
                        ?>
                    </td>
                    <td><?php echo $row['heart_rate'] ?: '-'; ?></td>
                    <td><?php echo $row['respiratory_rate'] ?: '-'; ?></td>
                    <td><?php echo $row['temperature'] ?: '-'; ?></td>
                    <td><?php echo $row['oxygen_saturation'] ?: '-'; ?></td>
                    <td><?php echo $row['weight'] ?: '-'; ?></td>
                    <td>
                        <?php if($row['notes']): ?>
                            <span class="note"><?php echo htmlspecialchars($row['notes']); ?></span>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>

    <div class="footer">
        Este documento es un reporte de evolución generado automáticamente. No sustituye la firma médica. <br>
        Generado por: <?php echo htmlspecialchars($generatedBy); ?>
    </div>
</body>
</html>