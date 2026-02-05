import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, EMAIL_FROM, isEmailConfigured } from '@/lib/email/client'
import { bookingReminderHtml } from '@/lib/email/templates'

// Lazy init to avoid build errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel Cron or manual trigger)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if email is configured
  if (!isEmailConfigured()) {
    return NextResponse.json({ message: 'Email not configured', skipped: true })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Fetch bookings for tomorrow that are pending or confirmed
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        service:services(name),
        business:businesses(name, logo_url, primary_color)
      `)
      .eq('date', tomorrowStr)
      .in('status', ['pending', 'confirmed'])

    if (error) {
      console.error('Fetch bookings error:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: 'No reminders to send', count: 0 })
    }

    // Format date for emails
    const formattedDate = tomorrow.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Send reminders
    const results = await Promise.allSettled(
      bookings.map(async (booking) => {
        const emailHtml = bookingReminderHtml({
          clientName: booking.client_name,
          businessName: booking.business.name,
          businessLogo: booking.business.logo_url,
          serviceName: booking.service.name,
          date: formattedDate,
          time: booking.time,
          duration: booking.duration,
          primaryColor: booking.business.primary_color,
        })

        const result = await resend.emails.send({
          from: EMAIL_FROM,
          to: booking.client_email,
          subject: `Rappel : Votre rendez-vous demain - ${booking.business.name}`,
          html: emailHtml,
        })
        return { bookingId: booking.id, result }
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`Reminders sent: ${sent}, failed: ${failed}`)

    return NextResponse.json({
      message: 'Reminders processed',
      sent,
      failed,
      total: bookings.length,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
