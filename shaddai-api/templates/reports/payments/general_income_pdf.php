<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte General de Ingresos</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #4f46e5; font-size: 18px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        
        .section-title { font-size: 14px; font-weight: bold; color: #4f46e5; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
        th { background-color: #f3f4f6; color: #374151; font-weight: bold; font-size: 10px; text-transform: uppercase; }
        tr:nth-child(even) { background-color: #f9fafb; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 9px; }
        .text-xs { font-size: 8px; }
        .text-emerald { color: #059669; }
        .text-red { color: #dc2626; }
        .text-gray { color: #6b7280; }

        .summary-box { width: 100%; margin-bottom: 20px; }
        .summary-box td { border: 1px solid #e5e7eb; padding: 10px; background-color: #fff; width: 25%; text-align: center; }
        .summary-label { font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px; }
        .summary-value { font-size: 14px; font-weight: bold; color: #111827; display: block; }
        .summary-sub { font-size: 9px; color: #9ca3af; display: block; margin-top: 2px; }

        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 9px; text-align: center; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Reporte General de Ingresos y Auditoría</h2>
        <p>
            <strong>Desde:</strong> <?= date('d/m/Y', strtotime($startDate)) ?> 
            <strong>Hasta:</strong> <?= date('d/m/Y', strtotime($endDate)) ?> <br>
            Generado por: <?= htmlspecialchars($generatedBy) ?> | Fecha: <?= date('d/m/Y H:i A') ?>
        </p>
    </div>

    <!-- Resumen Financiero -->
    <div class="section-title">Resumen Financiero Consolidado</div>
    <table class="summary-box">
        <tr>
            <td>
                <span class="summary-label">Total Percibido (USD EQ)</span>
                <span class="summary-value">$ <?= number_format($data['summary']['total_global_usd_eq'], 2) ?></span>
                <span class="summary-sub">Todas las monedas</span>
            </td>
            <td>
                <span class="summary-label">Efectivo USD</span>
                <span class="summary-value">$ <?= number_format($data['summary']['usd_cash'], 2) ?></span>
                <span class="summary-sub">En Caja Física</span>
            </td>
            <td>
                <span class="summary-label">Bancos Nacionales (BS)</span>
                <span class="summary-value">Bs <?= number_format($data['summary']['bs_mobile'] + $data['summary']['bs_transfer'], 2) ?></span>
                <span class="summary-sub">Pago Móvil + Transf.</span>
            </td>
        </tr>
    </table>

    <!-- Detalle de Pagos -->
    <div class="section-title">Detalle de Movimientos de Ingreso (<?= count($data['details']['all_movements']) ?>)</div>
    <table>
        <thead>
            <tr>
                <th style="width: 80px;">Fecha</th>
                <th style="width: 100px;">Método</th>
                <th>Paciente / Responsable</th>
                <th>Referencia / Notas</th>
                <th class="text-right" style="width: 80px;">Monto</th>
                <th class="text-center" style="width: 80px;">Estatus</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data['details']['all_movements'] as $pay): ?>
                <?php
                    // Method Mapping
                    $rawMethod = strtolower($pay['payment_method']);
                    $methodName = $rawMethod;
                    if (strpos($rawMethod, 'transfer') !== false) $methodName = 'Transferencia';
                    if (strpos($rawMethod, 'mobile') !== false) $methodName = 'Pago Móvil';
                    if (strpos($rawMethod, 'cash') !== false) $methodName = 'Efectivo';
                    if (strpos($rawMethod, 'zelle') !== false) $methodName = 'Zelle';
                    if (strpos($rawMethod, 'card') !== false) $methodName = 'T. Débito/Crédito';

                    // Status Mapping
                    $statusTrans = [
                        'pending'  => 'Pendiente',
                        'verified' => 'Verificado',
                        'approved' => 'Aprobado',
                        'rejected' => 'Rechazado',
                        'annulled' => 'Anulado'
                    ];
                    $statusDisplay = $statusTrans[$pay['status']] ?? ucfirst($pay['status']);
                    
                    // Patient/Payer Logic
                    $patient = $pay['patient_name'] ?? 'N/A';
                    $payer = $pay['payer_name'] ?? null;
                    $displayNames = "<strong>" . htmlspecialchars($patient) . "</strong>";
                    if ($payer && $payer !== $patient) {
                        $displayNames .= "<br><span class='text-xs text-gray'>Resp: " . htmlspecialchars($payer) . "</span>";
                    }
                ?>
                <tr>
                    <td class="text-sm"><?= date('d/m/Y H:i', strtotime($pay['payment_date'])) ?></td>
                    <td class="text-sm"><?= htmlspecialchars($methodName) ?> (<?= $pay['currency'] ?>)</td>
                    <td><?= $displayNames ?></td>
                    <td class="text-sm">
                        <?= htmlspecialchars($pay['reference_number'] ?? '-') ?>
                        <?php if(!empty($pay['notes'])): ?>
                            <br><span class="text-xs text-gray"><?= htmlspecialchars($pay['notes']) ?></span>
                        <?php endif; ?>
                    </td>
                    <td class="text-right font-bold">
                        <?= $pay['currency'] ?> <?= number_format($pay['amount'], 2) ?>
                        <?php if($pay['currency'] === 'BS'): ?>
                            <br><span class="text-xs text-gray">($<?= number_format($pay['amount_usd_equivalent'], 2) ?>)</span>
                        <?php endif; ?>
                    </td>
                    <td class="text-center">
                        <?php 
                            $stColor = match($pay['status']) {
                                'verified', 'approved' => 'text-emerald',
                                'rejected', 'annulled' => 'text-red',
                                default => 'text-gray'
                            };
                        ?>
                        <span class="<?= $stColor ?> font-bold text-xs"><?= strtoupper($statusDisplay) ?></span>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if(empty($data['details']['all_movements'])): ?>
                <tr><td colspan="6" class="text-center text-gray">No se registraron movimientos en este periodo.</td></tr>
            <?php endif; ?>
        </tbody>
    </table>

    <!-- Auditoría de Recibos -->
    <div class="section-title">Auditoría de Recibos Emitidos</div>
    <table>
        <thead>
            <tr>
                <th>Nro Recibo</th>
                <th>Fecha Emisión</th>
                <th>Paciente</th>
                <th>Emitido Por</th>
                <th class="text-center">Estatus</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data['details']['receipts'] as $receipt): ?>
                <tr>
                    <td class="font-bold"><?= htmlspecialchars($receipt['receipt_number']) ?></td>
                    <td><?= date('d/m/Y H:i', strtotime($receipt['issued_at'])) ?></td>
                    <td><?= htmlspecialchars($receipt['patient_name']) ?></td>
                    <td><?= htmlspecialchars($receipt['issued_by_name'] ?? 'N/A') ?></td>
                    <td class="text-center">
                        <?php if($receipt['status'] === 'annulled'): ?>
                            <span class="text-red font-bold">ANULADO</span>
                        <?php else: ?>
                            <span class="text-emerald">ACTIVO</span>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <!-- Cuentas Aperturadas -->
    <div class="section-title">Cuentas Aperturadas</div>
    <table>
        <thead>
            <tr>
                <th>ID Cuenta</th>
                <th>Fecha Apertura</th>
                <th>Paciente / Responsable</th>
                <th class="text-right">Total Facturado</th>
                <th class="text-center">Estatus</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data['details']['new_accounts'] as $acc): ?>
                <?php 
                    $patient = $acc['patient_name'] ?? 'N/A';
                    $payer = $acc['payer_name'] ?? null; 
                    $displayNames = htmlspecialchars($patient);
                    if ($payer && $payer !== $patient) {
                        $displayNames .= " / " . htmlspecialchars($payer);
                    }
                    
                    $stName = $acc['status'] ?? 'pending';
                    
                    $accStatusMap = [
                        'open' => 'Abierta',
                        'closed' => 'Cerrada',
                        'paid' => 'Pagada',
                        'annulled' => 'Anulada',
                        'pending' => 'Pendiente'
                    ];
                    $stDisplay = $accStatusMap[$stName] ?? $stName;

                    $stColor = match($stName) {
                        'paid' => 'text-emerald',
                        'annulled' => 'text-red',
                         default => 'text-gray'
                    };
                ?>
                <tr>
                    <td class="font-bold text-center">#<?= $acc['id'] ?></td>
                    <td><?= date('d/m/Y H:i', strtotime($acc['created_at'])) ?></td>
                    <td><?= $displayNames ?></td>
                    <td class="text-right">$ <?= number_format($acc['total_usd'], 2) ?></td>
                    <td class="text-center text-xs font-bold <?= $stColor ?>"><?= strtoupper($stDisplay) ?></td>
                </tr>
            <?php endforeach; ?>
            <?php if(empty($data['details']['new_accounts'])): ?>
                <tr><td colspan="5" class="text-center text-gray">No se crearon nuevas cuentas en este periodo.</td></tr>
            <?php endif; ?>
        </tbody>
    </table>

    <div class="footer">
        Este documento es confidencial y para uso exclusivo del departamento administrativo. <br> 
        Generado por Sistema Médico Shaddai
    </div>
</body>
</html>
