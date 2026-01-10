<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Rendimiento de Servicios</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e11d48; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #e11d48; font-size: 18px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
        th { background-color: #f3f4f6; color: #374151; font-weight: bold; font-size: 10px; text-transform: uppercase; }
        tr:nth-child(even) { background-color: #fff1f2; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-red { color: #dc2626; font-weight: bold; }
        .text-gray { color: #6b7280; }

        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 9px; text-align: center; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 5px; }
        
        .summary-box { margin: 15px 0; padding: 10px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Reporte Estadístico de Rendimiento por Servicios</h2>
        <p>
            Rango: <?= date('d/m/Y', strtotime($startDate)) ?> - <?= date('d/m/Y', strtotime($endDate)) ?><br>
            Generado por: <?= htmlspecialchars($generatedBy) ?> | Fecha: <?= date('d/m/Y H:i A') ?>
        </p>
    </div>

    <?php
        $totalQuantity = 0;
        $totalRevenue = 0;
        foreach ($data as $d) {
             $totalQuantity += $d['total_quantity'];
             $totalRevenue += $d['total_usd_generated'];
        }
    ?>
    
    <div class="summary-box">
        <table style="border: none; margin: 0;">
            <tr style="background: transparent;">
                <td style="border: none;"><strong>Total Servicios Prestados:</strong> <?= number_format($totalQuantity) ?></td>
                <td style="border: none; text-align: right;"><strong>Facturación Estimada Total:</strong> $ <?= number_format($totalRevenue, 2) ?></td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 50px;" class="text-center">#</th>
                <th>Servicio / Procedimiento</th>
                <th class="text-right">Cantidad de Veces Solicitado</th>
                <th class="text-right">Porcentaje del Total</th>
                <th class="text-right">Facturación Generada (USD)</th>
            </tr>
        </thead>
        <tbody>
            <?php 
            $i = 1;
            foreach ($data as $item): 
                $percentage = $totalQuantity > 0 ? ($item['total_quantity'] / $totalQuantity) * 100 : 0;
            ?>
                <tr>
                    <td class="text-center"><?= $i++ ?></td>
                    <td class="font-bold"><?= htmlspecialchars($item['service_name']) ?></td>
                    <td class="text-right font-bold" style="font-size: 13px;"><?= $item['total_quantity'] ?></td>
                    <td class="text-right text-gray"><?= number_format($percentage, 1) ?>%</td>
                    <td class="text-right text-green-600">$ <?= number_format($item['total_usd_generated'], 2) ?></td>
                </tr>
            <?php endforeach; ?>
            
            <?php if(count($data) === 0): ?>
                <tr>
                    <td colspan="5" class="text-center" style="padding: 20px;">
                        No se encontraron registros de servicios en este periodo.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>

    <div class="footer">
        Este documento es confidencial y para uso exclusivo del departamento administrativo. <br> 
        Generado por Sistema Médico Shaddai
    </div>
</body>
</html>
