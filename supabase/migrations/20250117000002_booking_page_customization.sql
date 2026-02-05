-- Migration: Booking Page Customization
-- Adds customization columns to the businesses table for public booking page styling

-- Theme & Colors
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#F9FAFB';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS card_background VARCHAR(7) DEFAULT '#FFFFFF';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#111827';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS text_secondary VARCHAR(7) DEFAULT '#6B7280';

-- Typography
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS font_family VARCHAR(50) DEFAULT 'Inter';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS font_heading VARCHAR(50) DEFAULT 'Inter';

-- Layout
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS layout_style VARCHAR(20) DEFAULT 'default';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS card_style VARCHAR(20) DEFAULT 'bordered';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS button_style VARCHAR(20) DEFAULT 'rounded';

-- Header
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS header_title VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS header_subtitle TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS header_alignment VARCHAR(20) DEFAULT 'left';

-- Steps configuration
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS steps_order JSONB DEFAULT '["service","questions","datetime","options","contact"]';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS skip_options_step BOOLEAN DEFAULT false;

-- Confirmation page
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS confirmation_title VARCHAR(255) DEFAULT 'Réservation confirmée !';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS confirmation_message TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS confirmation_show_summary BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS confirmation_cta_text VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS confirmation_cta_url VARCHAR(500);

-- Cover/Banner image
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cover_overlay_opacity DECIMAL(3,2) DEFAULT 0;

-- Add constraints
ALTER TABLE businesses ADD CONSTRAINT chk_accent_color CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE businesses ADD CONSTRAINT chk_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE businesses ADD CONSTRAINT chk_card_background CHECK (card_background ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE businesses ADD CONSTRAINT chk_text_color CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE businesses ADD CONSTRAINT chk_text_secondary CHECK (text_secondary ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE businesses ADD CONSTRAINT chk_layout_style CHECK (layout_style IN ('default', 'sidebar-left', 'sidebar-right', 'compact'));
ALTER TABLE businesses ADD CONSTRAINT chk_card_style CHECK (card_style IN ('bordered', 'shadow', 'flat', 'rounded'));
ALTER TABLE businesses ADD CONSTRAINT chk_button_style CHECK (button_style IN ('rounded', 'square', 'pill'));
ALTER TABLE businesses ADD CONSTRAINT chk_header_alignment CHECK (header_alignment IN ('left', 'center'));
ALTER TABLE businesses ADD CONSTRAINT chk_cover_overlay_opacity CHECK (cover_overlay_opacity >= 0 AND cover_overlay_opacity <= 1);

-- Create storage bucket for cover images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for cover images
CREATE POLICY "Public cover images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload cover images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own cover images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cover images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
