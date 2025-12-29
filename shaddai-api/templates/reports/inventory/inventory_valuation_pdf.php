<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Valoración de Inventario</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #059669; font-size: 18px; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #059669; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h1>Valoración de Inventario</h1>
        <p>Generado por: <?= htmlspecialchars($generatedBy) ?> | Fecha: <?= date('d/m/Y H:i') ?></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Insumo</th>
                <th>Lote</th>
                <th class="text-center">Vencimiento</th>
                <th class="text-center">Cantidad</th>
                <th class="text-right">Valor Total ($)</th>
            </tr>
        </thead>
        <tbody>
            <?php 
            $totalValue = 0;
            foreach ($data as $item): 
                $totalValue += $item['total_value'];
            ?>
                <tr>
                    <td><?= htmlspecialchars($item['code']) ?></td>
                    <td><?= htmlspecialchars($item['item_name']) ?></td>
                    <td><?= htmlspecialchars($item['batch_number']) ?></td>
                    <td class="text-center"><?= date('d/m/Y', strtotime($item['expiration_date'])) ?></td>
                    <td class="text-center"><?= $item['batch_quantity'] ?></td>
                    <td class="text-right">$ <?= number_format($item['total_value'], 2) ?></td>
                </tr>
            <?php endforeach; ?>
            <tr style="background-color: #e6fffa;">
                <td colspan="5" class="text-right font-bold">TOTAL VALORIZADO</td>
                <td class="text-right font-bold">$ <?= number_format($totalValue, 2) ?></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Página <span class="page-number"></span>
    </div>
</body>
</html>