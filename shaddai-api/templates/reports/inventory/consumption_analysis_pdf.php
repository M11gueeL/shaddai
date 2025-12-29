<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #0056b3; font-size: 24px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
        th { background-color: #0056b3; color: white; padding: 8px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 6px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; text-align: center; color: #aaa; }
        .summary-box { background-color: #f0f8ff; border: 1px solid #b0d4f1; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        .summary-title { font-weight: bold; color: #0056b3; margin-bottom: 5px; }
        .summary-item { display: inline-block; margin-right: 20px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h1>Análisis de Consumo: Facturado vs. Uso Interno</h1>
        <div class="meta">
            <strong>Generado por:</strong> <?php echo htmlspecialchars($generatedBy); ?> <br>
            <strong>Periodo:</strong> <?php echo date('d/m/Y', strtotime($startDate)); ?> - <?php echo date('d/m/Y', strtotime($endDate)); ?> <br>
            <strong>Fecha de Emisión:</strong> <?php echo date('d/m/Y H:i A'); ?>
        </div>
    </div>

    <?php
    $totalBilled = 0;
    $totalInternal = 0;
    foreach ($data as $row) {
        $totalBilled += $row['billed_amount'];
        $totalInternal += $row['internal_cost_amount'];
    }
    ?>

    <div class="summary-box">
        <div class="summary-title">Resumen del Periodo</div>
        <div class="summary-item">Total Facturado (Ingresos): <strong>$<?php echo number_format($totalBilled, 2); ?></strong></div>
        <div class="summary-item">Total Uso Interno (Costo Operativo): <strong>$<?php echo number_format($totalInternal, 2); ?></strong></div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Insumo</th>
                <th>Unidad</th>
                <th class="text-right">Valor Unit.</th>
                <th class="text-center">Cant. Facturada</th>
                <th class="text-right">Total Facturado</th>
                <th class="text-center">Cant. Interna</th>
                <th class="text-right">Costo Interno</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($data)): ?>
                <tr>
                    <td colspan="8" class="text-center" style="padding: 20px;">No se encontraron movimientos en este periodo.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($data as $row): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($row['code']); ?></td>
                        <td><?php echo htmlspecialchars($row['item_name']); ?></td>
                        <td><?php echo htmlspecialchars($row['unit_of_measure']); ?></td>
                        <td class="text-right">$<?php echo number_format($row['unit_value'], 2); ?></td>
                        <td class="text-center"><?php echo $row['billed_qty']; ?></td>
                        <td class="text-right">$<?php echo number_format($row['billed_amount'], 2); ?></td>
                        <td class="text-center"><?php echo $row['internal_qty']; ?></td>
                        <td class="text-right">$<?php echo number_format($row['internal_cost_amount'], 2); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>

    <div class="footer">
        Página <span class="page-number"></span>
    </div>
</body>
</html>