import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Booking, Service, Business } from '@/types/database.types'
import { getThemeFromBusiness, getGoogleFontsUrl } from '@/lib/booking-theme'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ booking?: string }>
}

export default async function ConfirmationPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { booking: bookingId } = await searchParams
  const supabase = await createClient()

  if (!bookingId) {
    notFound()
  }

  // Fetch booking
  const { data: bookingData } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (!bookingData) {
    notFound()
  }

  const booking = bookingData as Booking

  // Fetch service
  const { data: serviceData } = await supabase
    .from('services')
    .select('*')
    .eq('id', booking.service_id)
    .single()

  // Fetch business
  const { data: businessData } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', booking.business_id)
    .single()

  if (!serviceData || !businessData) {
    notFound()
  }

  const service = serviceData as Service
  const business = businessData as Business
  const theme = getThemeFromBusiness(business)
  const fontsUrl = getGoogleFontsUrl([theme.fonts.body, theme.fonts.heading])

  // Fetch booking options with option details
  const { data: bookingOptionsData } = await supabase
    .from('booking_options')
    .select('id, price, option_id')
    .eq('booking_id', bookingId)

  const bookingOptions = (bookingOptionsData || []) as { id: string; price: number; option_id: string }[]

  // Fetch option names
  const optionIds = bookingOptions.map(bo => bo.option_id)
  const { data: optionsData } = optionIds.length > 0
    ? await supabase.from('options').select('id, name').in('id', optionIds)
    : { data: [] }

  const optionsList = (optionsData || []) as { id: string; name: string }[]
  const optionsMap = new Map(optionsList.map(o => [o.id, o.name]))

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins ? `${hours}h${mins}` : `${hours}h`
  }

  return (
    <>
      {fontsUrl && <link href={fontsUrl} rel="stylesheet" />}

      <div
        className="min-h-screen"
        style={{
          backgroundColor: theme.colors.background,
          fontFamily: theme.fonts.body,
          '--booking-accent': theme.colors.accent,
          '--booking-text': theme.colors.text,
          '--booking-text-secondary': theme.colors.textSecondary,
          '--booking-card-background': theme.colors.cardBackground,
        } as React.CSSProperties}
      >
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Success header */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-12 h-12 border border-neutral-200 mb-4"
              style={{ backgroundColor: theme.colors.cardBackground }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: theme.colors.accent }} />
            </div>
            <h1
              className="text-xl font-light tracking-tight mb-2"
              style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
            >
              {theme.confirmation.title}
            </h1>
            {theme.confirmation.message ? (
              <p className="text-[12px]" style={{ color: theme.colors.textSecondary }}>
                {theme.confirmation.message}
              </p>
            ) : (
              <p className="text-[12px]" style={{ color: theme.colors.textSecondary }}>
                Un email de confirmation a été envoyé à {booking.client_email}
              </p>
            )}
          </div>

          {/* Booking details card */}
          {theme.confirmation.showSummary && (
            <div
              className="border overflow-hidden mb-6"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.textSecondary + '30',
              }}
            >
              {/* Business header */}
              <div
                className="px-6 py-4 border-b"
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.textSecondary + '30',
                }}
              >
                <div className="flex items-center gap-3">
                  {business.logo_url && (
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="w-8 h-8 border border-neutral-200 object-cover"
                    />
                  )}
                  <span className="text-[13px] font-medium" style={{ color: theme.colors.text }}>
                    {business.name}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                {/* Service */}
                <div>
                  <h3
                    className="text-[13px] font-medium"
                    style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
                  >
                    {service.name}
                  </h3>
                  <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    {formatDuration(service.duration)}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: theme.colors.text }}>
                    <Calendar className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    <span className="capitalize">{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: theme.colors.text }}>
                    <Clock className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    <span>{booking.time.slice(0, 5)}</span>
                  </div>
                </div>

                {/* Options */}
                {bookingOptions && bookingOptions.length > 0 && (
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: theme.colors.textSecondary + '20' }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider mb-2"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Options
                    </p>
                    <ul className="space-y-1">
                      {bookingOptions.map((bo) => (
                        <li key={bo.id} className="flex justify-between text-[12px]">
                          <span style={{ color: theme.colors.text }}>
                            {optionsMap.get(bo.option_id)}
                          </span>
                          <span className="tabular-nums" style={{ color: theme.colors.textSecondary }}>
                            +{Number(bo.price).toFixed(2)} €
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Total */}
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: theme.colors.textSecondary + '30' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                      Total
                    </span>
                    <span className="text-xl font-light tracking-tight tabular-nums" style={{ color: theme.colors.text }}>
                      {Number(booking.total_price).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div
                className="px-6 py-4 border-t"
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.textSecondary + '30',
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wider mb-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Vos coordonnées
                </p>
                <p className="text-[13px] font-medium" style={{ color: theme.colors.text }}>
                  {booking.client_name}
                </p>
                <div
                  className="flex items-center gap-4 mt-1 text-[11px]"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {booking.client_email}
                  </span>
                  {booking.client_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {booking.client_phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="text-center space-y-4">
            {/* Custom CTA */}
            {theme.confirmation.ctaText && theme.confirmation.ctaUrl && (
              <a
                href={theme.confirmation.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.colors.accent }}
              >
                {theme.confirmation.ctaText}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* New booking link */}
            <div>
              <Link
                href={`/book/${slug}`}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider border-b pb-0.5 hover:opacity-80"
                style={{ color: theme.colors.accent, borderColor: theme.colors.accent }}
              >
                Faire une autre réservation
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
