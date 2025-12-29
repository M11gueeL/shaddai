<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fugas y Ajustes Manuales</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #B91C1C; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #B91C1C; font-size: 18px; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
        th { background-color: #B91C1C; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-green { color: #15803D; font-weight: bold; }
        .text-red { color: #B91C1C; font-weight: bold; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h1>Reporte de Fugas y Ajustes Manuales</h1>
        <p>Del <?= $startDate ?> al <?= $endDate ?> | Generado por: <?= htmlspecialchars($generatedBy) ?></p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%">Fecha/Hora</th>
                <th style="width: 20%">Insumo</th>
                <th style="width: 15%">Usuario</th>
                <th style="width: 15%">Tipo</th>
                <th style="width: 10%" class="text-center">Cantidad</th>
                <th style="width: 25%">Nota/Justificación</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $item): 
                $isEntry = strpos($item['movement_type'], 'in_') === 0;
                $sign = $isEntry ? '+' : '-';
                $class = $isEntry ? 'text-green' : 'text-red';
            ?>
                <tr>
                    <td><?= date('d/m/Y H:i', strtotime($item['created_at'])) ?></td>
                    <td><?= htmlspecialchars($item['item_name']) ?></td>
                    <td><?= htmlspecialchars($item['user_name']) ?></td>
                    <td><?= htmlspecialchars($item['movement_type_label']) ?></td>
                    <td class="text-center <?= $class ?>">
                        <?= $sign . $item['quantity_adjusted'] ?>
                    </td>
                    <td><?= htmlspecialchars($item['notes']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="footer">
        Página <span class="page-number"></span>
    </div>
</body>
</html>