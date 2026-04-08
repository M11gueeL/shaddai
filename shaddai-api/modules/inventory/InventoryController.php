<?php
require_once __DIR__ . '/InventoryModel.php';
require_once __DIR__ . '/SupplierModel.php';
require_once __DIR__ . '/PurchaseModel.php';
require_once __DIR__ . '/../../services/InventoryReportService.php';

class InventoryController {
    private $model;
    private $supplierModel;
    private $purchaseModel;
    private $reportService;

    public function __construct() {
        $this->model = new InventoryModel();
        $this->supplierModel = new SupplierModel();
        $this->purchaseModel = new PurchaseModel();
        $this->reportService = new InventoryReportService();
    }

    private function mapFriendlyErrorMessage($rawMessage) {
        $message = (string)$rawMessage;
        $lower = strtolower($message);

        if (strpos($lower, 'duplicate entry') !== false || strpos($lower, 'integrity constraint violation') !== false) {
            if (strpos($lower, 'uk_inventory_code') !== false) {
                return 'Ya existe un insumo con ese código/SKU.';
            }

            if (strpos($lower, 'tax_id') !== false) {
                return 'Ya existe un proveedor con ese RIF/Cédula.';
            }

            if (strpos($lower, 'phone') !== false) {
                return 'Ya existe un proveedor con ese teléfono.';
            }

            if (strpos($lower, 'email') !== false) {
                return 'Ya existe un proveedor con ese correo.';
            }

            return 'No se pudo guardar porque el registro ya existe o viola una regla de integridad.';
        }

        if (strpos($lower, 'cannot add or update a child row') !== false || strpos($lower, 'foreign key constraint fails') !== false) {
            return 'No se pudo guardar porque hay datos relacionados que no existen o están inactivos.';
        }

        return $message;
    }

    private function failFromException($e, $defaultStatus = 400) {
        $friendly = $this->mapFriendlyErrorMessage($e->getMessage());
        $status = $defaultStatus;

        $errorLower = strtolower($friendly);
        if (strpos($errorLower, 'no autorizado') !== false) {
            $status = 401;
        }

        if ($status < 400 || $status > 599) {
            $status = 400;
        }

        http_response_code($status);
        echo json_encode(['success' => false, 'error' => $friendly]);
    }

