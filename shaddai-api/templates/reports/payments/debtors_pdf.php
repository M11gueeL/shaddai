<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Cuentas por Cobrar</title>
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

        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-pending { background-color: #fee2e2; color: #b91c1c; }
        .badge-partial { background-color: #ffedd5; color: #c2410c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Reporte de Cartera Morosa / Cuentas por Cobrar</h2>
        <p>
            Generado por: <?= htmlspecialchars($generatedBy) ?> | Fecha: <?= date('d/m/Y H:i A') ?>
        </p>
    </div>

    <!-- Resumen -->
    <?php
        $totalDeuda = 0;
        foreach ($data as $d) {
             $pending = $d['total_usd'] - $d['paid_usd'];
             if ($pending > 0) $totalDeuda += $pending;
        }
    ?>
    <div style="margin-bottom: 15px; font-size: 13px;">
        <strong>Total por Cobrar: </strong> <span class="text-red">$ <?= number_format($totalDeuda, 2) ?></span>
        <br>
        <span class="text-gray">Total de Pacientes / Cuentas listadas: <?= count($data) ?></span>
    </div>

    <table>
        <thead>
            <tr>
                <th>Antigüedad</th>
                <th>Cuenta ID</th>
                <th>Paciente</th>
                <th>Cédula / Teléfono</th>
                <th class="text-right">Total Facturado</th>
                <th class="text-right">Abonado</th>
                <th class="text-right">Pendiente</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $acc): ?>
                <?php 
                    $createdAt = strtotime($acc['created_at']);
                    $daysOld = floor((time() - $createdAt) / (60 * 60 * 24));
                    $pending = $acc['total_usd'] - $acc['paid_usd'];
                    if ($pending <= 0.01) continue; // Skip if basically paid
                ?>
                <tr>
                    <td><?= date('d/m/Y', $createdAt) ?> <br> <span class="text-gray" style="font-size:9px">(<?= $daysOld ?> días)</span></td>
                    <td class="text-center font-bold">#<?= $acc['id'] ?></td>
                    <td><?= htmlspecialchars($acc['patient_name']) ?></td>
                    <td class="text-gray" style="font-size: 10px;">
                        <?= $acc['patient_cedula'] ?><br>
                        <?= $acc['patient_phone'] ?>
                    </td>
                    <td class="text-right">$ <?= number_format($acc['total_usd'], 2) ?></td>
                    <td class="text-right text-gray">$ <?= number_format($acc['paid_usd'], 2) ?></td>
                    <td class="text-right text-red">$ <?= number_format($pending, 2) ?></td>
                </tr>
            <?php endforeach; ?>
            <?php if(count($data) === 0 || $totalDeuda <= 0): ?>
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px; color: #059669;">
                        ¡Excelente! No hay cuentas por cobrar pendientes.
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
