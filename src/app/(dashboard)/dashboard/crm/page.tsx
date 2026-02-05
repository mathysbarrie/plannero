import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClients, type ClientFilters } from '@/lib/clients/queries'
import { CRMPageClient } from './CRMPageClient'
import type { Business } from '@/types/database.types'

interface PageProps {
  searchParams: Promise<{
    search?: string
    bookingCount?: string
    totalSpent?: string
    lastVisit?: string
    sortBy?: string
  }>
}

export default async function CRMPage({ searchParams }: PageProps) {
  const params = await searchParams
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

  // Parse filters from search params
  const filters: ClientFilters = {
    search: params.search,
    bookingCountFilter: params.bookingCount as ClientFilters['bookingCountFilter'],
    totalSpentFilter: params.totalSpent as ClientFilters['totalSpentFilter'],
    lastVisitFilter: params.lastVisit as ClientFilters['lastVisitFilter'],
  }

  // Parse sort
  if (params.sortBy) {
    if (params.sortBy.endsWith('-desc')) {
      filters.sortBy = params.sortBy.replace('-desc', '') as ClientFilters['sortBy']
      filters.sortOrder = 'desc'
    } else {
      filters.sortBy = params.sortBy as ClientFilters['sortBy']
      filters.sortOrder = 'asc'
    }
  }

  // Fetch clients
  const clients = await getClients(business.id, filters)

  return (
    <CRMPageClient
      business={business}
      clients={clients}
      filters={{
        search: params.search || '',
        bookingCount: params.bookingCount || '',
        totalSpent: params.totalSpent || '',
        lastVisit: params.lastVisit || '',
        sortBy: params.sortBy || ''
      }}
    />
  )
}
