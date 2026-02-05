'use client'

import { useState } from 'react'
import type { Business, ClientWithStats } from '@/types/database.types'
import { ClientTable } from '@/components/crm/ClientTable'
import { ClientFilters, type FiltersState } from '@/components/crm/ClientFilters'
import { ClientForm } from '@/components/crm/ClientForm'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

interface CRMPageClientProps {
  business: Business
  clients: ClientWithStats[]
  filters: FiltersState
}

export function CRMPageClient({ business, clients, filters }: CRMPageClientProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-500 mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ClientFilters filters={filters} />
      </div>

      {/* Client table */}
      <ClientTable clients={clients} />

      {/* Add client modal */}
      {showForm && (
        <ClientForm
          businessId={business.id}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
