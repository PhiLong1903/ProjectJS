ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(20) NOT NULL DEFAULT 'DIRECT';

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS gateway_order_code VARCHAR(80);

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS gateway_transaction_code VARCHAR(120);

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS gateway_response JSONB;

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS service_snapshot VARCHAR(180) NOT NULL DEFAULT 'Kham tong quat';

UPDATE payment_transactions
SET gateway_response = '{}'::jsonb
WHERE gateway_response IS NULL;

ALTER TABLE payment_transactions
ALTER COLUMN gateway_response SET DEFAULT '{}'::jsonb;

ALTER TABLE payment_transactions
DROP CONSTRAINT IF EXISTS payment_transactions_method_check;

ALTER TABLE payment_transactions
ADD CONSTRAINT payment_transactions_method_check CHECK (
  payment_method IN ('CARD', 'EWALLET', 'BANK_TRANSFER', 'CASH', 'VNPAY', 'MOMO')
);

ALTER TABLE payment_transactions
DROP CONSTRAINT IF EXISTS payment_transactions_gateway_check;

ALTER TABLE payment_transactions
ADD CONSTRAINT payment_transactions_gateway_check CHECK (
  payment_gateway IN ('DIRECT', 'VNPAY', 'MOMO')
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_status
  ON payment_transactions(payment_gateway, status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_reconciled_at
  ON payment_transactions(reconciled_at);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_service_snapshot
  ON payment_transactions(service_snapshot);