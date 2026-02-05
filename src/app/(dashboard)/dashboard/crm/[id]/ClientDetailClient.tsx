'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Business, ClientWithStats } from '@/types/database.types'
import type { ClientBooking } from '@/lib/clients/queries'
import { ClientStats } from '@/components/crm/ClientStats'
import { BookingHistory } from '@/components/crm/BookingHistory'
import { ClientForm } from '@/components/crm/ClientForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Phone, Edit2, Trash2, User } from 'lucide-react'

interface ClientDetailClientProps {
  business: Business
  client: ClientWithStats
  bookings: ClientBooking[]
  firstBookingDate: string | null
}

export function ClientDetailClient({
  business,
  client,
  bookings,
  firstBookingDate
}: ClientDetailClientProps) {
  const router = useRouter()
  const [showEditForm, setShowEditForm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Supprimer le client "${client.name}" ? Cette action est irreversible.`)) {
      return
    }

    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id)

      if (error) throw error

      router.push('/dashboard/crm')
      router.refresh()
    } catch (err) {
      console.error('Error deleting client:', err)
      alert('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/crm"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux clients
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {client.email}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <ClientStats client={client} firstBookingDate={firstBookingDate} />
      </div>

      {/* Booking history */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingHistory bookings={bookings} />
        </CardContent>
      </Card>

      {/* Edit form modal */}
      {showEditForm && (
        <ClientForm
          businessId={business.id}
          client={client}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