    public function getSuppliers() {
        try {
            $onlyActive = !isset($_GET['all']) || (string)$_GET['all'] !== '1';
            $suppliers = $this->supplierModel->getAll($onlyActive);
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $suppliers]);
        } catch (Exception $e) {
            $this->failFromException($e, 500);
        }
    }

    public function getPurchases() {
        try {
            $filters = [
                'supplier_id' => $_GET['supplier_id'] ?? null,
                'status' => $_GET['status'] ?? null,
                'start_date' => $_GET['start_date'] ?? null,
                'end_date' => $_GET['end_date'] ?? null,
            ];

            $purchases = $this->purchaseModel->getAll($filters);

            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 0;
            if ($limit > 0) {
                $purchases = array_slice($purchases, 0, $limit);
            }

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $purchases]);
        } catch (Exception $e) {
            $this->failFromException($e, 500);
        }
    }

    public function getPurchaseDetails($id) {
        try {
            $purchaseId = (int)$id;
            if ($purchaseId <= 0) {
                throw new Exception('Compra invalida.');
            }

            $details = $this->purchaseModel->getPurchaseDetails($purchaseId);
            if (!$details) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'La compra indicada no existe.']);
                return;
            }

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $details]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function createSupplier() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'No autorizado']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            if (empty($data['name'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'El nombre del proveedor es obligatorio.']);
                return;
            }

            $newId = $this->supplierModel->create($data);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Proveedor creado correctamente.',
                'supplier_id' => (int)$newId
            ]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function updateSupplier($id) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) {
                throw new Exception('No autorizado');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !is_array($data)) {
                parse_str(file_get_contents('php://input'), $putData);
                $data = is_array($putData) && !empty($putData) ? $putData : $_POST;
            }

            if (empty($data['name'])) {
                throw new Exception('El nombre del proveedor es obligatorio.');
            }

            $existing = $this->supplierModel->getById((int)$id);
            if (!$existing) {
                throw new Exception('El proveedor indicado no existe.');
            }

            $this->supplierModel->update((int)$id, $data);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Proveedor actualizado correctamente.',
                'supplier_id' => (int)$id
            ]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function storePurchase() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload || !isset($payload->sub)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'No autorizado']);
                return;
            }

            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Payload JSON inválido o vacío.']);
                return;
            }

            $purchaseData = [
                'supplier_id' => $body['supplier_id'] ?? null,
                'invoice_number' => $body['invoice_number'] ?? null,
                'purchase_date' => $body['purchase_date'] ?? null,
                'total_amount' => $body['total_amount'] ?? null,
                'currency' => $body['currency'] ?? 'USD',
                'status' => $body['status'] ?? 'received',
                'notes' => $body['notes'] ?? null,
            ];

            $items = $body['items'] ?? null;

            if (empty($purchaseData['supplier_id']) || empty($purchaseData['purchase_date']) || !is_array($items) || empty($items)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Datos incompletos: supplier_id, purchase_date e items son obligatorios.']);
                return;
            }

            foreach ($items as $index => $item) {
                $line = $index + 1;
                if (empty($item['item_id']) || !isset($item['quantity']) || !isset($item['unit_cost'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => "Item #$line inválido: item_id, quantity y unit_cost son obligatorios."]);
                    return;
                }

                if ((int)$item['quantity'] <= 0) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => "Item #$line inválido: quantity debe ser mayor a 0."]);
                    return;
                }
            }

            $result = $this->purchaseModel->processPurchaseTransaction($purchaseData, $items, (int)$payload->sub);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Abastecimiento registrado correctamente.',
                'data' => $result
            ]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function updateBatchExpiration() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            $batchId = $data['batch_id'] ?? null;
            $newDate = $data['expiration_date'] ?? null;

            if (!$batchId || !$newDate) {
                throw new Exception('Datos incompletos.');
            }

            $this->model->updateBatchExpiration($batchId, $newDate, $userId);
            echo json_encode(['message' => 'Fecha de vencimiento actualizada correctamente.']);

        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function list() {
        try {
            $filters = [
                'onlyActive' => !isset($_GET['all']) || $_GET['all'] != '1',
                'low_stock' => isset($_GET['low_stock']) && $_GET['low_stock'] == '1',
                'search' => $_GET['search'] ?? null,
                'name' => $_GET['name'] ?? null,
                'code' => $_GET['code'] ?? null,
                'status' => $_GET['status'] ?? null,
                'brand_id' => $_GET['brand_id'] ?? null,
                'min_price' => $_GET['min_price'] ?? null,
                'max_price' => $_GET['max_price'] ?? null,
            ];
            echo json_encode($this->model->getAll($filters));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function stats() {
        try {
            $stats = $this->model->getInventoryStats();
            echo json_encode($stats);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function get($id) {
        try {
            $item = $this->model->getById($id);
            if ($item) {
                echo json_encode($item);
            } else {
                // Respuesta profesional: 200 OK con mensaje informativo
                echo json_encode(['message' => 'No se encontraron datos para el ID proporcionado.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub ?? null;

            $data = $_POST;
            if (empty($data['name']) || !isset($data['price_usd'])) {
                // Validación profesional: Mensaje informativo en lugar de error
                echo json_encode(['message' => 'Por favor, asegúrese de completar el nombre y el precio del producto.']);
                return;
            }

            if ($data['price_usd'] < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'El precio no puede ser negativo.']);
                return;
            }
            if (isset($data['reorder_level']) && $data['reorder_level'] < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'El punto de reorden no puede ser negativo.']);
                return;
            }

            // NOTA: Ignoramos stock_quantity y expiration_date si vienen aquí.
            // El producto se crea en 0.
            $id = $this->model->create($data, $userId);
            http_response_code(201);
            echo json_encode(['id' => (int)$id]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function update($id) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub ?? null;

            $data = $_POST;

            if (isset($data['price_usd']) && $data['price_usd'] < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'El precio no puede ser negativo.']);
                return;
            }
            if (isset($data['reorder_level']) && $data['reorder_level'] < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'El punto de reorden no puede ser negativo.']);
                return;
            }

            $ok = $this->model->update($id, $data, $userId);
            echo json_encode(['updated' => (bool)$ok]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function delete($id) {
        try {
            $ok = $this->model->delete($id);
            echo json_encode(['deleted' => (bool)$ok]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function getBatches($id) {
        try {
            $batches = $this->model->getBatchesByItemId($id);
            echo json_encode($batches);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function discardBatch() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            $batchId = $data['batch_id'] ?? null;
            $quantity = $data['quantity'] ?? 0;
            $reason = $data['reason'] ?? 'Baja manual';

            if (!$batchId || $quantity <= 0) {
                throw new Exception('Datos inválidos');
            }

            $this->model->discardBatch($batchId, $quantity, $reason, $userId);
            echo json_encode(['message' => 'Lote actualizado']);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function adjustBatch() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            $batchId = $data['batch_id'] ?? null;
            $quantity = (int)($data['quantity'] ?? 0); // Puede ser negativo o positivo
            $reason = $data['reason'] ?? null;
            $type = $data['type'] ?? 'correction'; // correction, discard

            if (!$batchId || $quantity == 0 || empty($reason)) {
                throw new Exception('Datos inválidos. Se requiere ID, cantidad distinta de 0 y motivo.');
            }

            $this->model->adjustBatchQuantity($batchId, $quantity, $userId, $reason, $type);
            echo json_encode(['message' => 'Lote ajustado correctamente']);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function toggleBatchStatus() {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            $batchId = $data['batch_id'] ?? null;
            $status = $data['status'] ?? null; // 'active' or 'suspended'

            if (!$batchId || !$status) {
                throw new Exception('Datos incompletos');
            }

            $this->model->toggleBatchStatus($batchId, $status, $userId);
            echo json_encode(['message' => 'Estado del lote actualizado']);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function restock($id) {
        try {
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;

            $quantity = isset($_POST['quantity']) ? (int)$_POST['quantity'] : 0;
            $expirationDate = $_POST['expiration_date'] ?? null; 
            $batchNumber = $_POST['batch_number'] ?? null;       
            $notes = $_POST['notes'] ?? null;

            if ($quantity <= 0) {
                echo json_encode(['message' => 'La cantidad ingresada debe ser mayor a 0.']);
                return;
            }
            if (empty($expirationDate)) {
                 echo json_encode(['message' => 'Es necesario indicar la fecha de vencimiento para el control de lotes.']);
                 return;
            }

            // Llamamos a la nueva función con lote
            $this->model->restock($id, $quantity, $userId, $expirationDate, $batchNumber, $notes);
            
            // Devolvemos éxito (el stock se recalcula internamente)
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function movements($id) {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            $rows = $this->model->getMovementsByItem($id, $limit);
            echo json_encode($rows);
        } catch (Exception $e) {
            $this->failFromException($e);
        }
    }

    public function registerInternalConsumption() {
        try {
            // 1. Verificar seguridad
            $payload = $_REQUEST['jwt_payload'] ?? null;
            if (!$payload) throw new Exception('No autorizado');
            $userId = $payload->sub;

            // 2. Recibir datos del frontend
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) $data = $_POST;

            $itemId = $data['item_id'] ?? null;
            $quantity = $data['quantity'] ?? 0;
            $notes = $data['notes'] ?? 'Consumo interno de clínica';

            if (!$itemId || $quantity <= 0) {
                throw new Exception('Datos inválidos. Indique insumo y cantidad.');
            }

            // 3. Usar tu modelo existente para registrar la salida
            // El modelo ya tiene lógica FEFO (First Expired, First Out) en registerOutflow
            $this->model->registerOutflow(
                $itemId, 
                $quantity, 
                $userId, 
                'out_consumption', // <--- AQUÍ ESTÁ LA CLAVE
                $notes
            );

            echo json_encode(['message' => 'Consumo interno registrado correctamente']);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function expiring() {
        try {
            $days = isset($_GET['days']) ? (int)$_GET['days'] : null;
            echo json_encode($this->model->getExpiring($days));
        } catch (Exception $e) {
            $this->failFromException($e, 500);
        }
    }

    public function generateReport() {
        try {
            $type = $_GET['type'] ?? '';
            $format = $_GET['format'] ?? 'pdf';
            $startDate = $_GET['start_date'] ?? date('Y-m-d');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            $itemId = !empty($_GET['item_id']) ? $_GET['item_id'] : null;
            
            // Obtener usuario actual desde el token
            $generatedBy = 'Usuario del Sistema';
            if (isset($_REQUEST['jwt_payload']) && isset($_REQUEST['jwt_payload']->sub)) {
                $userId = $_REQUEST['jwt_payload']->sub;
                $user = $this->model->getUserNameById($userId);
                if ($user) {
                    $generatedBy = $user['name'];
                }
            }

            if ($type === 'expiration_risk') {
                $data = $this->model->getExpirationRiskData();
                if ($format === 'excel') {
                    $this->reportService->generateExpirationRiskExcel($data, $generatedBy);
                } else {
                    $this->reportService->generateExpirationRiskPdf($data, $generatedBy);
                }
            } elseif ($type === 'movement_kardex') {
                $data = $this->model->getMovementKardexData($startDate, $endDate, $itemId);
                if ($format === 'excel') {
                    $this->reportService->generateKardexExcel($data, $startDate, $endDate, $generatedBy);
                } else {
                    $this->reportService->generateKardexPdf($data, $startDate, $endDate, $generatedBy);
                }
            } elseif ($type === 'purchase_suggestion') {
                $data = $this->model->getPurchaseSuggestionData();
                if ($format === 'excel') {
                    $this->reportService->generatePurchaseSuggestionExcel($data, $generatedBy);
                } else {
                    $this->reportService->generatePurchaseSuggestionPdf($data, $generatedBy);
                }
            } elseif ($type === 'leaks_adjustments') {
                $data = $this->model->getLeaksAndAdjustmentsData($startDate, $endDate);
                if ($format === 'excel') {
                    $this->reportService->generateLeaksAdjustmentsExcel($data, $startDate, $endDate, $generatedBy);
                } else {
                    $this->reportService->generateLeaksAdjustmentsPdf($data, $startDate, $endDate, $generatedBy);
                }
            } elseif ($type === 'dead_stock') {
                // Use startDate as the cutoff date
                $data = $this->model->getDeadStockData($startDate);
                if ($format === 'excel') {
                    $this->reportService->generateDeadStockExcel($data, $startDate, $generatedBy);
                } else {
                    $this->reportService->generateDeadStockPdf($data, $startDate, $generatedBy);
                }
            } elseif ($type === 'inventory_valuation') {
                $data = $this->model->getInventoryValuationData();
                if ($format === 'excel') {
                    $this->reportService->generateInventoryValuationExcel($data, $generatedBy);
                } else {
                    $this->reportService->generateInventoryValuationPdf($data, $generatedBy);
                }
            } elseif ($type === 'consumption_analysis') {
                $data = $this->model->getConsumptionAnalysisData($startDate, $endDate);
                // Llamar a tu servicio de reportes para generar el PDF
                $this->reportService->generateConsumptionAnalysisPdf($data, $startDate, $endDate, $generatedBy);
            } else {
                throw new Exception("Tipo de reporte no soportado: $type");
            }

        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        }
    }
}
?>