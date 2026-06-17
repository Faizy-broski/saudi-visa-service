-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE visa_type AS ENUM ('umrah', 'tourist', 'hajj', 'business', 'family');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'on_hold');

CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE ref TEXT;
BEGIN
  ref := 'SVS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE visa_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United Kingdom',
  visa_type visa_type NOT NULL,
  travel_date DATE,
  message TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  reference_number TEXT NOT NULL DEFAULT generate_reference_number(),
  consultant_notes TEXT,
  assigned_to TEXT
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visa_applications_updated_at
  BEFORE UPDATE ON visa_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_name TEXT NOT NULL,
  author_initial CHAR(1) NOT NULL,
  visa_type TEXT NOT NULL,
  content TEXT NOT NULL,
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  display_order SMALLINT NOT NULL DEFAULT 0
);

INSERT INTO testimonials (author_name, author_initial, visa_type, content, rating, display_order) VALUES
  ('Ayesha R.', 'A', 'Umrah Applicant', 'Their guidance made the entire process feel calm. Every document was reviewed with care.', 5, 1),
  ('Mohammed K.', 'M', 'Tourist Visa', 'Responsive, clear, and incredibly professional. I knew exactly what to do at every step.', 5, 2),
  ('Fatima S.', 'F', 'Hajj Applicant', 'The most reassuring service I have experienced. They treated my application with real respect.', 5, 3);

ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application" ON visa_applications FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Anyone can send contact message" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Anyone can read visible testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (visible = TRUE);
CREATE POLICY "Check own application by reference" ON visa_applications FOR SELECT TO anon USING (TRUE);

CREATE INDEX idx_applications_email ON visa_applications(email);
CREATE INDEX idx_applications_status ON visa_applications(status);
CREATE INDEX idx_applications_ref ON visa_applications(reference_number);
CREATE INDEX idx_applications_created ON visa_applications(created_at DESC);
CREATE INDEX idx_messages_read ON contact_messages(read);
