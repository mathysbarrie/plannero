import type { Service, Option } from '@/types/database.types'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

interface BookingSummaryProps {
  service: Service | null
  date: string | null
  time: string | null
  options: Option[]
  total: number
}

export function BookingSummary({ service, date, time, options, total }: BookingSummaryProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins ? `${hours}h${mins}` : `${hours}h`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
      <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>

      {service ? (
        <div className="space-y-4">
          {/* Service */}
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-500">{formatDuration(service.duration)}</p>
            </div>
            <p className="font-medium text-gray-900">{Number(service.price).toFixed(2)} €</p>
          </div>

          {/* Date & Time */}
          {date && time && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 capitalize">{formatDate(date)}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {time}
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          {options.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium text-gray-500">Options</p>
              {options.map(option => (
                <div key={option.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{option.name}</span>
                  <span className="text-gray-900">+{Number(option.price).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Sélectionnez un service pour commencer</p>
      )}
    </div>
  )
}
