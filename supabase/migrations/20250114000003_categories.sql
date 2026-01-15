-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category_id to services
ALTER TABLE services ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_categories_business_id ON categories(business_id);
CREATE INDEX idx_services_category_id ON services(category_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Users can view their own categories"
    ON categories FOR SELECT
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create categories for their businesses"
    ON categories FOR INSERT
    WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own categories"
    ON categories FOR UPDATE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Public can view categories (for booking page)
CREATE POLICY "Anyone can view categories"
    ON categories FOR SELECT
    USING (true);
