<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; font-size: 12px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #0056b3; font-size: 20px; text-transform: uppercase; }
        .header h2 { margin: 5px 0 0; color: #555; font-size: 14px; font-weight: normal; }
        
        .section { margin-bottom: 20px; }
        .section-title { background-color: #e2e8f0; color: #1e293b; padding: 5px 10px; font-weight: bold; font-size: 13px; border-left: 4px solid #0056b3; margin-bottom: 10px; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table td { padding: 4px; vertical-align: top; }
        .label { font-weight: bold; color: #64748b; width: 140px; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
        .data-table th { background-color: #f1f5f9; color: #334155; padding: 6px; text-align: left; border-bottom: 1px solid #cbd5e1; }
        .data-table td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
        
        .encounter-block { border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; margin-bottom: 15px; page-break-inside: avoid; }
        .encounter-header { border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; }
        .encounter-date { font-weight: bold; color: #0056b3; }
        .encounter-doctor { color: #64748b; font-size: 11px; }
        
        .sub-section { margin-top: 10px; margin-bottom: 5px; font-weight: bold; font-size: 11px; color: #475569; text-decoration: underline; }
        .content-text { margin-bottom: 5px; text-align: justify; }
        
        .tag { display: inline-block; background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 5px; border: 1px solid #cbd5e1; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 9px; text-align: center; color: #cbd5e1; border-top: 1px solid #e2e8f0; padding-top: 5px; }
        .page-number:after { content: counter(page); }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Historia Clínica Completa</h2>
    </div>

    <!-- Paciente -->
    <div class="section">
        <div class="section-title">Información del Paciente</div>
        <table class="info-table">
            <tr>
                <td class="label">Nombre Completo:</td>
                <td><?php echo htmlspecialchars($fullData['record']['patient_name']); ?></td>
                <td class="label">Cédula:</td>
                <td><?php echo htmlspecialchars($fullData['record']['patient_cedula']); ?></td>
            </tr>
            <tr>
                <td class="label">Nº Historia:</td>
                <td><?php echo htmlspecialchars($fullData['record']['record_number'] ?? 'N/A'); ?></td>
                <td class="label">Fecha de Creación:</td>
                <td><?php echo date('d/m/Y', strtotime($fullData['record']['created_at'])); ?></td>
            </tr>
        </table>
    </div>

    <!-- Antecedentes -->
    <?php 
    $historyTypeMap = [
        'personal_pathological' => 'Patológicos Personales',
        'personal_non_pathological' => 'No Patológicos Personales',
        'family' => 'Familiares',
        'gynecological' => 'Ginecológicos',
        'surgical' => 'Quirúrgicos',
        'allergies' => 'Alergias',
        'medications' => 'Medicamentos',
        'habits' => 'Hábitos',
        'vaccinations' => 'Vacunación',
        'other' => 'Otros'
    ];
    ?>
    <?php if (!empty($fullData['history'])): ?>
    <div class="section">
        <div class="section-title">Antecedentes Médicos</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="20%">Tipo</th>
                    <th width="60%">Descripción</th>
                    <th width="20%">Fecha Registro</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($fullData['history'] as $item): ?>
                <tr>
                    <td><strong><?php echo htmlspecialchars($historyTypeMap[$item['history_type']] ?? ucfirst($item['history_type'])); ?></strong></td>
                    <td><?php echo nl2br(htmlspecialchars($item['description'])); ?></td>
                    <td><?php echo $item['recorded_at'] ? date('d/m/Y', strtotime($item['recorded_at'])) : '-'; ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>

    <!-- Encuentros Clínicos -->
    <div class="section">
        <div class="section-title">Historial de Consultas y Encuentros</div>
        
        <?php if (empty($fullData['encounters'])): ?>
            <p style="text-align: center; color: #64748b; padding: 20px;">No hay registros de consultas o encuentros clínicos.</p>
        <?php else: ?>
            <?php foreach ($fullData['encounters'] as $enc): ?>
            <div class="encounter-block">
                <div class="encounter-header">
                    <span class="encounter-date">
                        <?php echo date('d/m/Y h:i A', strtotime($enc['encounter_date'])); ?> - 
                        <?php echo htmlspecialchars($enc['encounter_type']); ?>
                    </span>
                    <span class="encounter-doctor">
                        Dr(a). <?php echo htmlspecialchars($enc['doctor_name']); ?> 
                        (<?php echo htmlspecialchars($enc['specialty_name']); ?>)
                    </span>
                </div>

                <?php if ($enc['chief_complaint']): ?>
                <div class="sub-section">Motivo de Consulta:</div>
                <div class="content-text"><?php echo nl2br(htmlspecialchars($enc['chief_complaint'])); ?></div>
                <?php endif; ?>

                <?php if ($enc['present_illness']): ?>
                <div class="sub-section">Enfermedad Actual:</div>
                <div class="content-text"><?php echo nl2br(htmlspecialchars($enc['present_illness'])); ?></div>
                <?php endif; ?>

                <!-- Signos Vitales del Encuentro -->
                <?php if (!empty($enc['vital_signs'])): $vs = $enc['vital_signs']; ?>
                <div class="sub-section">Signos Vitales:</div>
                <div class="content-text" style="font-size: 11px; background: #f8fafc; padding: 5px;">
                    <strong>PA:</strong> <?php echo $vs['systolic_bp'] && $vs['diastolic_bp'] ? $vs['systolic_bp'].'/'.$vs['diastolic_bp'] : '-'; ?> mmHg | 
                    <strong>FC:</strong> <?php echo $vs['heart_rate'] ?: '-'; ?> lpm | 
                    <strong>FR:</strong> <?php echo $vs['respiratory_rate'] ?: '-'; ?> rpm | 
                    <strong>Temp:</strong> <?php echo $vs['temperature'] ?: '-'; ?> °C | 
                    <strong>SatO2:</strong> <?php echo $vs['oxygen_saturation'] ?: '-'; ?> % | 
                    <strong>Peso:</strong> <?php echo $vs['weight'] ?: '-'; ?> kg
                </div>
                <?php endif; ?>

                <!-- Examen Físico -->
                <?php if (!empty($enc['physical_exam'])): $pe = $enc['physical_exam']; ?>
                <div class="sub-section">Examen Físico:</div>
                <div class="content-text">
                    <?php if($pe['vitals_summary']) echo "<strong>Resumen:</strong> " . htmlspecialchars($pe['vitals_summary']) . "<br>"; ?>
                    <?php if($pe['general_appearance']) echo "<strong>Apariencia Gral:</strong> " . htmlspecialchars($pe['general_appearance']) . "<br>"; ?>
                    <?php if($pe['head_neck']) echo "<strong>Cabeza/Cuello:</strong> " . htmlspecialchars($pe['head_neck']) . "<br>"; ?>
                    <?php if($pe['chest_lungs']) echo "<strong>Tórax/Pulmones:</strong> " . htmlspecialchars($pe['chest_lungs']) . "<br>"; ?>
                    <?php if($pe['cardiovascular']) echo "<strong>Cardiovascular:</strong> " . htmlspecialchars($pe['cardiovascular']) . "<br>"; ?>
                    <?php if($pe['abdomen']) echo "<strong>Abdomen:</strong> " . htmlspecialchars($pe['abdomen']) . "<br>"; ?>
                    <?php if($pe['extremities']) echo "<strong>Extremidades:</strong> " . htmlspecialchars($pe['extremities']) . "<br>"; ?>
                    <?php if($pe['neurological']) echo "<strong>Neurológico:</strong> " . htmlspecialchars($pe['neurological']) . "<br>"; ?>
                    <?php if($pe['skin']) echo "<strong>Piel:</strong> " . htmlspecialchars($pe['skin']) . "<br>"; ?>
                    <?php if($pe['notes']) echo "<strong>Notas:</strong> " . htmlspecialchars($pe['notes']) . "<br>"; ?>
                </div>
                <?php endif; ?>

                <!-- Diagnósticos -->
                <?php if (!empty($enc['diagnoses'])): ?>
                <div class="sub-section">Diagnósticos:</div>
                <ul style="margin: 5px 0; padding-left: 20px; font-size: 11px;">
                    <?php foreach ($enc['diagnoses'] as $diag): ?>
                    <li>
                        <strong><?php echo htmlspecialchars($diag['diagnosis_description']); ?></strong>
                        <?php if($diag['diagnosis_code']) echo " (" . htmlspecialchars($diag['diagnosis_code']) . ")"; ?>
                        - <em><?php echo htmlspecialchars($diag['diagnosis_type']); ?></em>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php endif; ?>

                <!-- Plan / Tratamiento -->
                <?php if (!empty($enc['treatment_plans'])): ?>
                <div class="sub-section">Plan y Tratamiento:</div>
                <ul style="margin: 5px 0; padding-left: 20px; font-size: 11px;">
                    <?php foreach ($enc['treatment_plans'] as $plan): ?>
                    <li>
                        <span class="tag"><?php echo htmlspecialchars($plan['plan_type']); ?></span>
                        <?php echo htmlspecialchars($plan['description']); ?>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php endif; ?>

                <!-- Notas de Progreso -->
                <?php if (!empty($enc['progress_notes'])): ?>
                <div class="sub-section">Notas de Evolución:</div>
                <?php foreach ($enc['progress_notes'] as $note): ?>
                <div style="border-left: 2px solid #cbd5e1; padding-left: 8px; margin-bottom: 5px; font-size: 11px;">
                    <div style="font-size: 10px; color: #64748b;">
                        <?php echo date('d/m/Y h:i A', strtotime($note['created_at'])); ?> - 
                        <?php echo htmlspecialchars($note['author_name']); ?>
                    </div>
                    <div><?php echo nl2br(htmlspecialchars($note['note_content'])); ?></div>
                </div>
                <?php endforeach; ?>
                <?php endif; ?>

            </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- Otros Registros (Reportes) -->
    <?php if (!empty($fullData['reports'])): ?>
    <div class="section">
        <div class="section-title">Documentos Adicionales</div>
        
        <div class="sub-section">Informes Generados:</div>
        <ul style="font-size: 11px;">
            <?php foreach ($fullData['reports'] as $rep): ?>
            <li>
                Informe de <?php echo htmlspecialchars($rep['report_type'] ?: 'General'); ?> 
                (<?php echo date('d/m/Y', strtotime($rep['report_date'])); ?>) - 
                Dr(a). <?php echo htmlspecialchars($rep['doctor_name']); ?>
            </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <?php endif; ?>

    <div class="footer">
        Reporte generado el <?php echo date('d/m/Y H:i'); ?> por <?php echo htmlspecialchars($generatedBy); ?>. <br>
        Página <span class="page-number"></span>
    </div>
</body>
</html>