'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import type { BusinessHours } from '@/types/database.types'

interface TimeSlot {
  time: string
  available: boolean
}

interface DateTimeStepProps {
  businessId: string
  businessHours: BusinessHours[]
  serviceDuration: number
  selectedDate: string | null
  selectedTime: string | null
  onSelect: (date: string, time: string) => void
}

// Default hours if none configured
const DEFAULT_HOURS = {
  start: '09:00',
  end: '18:00',
  openDays: [1, 2, 3, 4, 5], // Mon-Fri
}

export function DateTimeStep({
  businessId,
  businessHours,
  serviceDuration,
  selectedDate,
  selectedTime,
  onSelect,
}: DateTimeStepProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  // Generate next 30 days
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      result.push(date)
    }
    return result
  }, [])

  // Get business hours for a specific day
  const getHoursForDay = useCallback((dayOfWeek: number) => {
    const hours = businessHours.find(h => h.day_of_week === dayOfWeek)
    if (hours) {
      return hours.is_open ? { start: hours.start_time, end: hours.end_time } : null
    }
    // Default: open Mon-Fri 9-18
    if (DEFAULT_HOURS.openDays.includes(dayOfWeek)) {
      return { start: DEFAULT_HOURS.start, end: DEFAULT_HOURS.end }
    }
    return null
  }, [businessHours])

  // Check if a day is available (has business hours)
  const isDayAvailable = (date: Date) => {
    const dayOfWeek = date.getDay()
    return getHoursForDay(dayOfWeek) !== null
  }

  // Fetch availability when date changes
  useEffect(() => {
    if (!currentDate) {
      setTimeSlots([])
      return
    }

    const fetchAvailability = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          businessId,
          date: currentDate,
          serviceDuration: serviceDuration.toString(),
        })

        const response = await fetch(`/api/availability?${params}`)
        const data = await response.json()

        if (data.slots) {
          setTimeSlots(data.slots)
        } else {
          setTimeSlots([])
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error)
        setTimeSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [currentDate, businessId, serviceDuration])

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)
  }

  const formatDayNumber = (date: Date) => {
    return date.getDate()
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'short' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatDateISO = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Filter only available slots
  const availableSlots = timeSlots.filter(slot => slot.available)

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Choisissez une date et un horaire
      </h2>
      <p className="text-gray-500 mb-6">
        Selectionnez le creneau qui vous convient
      </p>

      {/* Date picker - horizontal scroll */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">
            {days[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {days.map((date) => {
            const dateStr = formatDateISO(date)
            const isSelected = currentDate === dateStr
            const isAvailable = isDayAvailable(date)

            return (
              <button
                key={dateStr}
                onClick={() => isAvailable && setCurrentDate(dateStr)}
                disabled={!isAvailable}
                className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isAvailable
                    ? 'bg-white border border-gray-200 hover:border-blue-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <p className={`text-xs uppercase ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatDay(date)}
                </p>
                <p className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {formatDayNumber(date)}
                </p>
                <p className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {isToday(date) ? 'Auj.' : formatMonth(date)}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {currentDate && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Creneaux disponibles</h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Chargement...</span>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedDate === currentDate && selectedTime === slot.time
                return (
                  <button
                    key={slot.time}
                    onClick={() => onSelect(currentDate, slot.time)}
                    className={`py-3 px-4 rounded-lg text-center font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900 hover:border-blue-300'
                    }`}
                  >
                    {slot.time}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4">
              Aucun creneau disponible pour cette date. Essayez un autre jour.
            </p>
          )}
        </div>
      )}

      {!currentDate && (
        <p className="text-gray-500 text-sm">
          Selectionnez une date pour voir les creneaux disponibles.
        </p>
      )}
    </div>
  )
}
