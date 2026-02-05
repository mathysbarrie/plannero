'use client'

import type { BookingTheme } from '@/lib/booking-theme'
import { Input } from '@/components/ui/input'

interface ConfirmationSectionProps {
  theme: BookingTheme
  onChange: (updates: Partial<BookingTheme>) => void
}

export function ConfirmationSection({ theme, onChange }: ConfirmationSectionProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <Input
          label="Titre de confirmation"
          value={theme.confirmation.title}
          onChange={(e) =>
            onChange({
              confirmation: { ...theme.confirmation, title: e.target.value },
            })
          }
          placeholder="Réservation confirmée !"
        />
      </div>

      {/* Custom message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message personnalisé
        </label>
        <textarea
          value={theme.confirmation.message || ''}
          onChange={(e) =>
            onChange({
              confirmation: {
                ...theme.confirmation,
                message: e.target.value || null,
              },
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Merci pour votre réservation ! Nous vous attendons avec impatience..."
        />
      </div>

      {/* Show summary toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.confirmation.showSummary}
            onChange={(e) =>
              onChange({
                confirmation: {
                  ...theme.confirmation,
                  showSummary: e.target.checked,
                },
              })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Afficher le récapitulatif de la réservation
          </span>
        </label>
      </div>

      {/* CTA */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Bouton d&apos;action (optionnel)
        </h4>
        <div>
          <Input
            label="Texte du bouton"
            value={theme.confirmation.ctaText || ''}
            onChange={(e) =>
              onChange({
                confirmation: {
                  ...theme.confirmation,
                  ctaText: e.target.value || null,
                },
              })
            }
            placeholder="ex: Visiter notre site"
          />
        </div>
        <div>
          <Input
            label="URL du lien"
            value={theme.confirmation.ctaUrl || ''}
            onChange={(e) =>
              onChange({
                confirmation: {
                  ...theme.confirmation,
                  ctaUrl: e.target.value || null,
                },
              })
            }
            placeholder="https://..."
          />
        </div>
        {theme.confirmation.ctaText && !theme.confirmation.ctaUrl && (
          <p className="text-xs text-amber-600">
            Ajoute une URL pour activer le bouton
          </p>
        )}
      </div>
    </div>
  )
}
