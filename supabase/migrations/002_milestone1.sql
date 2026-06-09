-- ============================================================
-- Milestone 1 Migration
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Admin users table (email + bcrypt password, replaces hardcoded password)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Visa services table (dynamic pricing + content, managed from admin panel)
CREATE TABLE IF NOT EXISTS visa_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text,
  description text,
  price_usd decimal(10,2) NOT NULL DEFAULT 0,
  duration text,
  processing_time text,
  features text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  accent_color text DEFAULT '#0A385A',
  active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE visa_services ENABLE ROW LEVEL SECURITY;
-- Public can read active services
CREATE POLICY "Public read active services" ON visa_services
  FOR SELECT USING (active = true);

-- 3. Admin settings table (SMTP, Stripe, site config — managed from admin panel)
CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 4. Expand visa_applications for full booking form
ALTER TABLE visa_applications
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS passport_expiry date,
  ADD COLUMN IF NOT EXISTS num_travelers int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS departure_city text,
  ADD COLUMN IF NOT EXISTS passport_url text,
  ADD COLUMN IF NOT EXISTS id_card_url text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS amount_usd decimal(10,2),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES visa_services(id);

-- 5. Expand contact_messages
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS replied boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reply_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS service_interest text;

-- 6. Supabase Storage bucket (run this to create the documents bucket)
-- Note: You can also create this in Supabase Dashboard → Storage → New Bucket
-- Bucket name: booking-documents (set as PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'booking-documents',
  'booking-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policy: service role can do everything (our API uses service role)
CREATE POLICY "Service role full access" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'booking-documents');

-- 7. Insert default visa services
INSERT INTO visa_services (name, slug, tagline, description, price_usd, duration, processing_time, features, requirements, display_order)
VALUES
  (
    'Umrah Visa', 'umrah', 'The Sacred Journey',
    'Perform Umrah with complete peace of mind. We handle every document and every step of the process so your focus stays on your spiritual journey.',
    199.00, 'Up to 30 days', '3–5 business days',
    ARRAY['Full document review', 'Application submission', 'Real-time status updates', 'Dedicated consultant', '24/7 support'],
    ARRAY['Valid passport (min. 6 months validity)', 'Recent passport-size photographs', 'Confirmed travel itinerary', 'Hotel/accommodation booking', 'Return flight tickets'],
    1
  ),
  (
    'Tourist Visa', 'tourist', 'Explore Saudi Arabia',
    'Discover ancient ruins, futuristic skylines, and pristine coastlines. Saudi Arabia is open for you and we make getting there effortless.',
    149.00, 'Up to 90 days', '2–3 business days',
    ARRAY['Fast processing', 'Multiple-entry option', 'eVisa support', 'Document review', 'Status tracking'],
    ARRAY['Valid passport (min. 6 months validity)', 'Return flight tickets', 'Travel insurance', 'Hotel/accommodation booking'],
    2
  ),
  (
    'Hajj Visa', 'hajj', 'The Blessed Pilgrimage',
    'Fulfilling the fifth pillar of Islam. Our Hajj visa specialists ensure your application is complete, compliant, and prioritised.',
    249.00, 'Hajj season', '5–7 business days',
    ARRAY['Priority processing', 'Dedicated Hajj consultant', 'Quota assistance', 'Full application support', 'Group bookings welcome'],
    ARRAY['Valid passport (min. 6 months validity)', 'Hajj committee registration proof', 'Mahram documentation (for women)', 'Vaccination certificate', 'Health declaration form'],
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- 8. Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('smtp_host', 'smtp.gmail.com'),
  ('smtp_port', '587'),
  ('smtp_username', ''),
  ('smtp_password', ''),
  ('smtp_from_name', 'Saudi Visa Service'),
  ('smtp_from_email', ''),
  ('stripe_publishable_key', ''),
  ('stripe_secret_key', ''),
  ('admin_email', ''),
  ('site_name', 'Saudi Visa Service')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- AFTER running this migration, create your admin account by
-- visiting: http://localhost:3000/admin/setup
-- (only works once — locked after first admin is created)
-- ============================================================
