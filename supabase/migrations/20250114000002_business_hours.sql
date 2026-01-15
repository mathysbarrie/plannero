-- Table for business operating hours
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, day_of_week)
);

-- Index for quick lookup
CREATE INDEX idx_business_hours_business_id ON business_hours(business_id);

-- Enable RLS
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Owner can manage their business hours
CREATE POLICY "Users can view their own business hours"
    ON business_hours FOR SELECT
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create business hours for their businesses"
    ON business_hours FOR INSERT
    WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own business hours"
    ON business_hours FOR UPDATE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own business hours"
    ON business_hours FOR DELETE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Public can view business hours (for booking page)
CREATE POLICY "Anyone can view business hours"
    ON business_hours FOR SELECT
    USING (true);
