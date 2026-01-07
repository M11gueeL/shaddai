<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; font-size: 12px; line-height: 1.4; margin: 0; padding: 20px; }
        
        /* Header */
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0056b3; padding-bottom: 15px; }
        .header h1 { margin: 0; color: #0056b3; font-size: 22px; text-transform: uppercase; font-weight: 700; }
        .header h2 { margin: 5px 0 0; color: #64748b; font-size: 14px; font-weight: normal; }
        .disclaimer { font-size: 10px; color: #94a3b8; margin-top: 5px; font-style: italic; }

        /* Sections */
        .section { margin-bottom: 25px; }
        .section-title { 
            background-color: #f1f5f9; 
            color: #1e293b; 
            padding: 8px 12px; 
            font-weight: bold; 
            font-size: 13px; 
            border-left: 4px solid #0056b3; 
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Top Info Grid */
        .info-grid { width: 100%; margin-bottom: 20px; }
        .info-grid td { vertical-align: top; padding: 0 10px; }
        .info-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
        .info-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px; }
        .info-value { font-size: 13px; color: #0f172a; font-weight: 500; }
        
        /* Receipt Badge */
        .receipt-badge {
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .receipt-number { font-size: 18px; font-weight: bold; color: #0056b3; font-family: monospace; }
        .receipt-date { font-size: 11px; color: #64748b; margin-top: 4px; }

        /* Tables */
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
        .data-table th { 
            background-color: #f8fafc; 
            color: #475569; 
            padding: 10px; 
            text-align: left; 
            border-bottom: 2px solid #cbd5e1; 
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
        }
        .data-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        .data-table tr:last-child td { border-bottom: none; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }

        /* Summary Box */
        .summary-box { 
            width: 250px; 
            margin-left: auto; 
            background-color: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 15px;
        }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px; color: #64748b; }
        .summary-row.total { 
            margin-top: 10px; 
            padding-top: 10px; 
            border-top: 2px solid #cbd5e1; 
            color: #0f172a; 
            font-weight: bold; 
            font-size: 14px; 
        }

        /* Footer */
        .footer { 
            position: fixed; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            text-align: center; 
            padding-top: 15px; 
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Comprobante de Pago</h2>
        <div class="disclaimer">Este documento es un control interno administrativo. no tiene validez como factura fiscal.</div>
    </div>

    <!-- Info Section -->
    <table class="info-grid" cellspacing="0" cellpadding="0">
        <tr>
            <td width="40%" style="padding-left: 0;">
                <div class="info-box">
                    <div style="margin-bottom: 10px;">
                        <div class="info-label">Paciente</div>
                        <div class="info-value"><?php echo htmlspecialchars($receipt['patient_name']); ?></div>
                    </div>
                    <?php if($receipt['patient_name'] !== $receipt['payer_name']): ?>
                    <div>
                        <div class="info-label">Responsable de Pago</div>
                        <div class="info-value"><?php echo htmlspecialchars($receipt['payer_name']); ?></div>
                    </div>
                    <?php endif; ?>
                </div>
            </td>
            <td width="30%">
                <div class="info-box">
                    <div style="margin-bottom: 10px;">
                        <div class="info-label">Emitido Por</div>
                        <div class="info-value"><?php echo htmlspecialchars($issuerName); ?></div>
                    </div>
                    <div>
                        <div class="info-label">Cuenta Nº</div>
                        <div class="info-value">#<?php echo $receipt['account_id']; ?></div>
                    </div>
                </div>
            </td>
            <td width="30%" style="padding-right: 0;">
                <div class="receipt-badge">
                    <div class="info-label">Recibo Nº</div>
                    <div class="receipt-number"><?php echo htmlspecialchars($receipt['receipt_number']); ?></div>
                    <div class="receipt-date"><?php echo date('d/m/Y h:i A', strtotime($receipt['issued_at'])); ?></div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Services Section -->
    <div class="section">
        <div class="section-title">Detalle de Servicios</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="50%">Descripción</th>
                    <th width="15%" class="text-right">Cant.</th>
                    <th width="15%" class="text-right">Precio Unit. (USD)</th>
                    <th width="20%" class="text-right">Total (USD)</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($services) && empty($supplies)): ?>
                    <tr><td colspan="4" style="text-align:center; color: #94a3b8;">Sin cargos registrados</td></tr>
                <?php else: ?>
                    <?php foreach($services as $s): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($s['service_name']); ?></td>
                        <td class="text-right"><?php echo (int)$s['quantity']; ?></td>
                        <td class="text-right font-mono"><?php echo number_format((float)$s['price_usd'], 2); ?></td>
                        <td class="text-right font-mono"><?php echo number_format((float)$s['price_usd'] * (int)$s['quantity'], 2); ?></td>
                    </tr>
                    <?php endforeach; ?>
                    
                    <?php foreach($supplies as $sp): ?>
                    <tr>
                        <td>
                            <span style="color:#64748b; font-size:10px;">[INSUMO]</span> 
                            <?php echo htmlspecialchars($sp['item_name']); ?>
                        </td>
                        <td class="text-right"><?php echo (int)$sp['quantity']; ?></td>
                        <td class="text-right font-mono"><?php echo number_format((float)$sp['price_usd'], 2); ?></td>
                        <td class="text-right font-mono"><?php echo number_format((float)$sp['total_price_usd'], 2); ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Payments Section -->
    <div class="section">
        <div class="section-title">Pagos Aplicados</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="20%">Fecha</th>
                    <th width="30%">Método</th>
                    <th width="30%">Referencia</th>
                    <th width="20%" class="text-right">Monto</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($payments)): ?>
                    <tr><td colspan="4" style="text-align:center; color: #94a3b8;">No se han registrado pagos</td></tr>
                <?php else: ?>
                    <?php 
                    $paymentMethods = [
                        'cash_usd' => 'Efectivo Divisa',
                        'cash_bs' => 'Efectivo Bolívares',
                        'transfer_bs' => 'Transferencia',
                        'mobile_payment_bs' => 'Pago Móvil',
                        'zelle' => 'Zelle',
                        'card' => 'Tarjeta'
                    ];
                    foreach($payments as $p): 
                        $methodName = $paymentMethods[$p['payment_method']] ?? $p['payment_method'];
                    ?>
                    <tr>
                        <td><?php echo date('d/m/Y', strtotime($p['payment_date'])); ?></td>
                        <td><?php echo htmlspecialchars($methodName); ?></td>
                        <td class="font-mono" style="font-size:10px;"><?php echo htmlspecialchars($p['reference_number'] ?: '-'); ?></td>
                        <td class="text-right font-mono">
                            <?php if($p['currency'] === 'BS'): ?>
                                <div style="font-size:10px; color:#64748b;">Bs. <?php echo number_format((float)$p['amount'], 2); ?></div>
                                <div>$<?php echo number_format((float)$p['amount_usd_equivalent'], 2); ?></div>
                            <?php else: ?>
                                <div>$<?php echo number_format((float)$p['amount'], 2); ?></div>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Layout for Totals -->
    <div style="width: 100%;">
        <table width="100%">
            <tr>
                <td width="60%" style="vertical-align: top; padding-right: 30px;">
                    <!-- Notes or Exchange Rate Info -->
                    <?php if($receipt['rate_bcv'] > 0): ?>
                    <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                        <span style="font-weight: bold; font-size: 11px; color: #475569;">Tasa de Cambio Aplicada:</span>
                        <span style="font-family: monospace; font-size: 12px; color: #334155; margin-left: 5px;">Bs. <?php echo number_format((float)$receipt['rate_bcv'], 2); ?> / USD</span>
                    </div>
                    <?php endif; ?>
                </td>
                <td width="40%" style="vertical-align: top;">
                    <table width="100%" cellspacing="0" cellpadding="5" style="border: 1px solid #cbd5e1; border-radius: 6px;">
                        <tr style="background: #f8fafc;">
                            <td style="color: #64748b; font-size: 11px; font-weight: bold;">Total Operación</td>
                            <td class="text-right font-mono" style="font-weight: bold;">$<?php echo number_format((float)$receipt['total_usd'], 2); ?></td>
                        </tr>
                        <tr>
                            <td style="color: #64748b; font-size: 11px;">Abonado</td>
                            <td class="text-right font-mono" style="color: #059669;">$<?php echo number_format($paidUsdTotal, 2); ?></td>
                        </tr>
                        <?php if($saldoUsd > 0.01): ?>
                        <tr style="background: #fff1f2;">
                            <td style="color: #be123c; font-size: 11px; font-weight: bold;">Saldo Pendiente</td>
                            <td class="text-right font-mono" style="color: #be123c; font-weight: bold;">$<?php echo number_format($saldoUsd, 2); ?></td>
                        </tr>
                        <?php else: ?>
                        <tr style="background: #ecfdf5;">
                            <td colspan="2" style="text-align: center; color: #059669; font-weight: bold; font-size: 12px; padding: 10px;">
                                ¡PAGADO TOTALMENTE!
                            </td>
                        </tr>
                        <?php endif; ?>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        Documento generado el <?php echo date('d/m/Y h:i A'); ?> por Sistema Médico Shaddai
        <br>
        Gracias por su preferencia
    </div>
</body>
</html>