<?php
require_once __DIR__ . '/../config/Database.php';

use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class InventoryReportService {

    public function generateExpirationRiskPdf($data, $generatedBy = '') {
        ob_start();
        require __DIR__ . '/../templates/reports/inventory/expiration_risk_pdf.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="reporte_vencimientos.pdf"');
        echo $dompdf->output();
        exit;
    }

    public function generateConsumptionAnalysisPdf($data, $startDate, $endDate, $generatedBy = '') {
        ob_start();
        require __DIR__ . '/../templates/reports/inventory/consumption_analysis_pdf.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="reporte_consumo_interno.pdf"');
        echo $dompdf->output();
        exit;
    }

    private function translateMovementType($type) {
        $map = [
            'in_restock' => 'Abastecimiento',
            'in_adjustment' => 'Ajuste de stock (Entrada)',
            'out_adjustment' => 'Ajuste de stock (Salida)',
            'out_expired' => 'Baja / Vencimiento',
            'out_damaged' => 'Baja / Dañado',
            'out_internal_use' => 'Uso Interno',
            'out_billed' => 'Salida / Consumo'
        ];
        return $map[$type] ?? ucfirst(str_replace('_', ' ', $type));
    }

    public function generateKardexPdf($data, $startDate, $endDate, $generatedBy = '') {
        // Traducir tipos antes de pasar a la vista
        foreach ($data as &$row) {
            $row['movement_type_label'] = $this->translateMovementType($row['movement_type']);
        }
        unset($row); // Romper referencia

        ob_start();
        require __DIR__ . '/../templates/reports/inventory/kardex_pdf.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape'); // Landscape for more columns
        $dompdf->render();

        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="reporte_kardex.pdf"');
        echo $dompdf->output();
        exit;
    }

    public function generateExpirationRiskExcel($data, $generatedBy = '') {
        if (ob_get_length()) ob_end_clean();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Título
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'REPORTE DE SEMÁFORO DE VENCIMIENTOS - Centro de Especialidades Médicas Shaddai Rafa');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0056B3');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Meta
        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', "Generado por: $generatedBy | Fecha: " . date('d/m/Y H:i'));
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Encabezados
        $headers = ['Insumo', 'Lote', 'Cantidad', 'Vencimiento', 'Días Restantes'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        // Estilo Encabezado
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0056B3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A4:E4')->applyFromArray($headerStyle);

        // Datos
        $row = 5;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, $item['item_name']);
            $sheet->setCellValue('B' . $row, $item['batch_number']);
            $sheet->setCellValue('C' . $row, $item['remaining_quantity']);
            $sheet->setCellValue('D' . $row, date('d/m/Y', strtotime($item['expiration_date'])));
            $sheet->setCellValue('E' . $row, $item['days_remaining']);

            // Colorear celdas según riesgo
            if ($item['days_remaining'] < 30) {
                $sheet->getStyle('E' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FEE2E2'); // Rojo claro
                $sheet->getStyle('E' . $row)->getFont()->getColor()->setRGB('B91C1C');
            } elseif ($item['days_remaining'] < 90) {
                $sheet->getStyle('E' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FEF3C7'); // Amarillo claro
                $sheet->getStyle('E' . $row)->getFont()->getColor()->setRGB('B45309');
            }

            $row++;
        }

        $sheet->getStyle('A4:E' . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="reporte_vencimientos.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function generateKardexExcel($data, $startDate, $endDate, $generatedBy = '') {
        if (ob_get_length()) ob_end_clean();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Título
        $sheet->mergeCells('A1:H1');
        $sheet->setCellValue('A1', 'REPORTE DE KARDEX DE MOVIMIENTOS - Centro de Especialidades Médicas Shaddai Rafa');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0056B3');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Meta
        $sheet->mergeCells('A2:H2');
        $sheet->setCellValue('A2', "Del $startDate al $endDate | Generado por: $generatedBy");
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Encabezados
        $headers = ['Fecha/Hora', 'Código', 'Insumo', 'Tipo', 'Responsable', 'Movimiento', 'Saldo', 'Notas'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        // Estilo Encabezado
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0056B3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A4:H4')->applyFromArray($headerStyle);

        // Datos
        $row = 5;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, date('d/m/Y H:i', strtotime($item['created_at'])));
            $sheet->setCellValue('B' . $row, $item['item_code']);
            $sheet->setCellValue('C' . $row, $item['item_name']);
            $sheet->setCellValue('D' . $row, $this->translateMovementType($item['movement_type']));
            $sheet->setCellValue('E' . $row, $item['user_name']);
            
            // Movimiento con signo
            $isEntry = strpos($item['movement_type'], 'in_') === 0;
            $sign = $isEntry ? '+' : '-';
            $sheet->setCellValue('F' . $row, $sign . $item['quantity_moved']);
            
            // Saldo (si existe)
            $sheet->setCellValue('G' . $row, $item['balance'] ?? '-');
            
            $sheet->setCellValue('H' . $row, $item['notes']);

            // Colores para movimiento
            if ($isEntry) {
                $sheet->getStyle('F' . $row)->getFont()->getColor()->setRGB('15803D'); // Verde
            } else {
                $sheet->getStyle('F' . $row)->getFont()->getColor()->setRGB('B91C1C'); // Rojo
            }

            $row++;
        }

        $sheet->getStyle('A4:H' . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="reporte_kardex.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function generatePurchaseSuggestionPdf($data, $generatedBy = '') {
        ob_start();
        require __DIR__ . '/../templates/reports/inventory/purchase_suggestion_pdf.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="sugerido_compras.pdf"');
        echo $dompdf->output();
        exit;
    }

    public function generatePurchaseSuggestionExcel($data, $generatedBy = '') {
        if (ob_get_length()) ob_end_clean();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Título
        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', 'SUGERIDO DE COMPRAS - Centro de Especialidades Médicas Shaddai Rafa');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0056B3');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Meta
        $sheet->mergeCells('A2:E2');
        $sheet->setCellValue('A2', "Generado por: $generatedBy | Fecha: " . date('d/m/Y H:i'));
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Encabezados
        $headers = ['Código', 'Insumo', 'Stock Actual', 'Punto Reorden', 'Déficit Sugerido'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        // Estilo Encabezado
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0056B3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A4:E4')->applyFromArray($headerStyle);

        // Datos
        $row = 5;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, $item['code']);
            $sheet->setCellValue('B' . $row, $item['item_name']);
            $sheet->setCellValue('C' . $row, $item['stock_quantity']);
            $sheet->setCellValue('D' . $row, $item['reorder_level']);
            $sheet->setCellValue('E' . $row, $item['deficit']);

            // Resaltar déficit alto
            if ($item['stock_quantity'] == 0) {
                $sheet->getStyle('C' . $row)->getFont()->getColor()->setRGB('B91C1C'); // Rojo si stock 0
                $sheet->getStyle('C' . $row)->getFont()->setBold(true);
            }

            $row++;
        }

        $sheet->getStyle('A4:E' . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="sugerido_compras.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function generateLeaksAdjustmentsPdf($data, $startDate, $endDate, $generatedBy = '') {
        // Traducir tipos
        foreach ($data as &$row) {
            $row['movement_type_label'] = $this->translateMovementType($row['movement_type']);
        }
        unset($row);

        ob_start();
        require __DIR__ . '/../templates/reports/inventory/leaks_adjustments_pdf.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="fugas_ajustes.pdf"');
        echo $dompdf->output();
        exit;
    }

    public function generateLeaksAdjustmentsExcel($data, $startDate, $endDate, $generatedBy = '') {
        if (ob_get_length()) ob_end_clean();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Título
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'REPORTE DE FUGAS Y AJUSTES MANUALES - Centro de Especialidades Médicas Shaddai Rafa');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('B91C1C'); // Rojo para alertas
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Meta
        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', "Del $startDate al $endDate | Generado por: $generatedBy");
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Encabezados
        $headers = ['Fecha/Hora', 'Insumo', 'Usuario', 'Tipo', 'Cantidad', 'Nota/Justificación'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        // Estilo Encabezado
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'B91C1C']], // Rojo
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A4:F4')->applyFromArray($headerStyle);

        // Datos
        $row = 5;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, date('d/m/Y H:i', strtotime($item['created_at'])));
            $sheet->setCellValue('B' . $row, $item['item_name']);
            $sheet->setCellValue('C' . $row, $item['user_name']);
            $sheet->setCellValue('D' . $row, $this->translateMovementType($item['movement_type']));
            
            // Cantidad
            $isEntry = strpos($item['movement_type'], 'in_') === 0;
            $sign = $isEntry ? '+' : '-';
            $sheet->setCellValue('E' . $row, $sign . $item['quantity_adjusted']);
            
            $sheet->setCellValue('F' . $row, $item['notes']);

            // Colores
            if ($isEntry) {
                $sheet->getStyle('E' . $row)->getFont()->getColor()->setRGB('15803D');
            } else {
                $sheet->getStyle('E' . $row)->getFont()->getColor()->setRGB('B91C1C');
            }

            $row++;
        }

        $sheet->getStyle('A4:F' . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="fugas_ajustes.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function generateDeadStockPdf($data, $cutoffDate, $generatedBy = '') {
        ob_start();
        require __DIR__ . '/../templates/reports/inventory/dead_stock_pdf.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="stock_muerto.pdf"');
        echo $dompdf->output();
        exit;
    }

    public function generateDeadStockExcel($data, $cutoffDate, $generatedBy = '') {
        if (ob_get_length()) ob_end_clean();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'REPORTE DE STOCK "MUERTO" O SIN ROTACIÓN - Centro de Especialidades Médicas Shaddai Rafa');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('4B5563');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', "Sin movimiento desde: $cutoffDate | Generado por: $generatedBy");
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $headers = ['Código', 'Insumo', 'Lote', 'Última Salida', 'Días Estancado', 'Valor Inmovilizado'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4B5563']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A4:F4')->applyFromArray($headerStyle);

        $row = 5;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, $item['code']);
            $sheet->setCellValue('B' . $row, $item['item_name']);
            $sheet->setCellValue('C' . $row, $item['batch_number']);
            $sheet->setCellValue('D' . $row, $item['last_outflow_date'] ? date('d/m/Y', strtotime($item['last_outflow_date'])) : 'Nunca');
            $sheet->setCellValue('E' . $row, $item['days_stagnant'] ?? 'N/A');
            $sheet->setCellValue('F' . $row, '$ ' . number_format($item['immobilized_value'], 2));
            $row++;
        }

        $sheet->getStyle('A4:F' . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="stock_muerto.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function generateInventoryValuationPdf($data, $generatedBy = '') {
        ob_start();
        require __DIR__ . '/../templates/reports/inventory/inventory_valuation_pdf.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="valoracion_inventario.pdf"');
        echo $dompdf->output();
        exit;
    }

    public function generateInventoryValuationExcel($data, $generatedBy = '') {
        if (ob_get_length()) ob_end_clean();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'VALORACIÓN DE INVENTARIO POR LOTE - Centro de Especialidades Médicas Shaddai Rafa');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('059669');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', "Generado por: $generatedBy | Fecha: " . date('d/m/Y H:i'));
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $headers = ['Código', 'Insumo', 'Lote', 'Vencimiento', 'Cantidad', 'Valor Total ($)'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A4:F4')->applyFromArray($headerStyle);

        $row = 5;
        $totalValue = 0;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, $item['code']);
            $sheet->setCellValue('B' . $row, $item['item_name']);
            $sheet->setCellValue('C' . $row, $item['batch_number']);
            $sheet->setCellValue('D' . $row, date('d/m/Y', strtotime($item['expiration_date'])));
            $sheet->setCellValue('E' . $row, $item['batch_quantity']);
            $sheet->setCellValue('F' . $row, $item['total_value']);
            $sheet->getStyle('F' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            
            $totalValue += $item['total_value'];
            $row++;
        }

        // Total Row
        $sheet->mergeCells('A' . $row . ':E' . $row);
        $sheet->setCellValue('A' . $row, 'TOTAL VALORIZADO');
        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true);
        
        $sheet->setCellValue('F' . $row, $totalValue);
        $sheet->getStyle('F' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->getStyle('F' . $row)->getFont()->setBold(true);

        $sheet->getStyle('A4:F' . ($row))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="valoracion_inventario.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }
}
