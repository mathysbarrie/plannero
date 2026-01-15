-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#2563eb',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Options (upsells) table
CREATE TABLE options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE, -- NULL means available for all services
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking options (junction table)
CREATE TABLE booking_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES options(id) ON DELETE RESTRICT,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_services_business_id ON services(business_id);
CREATE INDEX idx_options_business_id ON options(business_id);
CREATE INDEX idx_options_service_id ON options(service_id);
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_booking_options_booking_id ON booking_options(booking_id);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses"
    ON businesses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own businesses"
    ON businesses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
    ON businesses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses"
    ON businesses FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Users can view services of their businesses"
    ON services FOR SELECT
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create services for their businesses"
    ON services FOR INSERT
    WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update services of their businesses"
    ON services FOR UPDATE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete services of their businesses"
    ON services FOR DELETE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- RLS Policies for options
CREATE POLICY "Users can view options of their businesses"
    ON options FOR SELECT
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create options for their businesses"
    ON options FOR INSERT
    WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update options of their businesses"
    ON options FOR UPDATE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete options of their businesses"
    ON options FOR DELETE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- RLS Policies for bookings
CREATE POLICY "Users can view bookings of their businesses"
    ON bookings FOR SELECT
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can create bookings for their businesses"
    ON bookings FOR INSERT
    WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update bookings of their businesses"
    ON bookings FOR UPDATE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete bookings of their businesses"
    ON bookings FOR DELETE
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- RLS Policies for booking_options
CREATE POLICY "Users can view booking_options of their businesses"
    ON booking_options FOR SELECT
    USING (booking_id IN (
        SELECT b.id FROM bookings b
        JOIN businesses bus ON b.business_id = bus.id
        WHERE bus.user_id = auth.uid()
    ));

CREATE POLICY "Users can create booking_options for their businesses"
    ON booking_options FOR INSERT
    WITH CHECK (booking_id IN (
        SELECT b.id FROM bookings b
        JOIN businesses bus ON b.business_id = bus.id
        WHERE bus.user_id = auth.uid()
    ));

-- Public policies for booking page (anonymous access)
CREATE POLICY "Anyone can view active services by business slug"
    ON services FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can view active options"
    ON options FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can view business by slug"
    ON businesses FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can create booking_options"
    ON booking_options FOR INSERT
    WITH CHECK (true);

-- Function to auto-create business after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    business_name TEXT;
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mon Business');
    base_slug := LOWER(REGEXP_REPLACE(business_name, '[^a-zA-Z0-9]+', '-', 'g'));
    final_slug := base_slug;

    -- Ensure unique slug
    WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    INSERT INTO businesses (user_id, name, slug)
    VALUES (NEW.id, business_name, final_slug);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create business on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
