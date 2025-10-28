<?php
require_once __DIR__ . '/../modules/rates/RateModel.php';

class RateService {
    private $rateModel;
    public function __construct() { $this->rateModel = new RateModel(); }

    public function getTodayOrFail() {
        $rate = $this->rateModel->getToday();
        if (!$rate) {
            throw new Exception('Tasa del día no definida. Registre la tasa BCV primero.');
        }
        return $rate; // contains id, rate_date, rate_bcv
    }
}
?>
