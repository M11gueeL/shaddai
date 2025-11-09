<?php
require_once __DIR__ . '/BillingService.php';
require_once __DIR__ . '/../modules/receipts/ReceiptModel.php';
require_once __DIR__ . '/ReceiptService.php';
require_once __DIR__ . '/../modules/cashregister/CashRegisterSessionModel.php';
require_once __DIR__ . '/../modules/cashregister/CashRegisterMovementModel.php';

class PaymentService {
    private $billingService;
    private $sessionModel;
    private $movementModel;
    private $receiptModel;
    private $receiptService;

    public function __construct() {
        $this->billingService = new BillingService();
        $this->sessionModel = new CashRegisterSessionModel();
        $this->movementModel = new CashRegisterMovementModel();
        $this->receiptModel = new ReceiptModel();
        $this->receiptService = new ReceiptService();
    }

    public function postPaymentSideEffects($payment, $userId) {
        // 1) Refresh account status
        $statusInfo = $this->billingService->refreshAccountStatusByPayments($payment['account_id']);
        // 2) Cash movement if cash and verified
        $isCash = in_array($payment['payment_method'], ['cash_usd','cash_bs']);
        if ($isCash && $payment['status'] === 'verified') {
            $open = $this->sessionModel->findOpenByUser($userId);
            if (!$open) {
                throw new Exception('No hay una sesión de caja abierta para registrar el movimiento de efectivo');
            }
            $this->movementModel->create([
                'session_id'=>$open['id'],
                'payment_id'=>$payment['id'],
                'movement_type'=>'payment_in',
                'amount'=>$payment['amount'],
                'currency'=>$payment['currency'],
                'description'=>'Pago cuenta #' . $payment['account_id'],
                'created_by'=>$userId
            ]);
        }

        // 3) Auto-generate receipt if account just became fully paid
        if ($statusInfo && ($statusInfo['previous_status'] ?? null) !== 'paid' && ($statusInfo['status'] ?? null) === 'paid') {
            // If no active receipt exists for this account, create one and generate PDF
            $existing = $this->receiptModel->getLatestByAccount($payment['account_id']);
            if (!$existing) {
                $created = $this->receiptModel->create((int)$payment['account_id'], (int)$payment['id'], $userId);
                try {
                    $this->receiptService->generatePdfForAccountReceipt((int)$created['id']);
                } catch (Exception $e) {
                    // Do not block payment flow if PDF fails; could be logged
                }
            }
        }
    }

    // Eliminar movimientos de caja ligados a un pago (cuando se borra un pago verificado en efectivo)
    public function deleteCashMovementsForPayment($paymentId) {
        $this->movementModel->deleteByPaymentId($paymentId);
    }
}
?>
