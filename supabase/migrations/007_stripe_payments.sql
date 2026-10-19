-- ============================================================
-- Stripe payment safety
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. One booking per Stripe payment.
--    If this fails, existing rows share a payment intent; clean those up first:
--    SELECT stripe_payment_intent_id, count(*) FROM visa_applications
--    WHERE stripe_payment_intent_id IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_applications_payment_intent
  ON visa_applications(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- 2. Ledger of payments reported by the Stripe webhook.
--    Lets us spot money taken with no booking saved (customer closed the tab, etc).
CREATE TABLE IF NOT EXISTS stripe_payments (
  payment_intent_id text PRIMARY KEY,
  status text NOT NULL,
  amount_pence int NOT NULL,
  currency text NOT NULL,
  customer_email text,
  customer_name text,
  service_name text,
  num_travelers int,
  booking_reference text,
  orphan_alerted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (server) can read or write.

CREATE INDEX IF NOT EXISTS idx_stripe_payments_orphans
  ON stripe_payments(created_at)
  WHERE booking_reference IS NULL AND status = 'succeeded';

-- 3. Webhook signing secrets (filled in from Admin -> Settings -> Stripe)
INSERT INTO admin_settings (key, value) VALUES
  ('stripe_test_webhook_secret', ''),
  ('stripe_live_webhook_secret', '')
ON CONFLICT (key) DO NOTHING;
