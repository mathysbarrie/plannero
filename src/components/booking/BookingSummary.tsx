import type { Service, Option } from '@/types/database.types'
import type { BookingTheme } from '@/lib/booking-theme'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

interface BookingSummaryProps {
  service: Service | null
  date: string | null
  time: string | null
  options: Option[]
  total: number
  cardClasses?: string
  theme?: BookingTheme
}

export function BookingSummary({ service, date, time, options, total, cardClasses, theme }: BookingSummaryProps) {
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

  const accentColor = theme?.colors.accent || '#171717'

  return (
    <div
      className={`p-6 sticky top-6 ${cardClasses || 'border border-neutral-200 bg-white'}`}
      style={{ backgroundColor: 'var(--booking-card-background, white)' }}
    >
      <h3
        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6"
        style={{
          color: 'var(--booking-text-secondary, #737373)',
          fontFamily: 'var(--booking-font-heading, inherit)',
        }}
      >
        Récapitulatif
      </h3>

      {service ? (
        <div className="space-y-4">
          {/* Service */}
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: accentColor }} />
            <div className="flex-1">
              <p className="text-[13px] font-medium" style={{ color: 'var(--booking-text, #171717)' }}>{service.name}</p>
              <p className="text-[11px]" style={{ color: 'var(--booking-text-secondary, #737373)' }}>{formatDuration(service.duration)}</p>
            </div>
            <p className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--booking-text, #171717)' }}>{Number(service.price).toFixed(2)} €</p>
          </div>

          {/* Date & Time */}
          {date && time && (
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5" style={{ color: accentColor }} />
              <div className="flex-1">
                <p className="text-[13px] font-medium capitalize" style={{ color: 'var(--booking-text, #171717)' }}>{formatDate(date)}</p>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--booking-text-secondary, #737373)' }}>
                  <Clock className="w-3 h-3" />
                  {time}
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          {options.length > 0 && (
            <div className="border-t border-neutral-100 pt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--booking-text-secondary, #737373)' }}>Options</p>
              {options.map(option => (
                <div key={option.id} className="flex justify-between text-[12px]">
                  <span style={{ color: 'var(--booking-text, #171717)' }}>{option.name}</span>
                  <span className="tabular-nums" style={{ color: 'var(--booking-text, #171717)' }}>+{Number(option.price).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t border-neutral-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--booking-text-secondary, #737373)' }}>Total</span>
              <span className="text-xl font-light tracking-tight tabular-nums" style={{ color: 'var(--booking-text, #171717)' }}>{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[12px]" style={{ color: 'var(--booking-text-secondary, #737373)' }}>Sélectionnez un service pour commencer</p>
      )}
    </div>
  )
}
