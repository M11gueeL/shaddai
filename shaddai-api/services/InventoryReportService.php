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

    public function generateKardexPdf($data, $startDate, $endDate, $generatedBy = '') {
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
        $sheet->setCellValue('A1', 'REPORTE DE SEMÁFORO DE VENCIMIENTOS - SHADDAI');
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
        $sheet->setCellValue('A1', 'REPORTE DE KARDEX DE MOVIMIENTOS - SHADDAI');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0056B3');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Meta
        $sheet->mergeCells('A2:H2');
        $sheet->setCellValue('A2', "Del $startDate al $endDate | Generado por: $generatedBy");
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Encabezados
        $headers = ['Fecha/Hora', 'Código', 'Insumo', 'Tipo', 'Responsable', 'Movimiento', 'Notas'];
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
        $sheet->getStyle('A4:G4')->applyFromArray($headerStyle);

        // Datos
        $row = 5;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, date('d/m/Y H:i', strtotime($item['created_at'])));
            $sheet->setCellValue('B' . $row, $item['item_code']);
            $sheet->setCellValue('C' . $row, $item['item_name']);
            $sheet->setCellValue('D' . $row, ucfirst(str_replace('_', ' ', $item['movement_type'])));
            $sheet->setCellValue('E' . $row, $item['user_name']);
            $sheet->setCellValue('F' . $row, $item['quantity_moved']);
            $sheet->setCellValue('G' . $row, $item['notes']);

            $row++;
        }

        $sheet->getStyle('A4:G' . ($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="reporte_kardex.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }
}
