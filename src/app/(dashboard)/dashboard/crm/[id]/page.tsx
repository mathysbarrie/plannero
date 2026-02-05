import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClientById, getClientBookings } from '@/lib/clients/queries'
import { ClientDetailClient } from './ClientDetailClient'
import type { Business } from '@/types/database.types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get business
  const { data: businessData } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!businessData) {
    redirect('/dashboard/settings')
  }

  const business = businessData as Business

  // Get client
  const client = await getClientById(id)

  if (!client || client.business_id !== business.id) {
    notFound()
  }

  // Get client bookings
  const bookings = await getClientBookings(id)

  // Get first booking date
  const firstBookingDate = bookings.length > 0
    ? [...bookings].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0]?.date
    : null

  return (
    <ClientDetailClient
      business={business}
      client={client}
      bookings={bookings}
      firstBookingDate={firstBookingDate}
    />
  )
}
