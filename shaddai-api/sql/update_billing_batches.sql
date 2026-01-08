CREATE TABLE IF NOT EXISTS billing_account_supply_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supply_id INT NOT NULL,
    batch_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (supply_id) REFERENCES billing_account_supplies(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES inventory_batches(id) ON DELETE RESTRICT
);
