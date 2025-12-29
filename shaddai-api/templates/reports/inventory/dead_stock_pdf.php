<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Stock Muerto</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4B5563; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #4B5563; font-size: 18px; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4B5563; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h1>Reporte de Stock sin movimiento</h1>
        <p>Sin movimiento desde: <?= $cutoffDate ?> | Generado por: <?= htmlspecialchars($generatedBy) ?></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Insumo</th>
                <th>Lote</th>
                <th class="text-center">Última Salida</th>
                <th class="text-center">Días Estancado</th>
                <th class="text-right">Valor Inmovilizado</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $item): ?>
                <tr>
                    <td><?= htmlspecialchars($item['code']) ?></td>
                    <td><?= htmlspecialchars($item['item_name']) ?></td>
                    <td><?= htmlspecialchars($item['batch_number']) ?></td>
                    <td class="text-center">
                        <?= $item['last_outflow_date'] ? date('d/m/Y', strtotime($item['last_outflow_date'])) : 'Nunca' ?>
                    </td>
                    <td class="text-center"><?= $item['days_stagnant'] ?? 'N/A' ?></td>
                    <td class="text-right">$ <?= number_format($item['immobilized_value'], 2) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="footer">
        Página <span class="page-number"></span>
    </div>
</body>
</html>