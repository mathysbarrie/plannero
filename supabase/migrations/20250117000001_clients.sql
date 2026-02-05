-- =====================================================
-- Migration: Clients CRM
-- Description: Create clients table for CRM functionality
-- =====================================================

-- 1. Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one client per email per business
  UNIQUE(business_id, email)
);

-- 2. Create indexes for performance
CREATE INDEX idx_clients_business_id ON clients(business_id);
CREATE INDEX idx_clients_email ON clients(business_id, email);
CREATE INDEX idx_clients_name ON clients(business_id, name);

-- 3. Add client_id column to bookings
ALTER TABLE bookings ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX idx_bookings_client_id ON bookings(client_id);

-- 4. Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for clients
CREATE POLICY "Users can view own business clients"
  ON clients FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business clients"
  ON clients FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business clients"
  ON clients FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business clients"
  ON clients FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- 6. Allow public insert for booking flow (clients are created during public booking)
CREATE POLICY "Anyone can insert clients during booking"
  ON clients FOR INSERT
  WITH CHECK (true);

-- 7. Migrate existing clients from bookings
-- Create clients from unique email addresses in bookings
INSERT INTO clients (business_id, email, name, phone, created_at)
SELECT DISTINCT ON (bk.business_id, bk.client_email)
  bk.business_id,
  bk.client_email,
  bk.client_name,
  bk.client_phone,
  MIN(bk.created_at) OVER (PARTITION BY bk.business_id, bk.client_email)
FROM bookings bk
WHERE bk.client_email IS NOT NULL
ORDER BY bk.business_id, bk.client_email, bk.created_at ASC
ON CONFLICT (business_id, email) DO NOTHING;

-- 8. Link existing bookings to their clients
UPDATE bookings bk
SET client_id = c.id
FROM clients c
WHERE bk.business_id = c.business_id
  AND bk.client_email = c.email
  AND bk.client_id IS NULL;

-- 9. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();
