'use client'

import type { ClientBooking } from '@/lib/clients/queries'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Hourglass } from 'lucide-react'

interface BookingHistoryProps {
  bookings: ClientBooking[]
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50', icon: Hourglass },
  confirmed: { label: 'Confirme', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  completed: { label: 'Termine', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Annule', color: 'text-red-600 bg-red-50', icon: XCircle },
  no_show: { label: 'Absent', color: 'text-gray-600 bg-gray-50', icon: AlertCircle }
}

export function BookingHistory({ bookings }: BookingHistoryProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Aucune reservation pour ce client</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const status = statusConfig[booking.status] || statusConfig.pending
        const StatusIcon = status.icon

        return (
          <div
            key={booking.id}
            className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Service and date */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {booking.service?.name || 'Service supprime'}
                </h4>

                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(booking.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {booking.time}
                  </span>
                </div>
              </div>

              {/* Right: Status and price */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900">{formatPrice(booking.total_price)}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </div>
              </div>
            </div>

            {booking.notes && (
              <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded p-2">
                {booking.notes}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
