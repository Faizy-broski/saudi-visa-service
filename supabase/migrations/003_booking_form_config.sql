-- Add booking_form_config column to visa_services
-- Run this in Supabase SQL Editor

ALTER TABLE visa_services
  ADD COLUMN IF NOT EXISTS booking_form_config JSONB DEFAULT NULL;

COMMENT ON COLUMN visa_services.booking_form_config IS
  'Per-service booking form document requirements. JSON structure: { passport, id_card, photo: required|optional|hidden, custom_docs: [{key, label, required}] }';
