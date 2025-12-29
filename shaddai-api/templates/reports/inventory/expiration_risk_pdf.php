<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #0056b3; font-size: 24px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
        th { background-color: #0056b3; color: white; padding: 8px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 6px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .section-title { font-size: 14px; font-weight: bold; color: #0056b3; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .empty-msg { font-style: italic; color: #888; font-size: 12px; margin-bottom: 20px; }
        .risk-urgent { color: #b91c1c; font-weight: bold; }
        .risk-high { color: #c2410c; font-weight: bold; }
        .risk-medium { color: #b45309; font-weight: bold; }
        .risk-low { color: #15803d; }
        .risk-safe { color: #0369a1; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #aaa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h1>Semáforo de Vencimientos</h1>
        <div class="meta">
            <strong>Generado por:</strong> <?php echo htmlspecialchars($generatedBy); ?> <br>
            <strong>Fecha de Emisión:</strong> <?php echo date('d/m/Y H:i A'); ?>
        </div>
    </div>

    <?php
    // Clasificar datos
    $groups = [
        'urgent' => ['title' => 'URGENTE: Vencen en menos de 15 días', 'data' => [], 'class' => 'risk-urgent'],
        'high' => ['title' => 'ALTO RIESGO: Vencen entre 15 y 30 días', 'data' => [], 'class' => 'risk-high'],
        'medium' => ['title' => 'RIESGO MEDIO: Vencen entre 31 y 60 días', 'data' => [], 'class' => 'risk-medium'],
        'low' => ['title' => 'RIESGO BAJO: Vencen entre 61 y 90 días', 'data' => [], 'class' => 'risk-low'],
        'safe' => ['title' => 'SEGURO: Vencen en más de 90 días', 'data' => [], 'class' => 'risk-safe'],
    ];

    foreach ($data as $row) {
        $days = $row['days_remaining'];
        if ($days < 15) {
            $groups['urgent']['data'][] = $row;
        } elseif ($days <= 30) {
            $groups['high']['data'][] = $row;
        } elseif ($days <= 60) {
            $groups['medium']['data'][] = $row;
        } elseif ($days <= 90) {
            $groups['low']['data'][] = $row;
        } else {
            $groups['safe']['data'][] = $row;
        }
    }
    ?>

    <?php foreach ($groups as $key => $group): ?>
        <div class="section-title"><?php echo $group['title']; ?></div>
        
        <?php if (empty($group['data'])): ?>
            <div class="empty-msg">No hay insumos en esta categoría.</div>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%">Insumo</th>
                        <th style="width: 20%">Lote</th>
                        <th style="width: 10%">Cant.</th>
                        <th style="width: 20%">Vencimiento</th>
                        <th style="width: 10%">Días</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($group['data'] as $row): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($row['item_name']); ?></td>
                        <td><?php echo htmlspecialchars($row['batch_number']); ?></td>
                        <td><?php echo $row['remaining_quantity']; ?></td>
                        <td><?php echo date('d/m/Y', strtotime($row['expiration_date'])); ?></td>
                        <td class="<?php echo $group['class']; ?>">
                            <?php echo $row['days_remaining']; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    <?php endforeach; ?>

    <div class="footer">
        Documento generado automáticamente por Sistema Médico Shaddai.
    </div>
</body>
</html>
