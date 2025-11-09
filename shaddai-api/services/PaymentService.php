<?php
require_once __DIR__ . '/BillingService.php';
require_once __DIR__ . '/../modules/cashregister/CashRegisterSessionModel.php';
require_once __DIR__ . '/../modules/cashregister/CashRegisterMovementModel.php';

class PaymentService {
    private $billingService;
    private $sessionModel;
    private $movementModel;

    public function __construct() {
        $this->billingService = new BillingService();
        $this->sessionModel = new CashRegisterSessionModel();
        $this->movementModel = new CashRegisterMovementModel();
    }

    public function postPaymentSideEffects($payment, $userId) {
        // 1) Refresh account status
        $this->billingService->refreshAccountStatusByPayments($payment['account_id']);
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
    }

    // Eliminar movimientos de caja ligados a un pago (cuando se borra un pago verificado en efectivo)
    public function deleteCashMovementsForPayment($paymentId) {
        $this->movementModel->deleteByPaymentId($paymentId);
    }
}
?>
