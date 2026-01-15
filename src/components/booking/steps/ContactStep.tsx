'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Business, Service, Option, CategoryQuestion } from '@/types/database.types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

interface ContactStepProps {
  contact: {
    name: string
    email: string
    phone: string
  }
  onUpdate: (contact: { name: string; email: string; phone: string }) => void
  onSubmit: () => Promise<void>
  business: Business
  selectedService: Service | null
  selectedOptions: Option[]
  selectedDate: string | null
  selectedTime: string | null
  total: number
  answers?: Record<string, string>
  questions?: CategoryQuestion[]
}

export function ContactStep({
  contact,
  onUpdate,
  business,
  selectedService,
  selectedOptions,
  selectedDate,
  selectedTime,
  total,
  answers = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  questions = [],
}: ContactStepProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          business_id: business.id,
          service_id: selectedService.id,
          client_name: contact.name,
          client_email: contact.email,
          client_phone: contact.phone || null,
          date: selectedDate,
          time: selectedTime,
          duration: selectedService.duration,
          base_price: selectedService.price,
          total_price: total,
          status: 'pending',
        } as never)
        .select()
        .single()

      if (bookingError) throw bookingError

      // Create booking options
      if (selectedOptions.length > 0 && booking) {
        const bookingOptions = selectedOptions.map(option => ({
          booking_id: (booking as { id: string }).id,
          option_id: option.id,
          price: option.price,
        }))

        const { error: optionsError } = await supabase
          .from('booking_options')
          .insert(bookingOptions as never)

        if (optionsError) throw optionsError
      }

      // Create booking answers
      const answersToSave = Object.entries(answers).filter(([, val]) => val)
      if (answersToSave.length > 0 && booking) {
        const bookingAnswers = answersToSave.map(([questionId, answer]) => ({
          booking_id: (booking as { id: string }).id,
          question_id: questionId,
          answer: answer,
        }))

        const { error: answersError } = await supabase
          .from('booking_answers')
          .insert(bookingAnswers as never)

        if (answersError) throw answersError
      }

      // Send confirmation emails (fire-and-forget)
      const bookingId = (booking as { id: string })?.id
      fetch('/api/email/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      }).catch(err => console.error('Email send error:', err))

      // Redirect to confirmation
      router.push(`/book/${business.slug}/confirmation?booking=${bookingId}`)
    } catch (err: unknown) {
      console.error('Booking error:', err)

      // Check for overlap error from DB trigger
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage.includes('BOOKING_OVERLAP') || errorMessage.includes('creneau')) {
        setError('Ce creneau vient d\'etre reserve par quelqu\'un d\'autre. Veuillez choisir un autre horaire.')
      } else {
        setError('Une erreur est survenue. Veuillez reessayer.')
      }
      setLoading(false)
    }
  }

  const isValid = contact.name && contact.email && contact.email.includes('@')

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Vos coordonnées
      </h2>
      <p className="text-gray-500 mb-6">
        Entrez vos informations pour finaliser la réservation
      </p>

      {/* Recap card */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{selectedService?.name}</p>
            {selectedDate && selectedTime && (
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{formatDate(selectedDate)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedTime}
                </span>
              </div>
            )}
          </div>
          <p className="font-semibold text-gray-900">{total.toFixed(2)} €</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom complet *"
          placeholder="Jean Dupont"
          value={contact.name}
          onChange={(e) => onUpdate({ ...contact, name: e.target.value })}
          required
        />

        <Input
          type="email"
          label="Email *"
          placeholder="jean@exemple.fr"
          value={contact.email}
          onChange={(e) => onUpdate({ ...contact, email: e.target.value })}
          required
        />

        <Input
          type="tel"
          label="Téléphone"
          placeholder="06 12 34 56 78"
          value={contact.phone}
          onChange={(e) => onUpdate({ ...contact, phone: e.target.value })}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={!isValid}
          >
            Confirmer la réservation
          </Button>
          <p className="text-xs text-gray-500 text-center mt-3">
            En confirmant, vous acceptez de recevoir des communications relatives à votre réservation.
          </p>
        </div>
      </form>
    </div>
  )
}
