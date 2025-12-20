<?php
require_once __DIR__ . '/../config/Database.php'; // Ajusta la ruta si es necesario

use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ReportGeneratorService {

    public function generatePdf($data, $startDate, $endDate, $filename) {
        // 1. Iniciar buffer para capturar el HTML
        ob_start();
        
        // 2. Incluir la plantilla (las variables $data, $startDate, etc. estarán disponibles allí)
        require __DIR__ . '/../templates/reports/appointments/list_pdf.php';
        
        // 3. Obtener el contenido y limpiar buffer
        $html = ob_get_clean();

        // 4. Configurar Dompdf
        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // 5. Descargar
        // Limpiamos cualquier salida previa para no corromper el PDF
        if (ob_get_length()) ob_end_clean();
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '.pdf"');
        echo $dompdf->output();
        exit;
    }

    public function generateExcel($data, $startDate, $endDate, $filename) {
        // Limpiar cualquier basura en el buffer para evitar "Archivo Dañado"
        if (ob_get_length()) ob_end_clean();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // --- ESTILOS ---
        // Título
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'REPORTE DE CITAS - SHADDAI');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0056B3');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Subtítulo
        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', "Del $startDate al $endDate");
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Encabezados
        $headers = ['Fecha', 'Hora', 'Paciente', 'Cédula', 'Médico', 'Especialidad', 'Estado'];
        $col = 'A';
        foreach ($headers as $h) {
            $sheet->setCellValue($col . '4', $h);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }

        // Estilo Encabezado (Azul con letras blancas)
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0056B3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A4:G4')->applyFromArray($headerStyle);

        // --- DATOS ---
        $rowNum = 5;
        foreach ($data as $row) {
            $sheet->setCellValue('A' . $rowNum, date('d/m/Y', strtotime($row['appointment_date'])));
            $sheet->setCellValue('B' . $rowNum, date('h:i A', strtotime($row['appointment_time'])));
            $sheet->setCellValue('C' . $rowNum, $row['patient_name']);
            $sheet->setCellValue('D' . $rowNum, $row['patient_cedula']);
            $sheet->setCellValue('E' . $rowNum, $row['doctor_name']);
            $sheet->setCellValue('F' . $rowNum, $row['specialty_name']);
            $sheet->setCellValue('G' . $rowNum, ucfirst(str_replace('_', ' ', $row['status'])));
            
            // Alternar color de fondo para filas pares (Efecto Zebra)
            if ($rowNum % 2 == 0) {
                $sheet->getStyle("A$rowNum:G$rowNum")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('F9F9F9');
            }
            $rowNum++;
        }

        // Bordes a toda la tabla
        $lastRow = $rowNum - 1;
        $sheet->getStyle("A4:G$lastRow")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // Headers para forzar descarga correcta
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function generateCsv($data, $filename) {
        if (ob_get_length()) ob_end_clean();

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '.csv"');

        $output = fopen('php://output', 'w');
        
        // BOM para que Excel lea acentos correctamente
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        // Encabezados
        fputcsv($output, ['Fecha', 'Hora', 'Paciente', 'Cedula', 'Medico', 'Especialidad', 'Estado']);

        foreach ($data as $row) {
            fputcsv($output, [
                date('d/m/Y', strtotime($row['appointment_date'])),
                date('h:i A', strtotime($row['appointment_time'])),
                $row['patient_name'],
                $row['patient_cedula'],
                $row['doctor_name'],
                $row['specialty_name'],
                ucfirst(str_replace('_', ' ', $row['status']))
            ]);
        }
        fclose($output);
        exit;
    }
}