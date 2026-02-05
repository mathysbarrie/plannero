'use client'

import { useState } from 'react'
import type { BookingTheme } from '@/lib/booking-theme'
import { GripVertical, Eye, EyeOff } from 'lucide-react'

interface StepsSectionProps {
  theme: BookingTheme
  onChange: (updates: Partial<BookingTheme>) => void
}

const STEP_LABELS: Record<string, string> = {
  service: 'Choix du service',
  questions: 'Questions',
  datetime: 'Date et heure',
  options: 'Options',
  contact: 'Contact',
}

export function StepsSection({ theme, onChange }: StepsSectionProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newOrder = [...theme.stepsOrder]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(index, 0, removed)

    onChange({ stepsOrder: newOrder })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* Steps order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Ordre des étapes
        </label>
        <div className="space-y-2">
          {theme.stepsOrder.map((step, index) => (
            <div
              key={step}
              draggable={step !== 'service' && step !== 'contact'}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
                draggedIndex === index
                  ? 'border-blue-500 shadow-sm'
                  : 'border-gray-200'
              } ${
                step === 'service' || step === 'contact'
                  ? 'opacity-60'
                  : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <GripVertical
                className={`w-4 h-4 ${
                  step === 'service' || step === 'contact'
                    ? 'text-gray-300'
                    : 'text-gray-400'
                }`}
              />
              <span className="flex-1 text-sm text-gray-700">
                {index + 1}. {STEP_LABELS[step]}
              </span>
              {step === 'options' && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({ skipOptionsStep: !theme.skipOptionsStep })
                  }
                  className={`p-1 rounded ${
                    theme.skipOptionsStep
                      ? 'text-gray-400 hover:text-gray-600'
                      : 'text-blue-500 hover:text-blue-600'
                  }`}
                  title={
                    theme.skipOptionsStep
                      ? 'Activer cette étape'
                      : 'Désactiver cette étape'
                  }
                >
                  {theme.skipOptionsStep ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Glisse les étapes pour les réordonner. L&apos;étape Service est toujours
          en premier et Contact toujours en dernier.
        </p>
      </div>

      {/* Skip options step toggle */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.skipOptionsStep}
            onChange={(e) => onChange({ skipOptionsStep: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Masquer l&apos;étape Options si aucune option disponible
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              L&apos;étape sera automatiquement passée si le service n&apos;a pas
              d&apos;options
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
