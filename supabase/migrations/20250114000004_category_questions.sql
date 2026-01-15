-- Category questions table (qualification questions per category)
CREATE TABLE category_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    question_text VARCHAR(500) NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'text', -- text, select, number
    options JSONB, -- for select type: ["Option 1", "Option 2", ...]
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_category_questions_category_id ON category_questions(category_id);

-- Enable RLS
ALTER TABLE category_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view questions for their categories"
    ON category_questions FOR SELECT
    USING (category_id IN (
        SELECT c.id FROM categories c
        JOIN businesses b ON c.business_id = b.id
        WHERE b.user_id = auth.uid()
    ));

CREATE POLICY "Users can create questions for their categories"
    ON category_questions FOR INSERT
    WITH CHECK (category_id IN (
        SELECT c.id FROM categories c
        JOIN businesses b ON c.business_id = b.id
        WHERE b.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their category questions"
    ON category_questions FOR UPDATE
    USING (category_id IN (
        SELECT c.id FROM categories c
        JOIN businesses b ON c.business_id = b.id
        WHERE b.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their category questions"
    ON category_questions FOR DELETE
    USING (category_id IN (
        SELECT c.id FROM categories c
        JOIN businesses b ON c.business_id = b.id
        WHERE b.user_id = auth.uid()
    ));

-- Public can view questions (for booking page)
CREATE POLICY "Anyone can view category questions"
    ON category_questions FOR SELECT
    USING (true);

-- Add booking_answers table to store customer responses
CREATE TABLE booking_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES category_questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_booking_answers_booking_id ON booking_answers(booking_id);

-- Enable RLS
ALTER TABLE booking_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_answers
CREATE POLICY "Users can view answers for their bookings"
    ON booking_answers FOR SELECT
    USING (booking_id IN (
        SELECT bk.id FROM bookings bk
        JOIN businesses b ON bk.business_id = b.id
        WHERE b.user_id = auth.uid()
    ));

CREATE POLICY "Anyone can create booking answers"
    ON booking_answers FOR INSERT
    WITH CHECK (true);
