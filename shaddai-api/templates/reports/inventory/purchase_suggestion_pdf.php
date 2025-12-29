<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Sugerido de Compras</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0056B3; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #0056B3; font-size: 18px; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #0056B3; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .alert { color: #B91C1C; font-weight: bold; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h1>Sugerido de Compras</h1>
        <p>Generado por: <?= htmlspecialchars($generatedBy) ?> | Fecha: <?= date('d/m/Y H:i') ?></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Insumo</th>
                <th class="text-center">Stock Actual</th>
                <th class="text-center">Punto Reorden</th>
                <th class="text-center">Déficit Sugerido</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $item): ?>
                <tr>
                    <td><?= htmlspecialchars($item['code']) ?></td>
                    <td><?= htmlspecialchars($item['item_name']) ?></td>
                    <td class="text-center <?= $item['stock_quantity'] == 0 ? 'alert' : '' ?>">
                        <?= $item['stock_quantity'] ?>
                    </td>
                    <td class="text-center"><?= $item['reorder_level'] ?></td>
                    <td class="text-center font-bold"><?= $item['deficit'] ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="footer">
        Página <span class="page-number"></span>
    </div>
</body>
</html>