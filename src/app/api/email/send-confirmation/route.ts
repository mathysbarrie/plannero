import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, EMAIL_FROM, isEmailConfigured } from '@/lib/email/client'
import { BookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation'
import { BookingNotificationEmail } from '@/lib/email/templates/booking-notification'

// Lazy init to avoid build errors when env vars aren't set
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.warn('Email not configured - skipping send')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Fetch booking with service and business
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        service:services(*),
        business:businesses(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const service = booking.service
    const business = booking.business

    // Format date for emails
    const dateObj = new Date(booking.date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Get business owner email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      business.user_id
    )

    if (userError) {
      console.error('User fetch error:', userError)
    }

    const ownerEmail = userData?.user?.email

    // Send confirmation to client
    const clientEmailResult = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.client_email,
      subject: `Confirmation de reservation - ${business.name}`,
      react: BookingConfirmationEmail({
        clientName: booking.client_name,
        businessName: business.name,
        businessLogo: business.logo_url,
        serviceName: service.name,
        date: formattedDate,
        time: booking.time,
        duration: booking.duration,
        totalPrice: booking.total_price,
        primaryColor: business.primary_color,
      }),
    })

    console.log('Client email sent:', clientEmailResult)

    // Send notification to business owner
    if (ownerEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const ownerEmailResult = await resend.emails.send({
        from: EMAIL_FROM,
        to: ownerEmail,
        subject: `Nouvelle reservation - ${booking.client_name}`,
        react: BookingNotificationEmail({
          businessName: business.name,
          clientName: booking.client_name,
          clientEmail: booking.client_email,
          clientPhone: booking.client_phone,
          serviceName: service.name,
          date: formattedDate,
          time: booking.time,
          duration: booking.duration,
          totalPrice: booking.total_price,
          dashboardUrl: `${baseUrl}/dashboard`,
        }),
      })

      console.log('Owner email sent:', ownerEmailResult)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}
