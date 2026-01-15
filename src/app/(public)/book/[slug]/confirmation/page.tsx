import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Booking, Service, Business } from '@/types/database.types'

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-gray-500">
            Un email de confirmation a été envoyé à {booking.client_email}
          </p>
        </div>

        {/* Booking details card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Business header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {business.logo_url && (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <span className="font-medium text-gray-900">{business.name}</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Service */}
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
              <p className="text-sm text-gray-500">{formatDuration(service.duration)}</p>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="capitalize">{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>{booking.time.slice(0, 5)}</span>
              </div>
            </div>

            {/* Options */}
            {bookingOptions && bookingOptions.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-2">Options</p>
                <ul className="space-y-1">
                  {bookingOptions.map((bo) => (
                    <li key={bo.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{optionsMap.get(bo.option_id)}</span>
                      <span className="text-gray-500">+{Number(bo.price).toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {Number(booking.total_price).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-2">Vos coordonnées</p>
            <p className="font-medium text-gray-900">{booking.client_name}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {booking.client_email}
              </span>
              {booking.client_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {booking.client_phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Link
            href={`/book/${slug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Faire une autre réservation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
