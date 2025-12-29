<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #0056b3; font-size: 24px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background-color: #0056b3; color: white; padding: 8px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 6px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .type-badge { font-weight: bold; font-size: 10px; padding: 2px 4px; border-radius: 3px; display: inline-block; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #aaa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h1>Kardex de Movimientos de Inventario </h1>
        <div class="meta">
            <strong>Rango:</strong> <?php echo date('d/m/Y', strtotime($startDate)); ?> al <?php echo date('d/m/Y', strtotime($endDate)); ?> <br>
            <strong>Generado por:</strong> <?php echo htmlspecialchars($generatedBy); ?> <br>
            <strong>Fecha de Emisión:</strong> <?php echo date('d/m/Y H:i A'); ?>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%">Fecha/Hora</th>
                <th style="width: 10%">Código</th>
                <th style="width: 20%">Insumo</th>
                <th style="width: 15%">Tipo</th>
                <th style="width: 15%">Responsable</th>
                <th style="width: 10%">Mov.</th>
                <th style="width: 15%">Notas</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $row): ?>
            <tr>
                <td><?php echo date('d/m/Y H:i', strtotime($row['created_at'])); ?></td>
                <td><?php echo htmlspecialchars($row['item_code']); ?></td>
                <td><?php echo htmlspecialchars($row['item_name']); ?></td>
                <td>
                    <span class="type-badge">
                        <?php echo ucfirst(str_replace('_', ' ', $row['movement_type'])); ?>
                    </span>
                </td>
                <td><?php echo htmlspecialchars($row['user_name']); ?></td>
                <td style="font-weight: bold; color: <?php echo $row['quantity_moved'] > 0 ? '#15803d' : '#b91c1c'; ?>">
                    <?php echo ($row['quantity_moved'] > 0 ? '+' : '') . $row['quantity_moved']; ?>
                </td>
                <td><?php echo htmlspecialchars($row['notes']); ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="footer">
        Documento generado automáticamente por Sistema Médico Shaddai.
    </div>
</body>
</html>
