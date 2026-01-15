-- Add booking availability settings to businesses
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Europe/Paris',
ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_notice_hours INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 15;

-- Add end_time to bookings (calculated from start + duration)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Update existing bookings to have end_time
UPDATE bookings
SET end_time = (time::time + (duration || ' minutes')::interval)::time
WHERE end_time IS NULL;

-- Create function to check booking overlap
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
    booking_end_time TIME;
    overlap_count INTEGER;
BEGIN
    -- Calculate end time
    booking_end_time := (NEW.time::time + (NEW.duration || ' minutes')::interval)::time;

    -- Set end_time on the new record
    NEW.end_time := booking_end_time;

    -- Check for overlapping bookings (only active ones: pending, confirmed)
    SELECT COUNT(*) INTO overlap_count
    FROM bookings
    WHERE business_id = NEW.business_id
      AND date = NEW.date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('pending', 'confirmed')
      AND (
        -- New booking starts during existing booking
        (NEW.time::time >= time::time AND NEW.time::time < end_time)
        OR
        -- New booking ends during existing booking
        (booking_end_time > time::time AND booking_end_time <= end_time)
        OR
        -- New booking completely contains existing booking
        (NEW.time::time <= time::time AND booking_end_time >= end_time)
      );

    IF overlap_count > 0 THEN
        RAISE EXCEPTION 'BOOKING_OVERLAP: Ce creneau est deja reserve';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for insert and update
DROP TRIGGER IF EXISTS booking_overlap_check ON bookings;
CREATE TRIGGER booking_overlap_check
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION check_booking_overlap();

-- Create index for faster overlap checks
CREATE INDEX IF NOT EXISTS idx_bookings_availability
ON bookings(business_id, date, time, end_time)
WHERE status IN ('pending', 'confirmed');
