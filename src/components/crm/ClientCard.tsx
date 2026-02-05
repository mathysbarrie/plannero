'use client'

import Link from 'next/link'
import type { ClientWithStats } from '@/types/database.types'
import { Mail, Phone, User } from 'lucide-react'

interface ClientCardProps {
  client: ClientWithStats
}

export function ClientCard({ client }: ClientCardProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Aucune'
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <Link
      href={`/dashboard/crm/${client.id}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-blue-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>

          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{client.email}</span>
          </div>

          {client.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{client.booking_count}</p>
          <p className="text-xs text-gray-500">Reservations</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{formatPrice(client.total_spent)}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{formatDate(client.last_booking_date)}</p>
          <p className="text-xs text-gray-500">Derniere visite</p>
        </div>
      </div>
    </Link>
  )
}
