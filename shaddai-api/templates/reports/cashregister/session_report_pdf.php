<?php
// Template params:
// $session: (array) session row + user data (start_time, end_time, user first/last name, balances...)
// $movements: (array) all cash movements [optional for summary, but good for detail]
// $electronic: (array) summary of electronic payments in that period [transfer_bs, mobile_payment_bs]
// $accounts_created: (array) list of billing accounts created by user in session period
// $cancelled_receipts: (array) list of receipts cancelled in period
// $totals: (array) calculated totals [cash_in_usd, cash_in_bs, etc.]
// $generated_by: (string) name of admin requesting report
// $generated_at: (string) date time
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resumen de Caja Número <?= $session['id'] ?></title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
        .header h1 { margin: 0; font-size: 18px; color: #000; text-transform: uppercase; }
        .header p { margin: 2px 0; color: #666; font-size: 11px; }
        
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-table td { padding: 5px; vertical-align: top; }
        .label { font-weight: bold; color: #555; width: 120px; }
        
        .section-title { background: #f4f4f4; padding: 5px 10px; font-weight: bold; border-left: 4px solid #333; margin: 15px 0 10px 0; font-size: 13px; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        .data-table th { background: #fafafa; font-weight: bold; font-size: 11px; text-transform: uppercase; }
        .data-table tr:nth-child(even) { background: #fcfcfc; }
        
        .totals-box { width: 100%; margin-top: 5px; padding: 10px; background: #fafafa; border: 1px solid #eee; }
        .totals-row { display: block; margin-bottom: 5px; font-size: 13px; }
        .money { font-family: monospace; font-weight: bold; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 9px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 5px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 50px; color: rgba(0,0,0,0.03); z-index: -1; font-weight: bold; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Resumen de Caja Número <?= $session['id'] ?></h2>
        <p>Generado por: <?= htmlspecialchars($generated_by) ?> | Fecha: <?= $generated_at ?></p>
    </div>

    <table class="meta-table">
        <tr>
            <td width="50%">
                <div class="label">CAJERO(A):</div>
                <?= htmlspecialchars($session['first_name'] . ' ' . $session['last_name']) ?><br>
            </td>
            <td width="50%">
                <div class="label">APERTURA:</div>
                <?= date('d/m/Y h:i A', strtotime($session['start_time'])) ?><br>
                <div class="label">CIERRE:</div>
                <?= $session['end_time'] ? date('d/m/Y h:i A', strtotime($session['end_time'])) : 'N/A' ?>
            </td>
        </tr>
    </table>

    <!-- TOTALS SUMMARY -->
    <div class="section-title">RESUMEN FINANCIERO</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Concepto</th>
                <th style="text-align:right">Total USD</th>
                <th style="text-align:right">Total Bs</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Fondo Inicial (Caja)</td>
                <td style="text-align:right" class="money"><?= number_format($session['start_balance_usd'], 2) ?></td>
                <td style="text-align:right" class="money"><?= number_format($session['start_balance_bs'], 2) ?></td>
            </tr>
            <tr>
                <td>Ingresos Efectivo (Recaudado)</td>
                <td style="text-align:right" class="money"><?= number_format($totals['cash_in_usd'], 2) ?></td>
                <td style="text-align:right" class="money"><?= number_format($totals['cash_in_bs'], 2) ?></td>
            </tr>
            <tr>
                <td>Pago Móvil (Periodo Sesión)</td>
                <td style="text-align:right" class="money">-</td>
                <td style="text-align:right" class="money"><?= number_format($totals['mobile_bs'], 2) ?></td>
            </tr>
            <tr>
                <td>Transferencias (Periodo Sesión)</td>
                <td style="text-align:right" class="money">-</td>
                <td style="text-align:right" class="money"><?= number_format($totals['transfer_bs'], 2) ?></td>
            </tr>
            <tr style="background:#eee; font-weight:bold;">
                <td>TOTAL GENERAL MOVIMIENTOS</td>
                <td style="text-align:right" class="money">$<?= number_format($totals['total_usd_movements'], 2) ?></td>
                <td style="text-align:right" class="money">Bs <?= number_format($totals['total_bs_movements'], 2) ?></td>
            </tr>
            <tr>
                <td colspan="3" style="font-size:10px; color:#666;">
                    * El Total General incluye Efectivo ingesado + Electrónicos. No incluye fondo inicial.
                    <br>
                    * Efectivo en Cierre Declarado: $<?= number_format($session['real_end_balance_usd'] ?? 0, 2) ?> / Bs <?= number_format($session['real_end_balance_bs'] ?? 0, 2) ?>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- ELECTRONIC PAYMENTS DETAIL -->
    <?php if (!empty($electronic_payments)): ?>
    <div class="section-title">DETALLE PAGOS ELECTRÓNICOS (<?= count($electronic_payments) ?>)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Método</th>
                <th>Referencia</th>
                <th>Descripción / Cuenta</th>
                <th style="text-align:right">Monto (Bs)</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach($electronic_payments as $ep): ?>
            <tr>
                <td><?= date('d/m H:i', strtotime($ep['created_at'])) ?></td>
                <td>
                    <?php 
                        $m = $ep['payment_method'] ?? 'N/A';
                        echo $m === 'mobile_payment_bs' ? 'Pago Móvil' : ($m === 'transfer_bs' ? 'Transferencia' : $m);
                    ?>
                </td>
                <td style="font-family:monospace;"><?= htmlspecialchars($ep['reference_number'] ?? 'N/A') ?></td>
                <td><?= htmlspecialchars($ep['description'] ?? '-') ?></td>
                <td style="text-align:right"><?= number_format($ep['amount'], 2) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php endif; ?>

    <!-- ACCOUNTS CREATED -->
    <div class="section-title">CUENTAS CREADAS EN SESIÓN (<?= count($accounts_created ?? []) ?>)</div>
    <?php if (empty($accounts_created)): ?>
        <p style="font-style:italic; color:#666; margin-left:10px;">No se crearon cuentas en este periodo.</p>
    <?php else: ?>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>Pagador</th>
                    <th>Total Estimado</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                <?php 
                $statusMap = [
                    'pending' => 'Pendiente',
                    'partial' => 'Parcial',
                    'paid' => 'Pagada',
                    'cancelled' => 'Cancelada'
                ];
                foreach($accounts_created as $acc): 
                    $pName = $acc['full_name'] ?? 'S/N';
                    if (!empty($acc['dni'])) $pName .= ' (' . $acc['dni'] . ')';
                    $payer = $acc['payer_name'] ?? 'Mismo';
                ?>
                <tr>
                    <td>#<?= $acc['id'] ?></td>
                    <td><?= htmlspecialchars($pName) ?></td>
                    <td><?= htmlspecialchars($payer) ?></td>
                    <td>$<?= number_format($acc['total_usd'], 2) ?></td>
                    <td>
                        <span style="font-size:10px; font-weight:bold; padding:2px 4px; border-radius:3px; background-color: #eee;">
                            <?= strtoupper($statusMap[$acc['status']] ?? $acc['status']) ?>
                        </span>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>

    <!-- CANCELLED RECEIPTS / REVERSALS -->
    <?php if (!empty($cancelled_receipts)): ?>
    <div class="section-title">RECIBOS ANULADOS / REVERSOS (<?= count($cancelled_receipts) ?>)</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nro Pago/Ref</th>
                    <th>Monto Reversado</th>
                    <th>Motivo Anulación</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($cancelled_receipts as $void): ?>
                <tr>
                    <td style="color:#c00; font-weight:bold;">
                        #<?= $void['payment_id'] ?? '?' ?>
                        <br><span style="font-weight:normal; font-size:9px; color:#555;"><?= $void['reference_number'] ?? '' ?></span>
                    </td>
                    <td style="color:#c00;">
                        <?= $void['currency'] ?> -<?= number_format($void['amount'], 2) ?>
                    </td>
                    <td><?= htmlspecialchars($void['description'] ?? 'Sin motivo') ?></td>
                    <td><?= date('d/m H:i', strtotime($void['created_at'])) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>

    <div class="footer">
        Documento confidencial generado automáticamente por Sistema Médico Shaddai. Prohibida su distribución no autorizada.
    </div>

</body>
</html>
