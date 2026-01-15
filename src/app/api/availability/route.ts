import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Business, BusinessHours, Booking } from '@/types/database.types'

interface AvailabilityParams {
  businessId: string
  date: string // YYYY-MM-DD
  serviceDuration: number // minutes
}

interface TimeSlot {
  time: string // HH:mm
  available: boolean
}

// Convert time string to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Convert minutes since midnight to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Check if two time ranges overlap
function rangesOverlap(
  start1: number, end1: number,
  start2: number, end2: number
): boolean {
  return start1 < end2 && end1 > start2
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const businessId = searchParams.get('businessId')
  const date = searchParams.get('date')
  const serviceDuration = parseInt(searchParams.get('serviceDuration') || '60')

  if (!businessId || !date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const slots = await getAvailability({
      businessId,
      date,
      serviceDuration,
    })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Availability error:', error)
    return NextResponse.json({ error: 'Failed to get availability' }, { status: 500 })
  }
}

async function getAvailability(params: AvailabilityParams): Promise<TimeSlot[]> {
  const { businessId, date, serviceDuration } = params
  const supabase = await createClient()

  // 1. Get business settings
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!business) {
    throw new Error('Business not found')
  }

  const businessData = business as Business
  const bufferMinutes = businessData.buffer_minutes || 0
  const minNoticeHours = businessData.min_notice_hours || 1
  const slotDuration = businessData.slot_duration_minutes || 15

  // Total duration to block = service + buffer
  const totalBlockDuration = serviceDuration + bufferMinutes

  // 2. Get business hours for the day of week
  const dateObj = new Date(date + 'T00:00:00')
  const dayOfWeek = dateObj.getDay() // 0 = Sunday

  const { data: hoursData } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', businessId)
    .eq('day_of_week', dayOfWeek)
    .single()

  // Default hours: Mon-Fri 9h-18h
  const DEFAULT_OPEN_DAYS = [1, 2, 3, 4, 5] // Mon-Fri
  const DEFAULT_START = '09:00'
  const DEFAULT_END = '18:00'

  let openTime: number
  let closeTime: number

  if (hoursData) {
    const hours = hoursData as BusinessHours
    if (!hours.is_open) {
      return [] // Explicitly closed
    }
    openTime = timeToMinutes(hours.start_time)
    closeTime = timeToMinutes(hours.end_time)
  } else {
    // No hours configured - use defaults
    if (!DEFAULT_OPEN_DAYS.includes(dayOfWeek)) {
      return [] // Weekend by default
    }
    openTime = timeToMinutes(DEFAULT_START)
    closeTime = timeToMinutes(DEFAULT_END)
  }

  // 3. Get existing bookings for this date (only active ones)
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed'])

  const bookings = (bookingsData || []) as Booking[]

  // Convert bookings to busy ranges (in minutes)
  const busyRanges = bookings.map(booking => {
    const start = timeToMinutes(booking.time)
    const end = booking.end_time
      ? timeToMinutes(booking.end_time)
      : start + booking.duration
    return { start, end }
  })

  // 4. Calculate minimum start time based on min_notice
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  let minStartMinutes = openTime

  if (date === todayStr) {
    // Same day: apply min notice
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const minNoticeMinutes = minNoticeHours * 60
    minStartMinutes = Math.max(openTime, currentMinutes + minNoticeMinutes)

    // Round up to next slot
    minStartMinutes = Math.ceil(minStartMinutes / slotDuration) * slotDuration
  } else if (date < todayStr) {
    // Past date: no slots
    return []
  }

  // 5. Generate candidate slots
  const slots: TimeSlot[] = []

  for (let slotStart = minStartMinutes; slotStart < closeTime; slotStart += slotDuration) {
    const slotEnd = slotStart + totalBlockDuration

    // Check if slot end exceeds closing time
    if (slotEnd > closeTime) {
      break
    }

    // Check if slot overlaps with any busy range
    const isOverlapping = busyRanges.some(range =>
      rangesOverlap(slotStart, slotEnd, range.start, range.end)
    )

    slots.push({
      time: minutesToTime(slotStart),
      available: !isOverlapping,
    })
  }

  return slots
}
