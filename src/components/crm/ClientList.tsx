'use client'

import type { ClientWithStats } from '@/types/database.types'
import { ClientCard } from './ClientCard'
import { Users } from 'lucide-react'

interface ClientListProps {
  clients: ClientWithStats[]
}

export function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Les clients apparaitront ici automatiquement apres leur premiere reservation, ou vous pouvez les ajouter manuellement.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  )
}
