'use client'

import type { ClientWithStats } from '@/types/database.types'
import { Calendar, DollarSign, TrendingUp, Hash } from 'lucide-react'

interface ClientStatsProps {
  client: ClientWithStats
  firstBookingDate?: string | null
}

export function ClientStats({ client, firstBookingDate }: ClientStatsProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const averageSpent = client.booking_count > 0
    ? client.total_spent / client.booking_count
    : 0

  const stats = [
    {
      label: 'Total reservations',
      value: client.booking_count.toString(),
      icon: Hash,
      color: 'blue'
    },
    {
      label: 'Total depense',
      value: formatPrice(client.total_spent),
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Panier moyen',
      value: formatPrice(averageSpent),
      icon: TrendingUp,
      color: 'purple'
    },
    {
      label: 'Derniere visite',
      value: formatDate(client.last_booking_date),
      icon: Calendar,
      color: 'orange'
    }
  ]

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
  }

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const colors = colorClasses[stat.color]
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 p-4"
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Additional info */}
      {firstBookingDate && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Client depuis le <span className="font-medium text-gray-700">{formatDate(firstBookingDate)}</span>
          </p>
        </div>
      )}
    </div>
  )
}
