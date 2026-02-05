import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { Client, ClientWithStats, Booking, Service } from '@/types/database.types'

// Type for the raw query result (since clients table isn't in generated types yet)
interface ClientQueryResult {
  id: string
  business_id: string
  email: string
  name: string
  phone: string | null
  created_at: string
  updated_at: string
  bookings?: Array<{
    id: string
    status: string
    total_price: number
    date: string
    created_at: string
  }>
}

export interface ClientFilters {
  search?: string
  bookingCountFilter?: '0' | '1-5' | '5+'
  totalSpentFilter?: '<100' | '100-500' | '500+'
  lastVisitFilter?: '<30' | '30-90' | '90+'
  sortBy?: 'name' | 'last_booking' | 'total_spent' | 'booking_count'
  sortOrder?: 'asc' | 'desc'
}

export async function getClients(
  businessId: string,
  filters: ClientFilters = {}
): Promise<ClientWithStats[]> {
  const supabase = await createSupabaseClient()

  // Fetch clients with their bookings
  let query = supabase
    .from('clients')
    .select(`
      *,
      bookings!bookings_client_id_fkey(
        id,
        status,
        total_price,
        date,
        created_at
      )
    `)
    .eq('business_id', businessId)

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
  }

  const { data: clientsData, error } = await query

  if (error) throw error

  // Calculate stats for each client
  const clients = (clientsData || []) as unknown as ClientQueryResult[]
  const clientsWithStats: ClientWithStats[] = clients.map((client) => {
    const bookings = client.bookings || []

    // Only count completed and confirmed bookings for revenue
    const validBookings = bookings.filter(b =>
      b.status === 'confirmed' || b.status === 'completed'
    )

    const totalSpent = validBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
    const lastBooking = bookings.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]

    return {
      id: client.id,
      business_id: client.business_id,
      email: client.email,
      name: client.name,
      phone: client.phone,
      created_at: client.created_at,
      updated_at: client.updated_at,
      booking_count: bookings.length,
      total_spent: totalSpent,
      last_booking_date: lastBooking?.date || null
    }
  })

  // Apply post-fetch filters
  let filteredClients = clientsWithStats

  // Filter by booking count
  if (filters.bookingCountFilter) {
    filteredClients = filteredClients.filter(c => {
      switch (filters.bookingCountFilter) {
        case '0': return c.booking_count === 0
        case '1-5': return c.booking_count >= 1 && c.booking_count <= 5
        case '5+': return c.booking_count > 5
        default: return true
      }
    })
  }

  // Filter by total spent
  if (filters.totalSpentFilter) {
    filteredClients = filteredClients.filter(c => {
      switch (filters.totalSpentFilter) {
        case '<100': return c.total_spent < 100
        case '100-500': return c.total_spent >= 100 && c.total_spent <= 500
        case '500+': return c.total_spent > 500
        default: return true
      }
    })
  }

  // Filter by last visit
  if (filters.lastVisitFilter) {
    const now = new Date()
    filteredClients = filteredClients.filter(c => {
      if (!c.last_booking_date) return filters.lastVisitFilter === '90+'
      const lastVisit = new Date(c.last_booking_date)
      const daysSince = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      switch (filters.lastVisitFilter) {
        case '<30': return daysSince < 30
        case '30-90': return daysSince >= 30 && daysSince <= 90
        case '90+': return daysSince > 90
        default: return true
      }
    })
  }

  // Apply sorting
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1
  filteredClients.sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * sortOrder
      case 'last_booking':
        if (!a.last_booking_date && !b.last_booking_date) return 0
        if (!a.last_booking_date) return 1
        if (!b.last_booking_date) return -1
        return (new Date(b.last_booking_date).getTime() - new Date(a.last_booking_date).getTime()) * sortOrder
      case 'total_spent':
        return (b.total_spent - a.total_spent) * sortOrder
      case 'booking_count':
        return (b.booking_count - a.booking_count) * sortOrder
      default:
        // Default: sort by last booking date (most recent first)
        if (!a.last_booking_date && !b.last_booking_date) return 0
        if (!a.last_booking_date) return 1
        if (!b.last_booking_date) return -1
        return new Date(b.last_booking_date).getTime() - new Date(a.last_booking_date).getTime()
    }
  })

  return filteredClients
}

export async function getClientById(clientId: string): Promise<ClientWithStats | null> {
  const supabase = await createSupabaseClient()

  const { data: clientData, error } = await supabase
    .from('clients')
    .select(`
      *,
      bookings!bookings_client_id_fkey(
        id,
        status,
        total_price,
        date
      )
    `)
    .eq('id', clientId)
    .single()

  if (error || !clientData) return null

  const client = clientData as unknown as ClientQueryResult
  const bookings = client.bookings || []

  const validBookings = bookings.filter(b =>
    b.status === 'confirmed' || b.status === 'completed'
  )

  const totalSpent = validBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
  const sortedBookings = [...bookings].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return {
    id: client.id,
    business_id: client.business_id,
    email: client.email,
    name: client.name,
    phone: client.phone,
    created_at: client.created_at,
    updated_at: client.updated_at,
    booking_count: bookings.length,
    total_spent: totalSpent,
    last_booking_date: sortedBookings[0]?.date || null
  }
}

export interface ClientBooking extends Booking {
  service: Service | null
}

export async function getClientBookings(clientId: string): Promise<ClientBooking[]> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(*)
    `)
    .eq('client_id', clientId)
    .order('date', { ascending: false })

  if (error) throw error

  // Cast to unknown first to handle the missing client_id type
  const bookings = (data || []) as unknown as Array<Booking & { service: Service | null }>

  return bookings.map(booking => ({
    ...booking,
    service: booking.service
  }))
}

export async function createClientRecord(data: {
  business_id: string
  email: string
  name: string
  phone?: string
}): Promise<Client> {
  const supabase = await createSupabaseClient()

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      business_id: data.business_id,
      email: data.email,
      name: data.name,
      phone: data.phone || null
    } as never)
    .select()
    .single()

  if (error) throw error
  return client as unknown as Client
}

export async function updateClient(
  clientId: string,
  data: { name?: string; email?: string; phone?: string }
): Promise<Client> {
  const supabase = await createSupabaseClient()

  const { data: client, error } = await supabase
    .from('clients')
    .update(data as never)
    .eq('id', clientId)
    .select()
    .single()

  if (error) throw error
  return client as unknown as Client
}

export async function deleteClient(clientId: string): Promise<void> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) throw error
}

export async function findOrCreateClient(
  businessId: string,
  email: string,
  name: string,
  phone?: string
): Promise<Client> {
  const supabase = await createSupabaseClient()

  // Try to find existing client
  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', businessId)
    .eq('email', email)
    .single()

  if (existing) {
    const existingClient = existing as unknown as Client
    // Update name/phone if provided and different
    if (name !== existingClient.name || (phone && phone !== existingClient.phone)) {
      const { data: updated } = await supabase
        .from('clients')
        .update({ name, phone: phone || existingClient.phone } as never)
        .eq('id', existingClient.id)
        .select()
        .single()
      return updated as unknown as Client
    }
    return existingClient
  }

  // Create new client
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      business_id: businessId,
      email,
      name,
      phone: phone || null
    } as never)
    .select()
    .single()

  if (error) throw error
  return newClient as unknown as Client
}
