'use client'

import type { BookingTheme } from '@/lib/booking-theme'
import { ColorPicker } from './ColorPicker'
import { FontSelector } from './FontSelector'
import { ButtonStyleSelector, CardStyleSelector, LayoutStyleSelector } from './StyleSelector'

interface ThemeSectionProps {
  theme: BookingTheme
  onChange: (updates: Partial<BookingTheme>) => void
}

export function ThemeSection({ theme, onChange }: ThemeSectionProps) {
  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Couleurs</h3>
        <div className="grid gap-4">
          <ColorPicker
            label="Couleur d'accent"
            value={theme.colors.accent}
            onChange={(accent) =>
              onChange({ colors: { ...theme.colors, accent } })
            }
          />
          <ColorPicker
            label="Arrière-plan"
            value={theme.colors.background}
            onChange={(background) =>
              onChange({ colors: { ...theme.colors, background } })
            }
            presets={['#F9FAFB', '#FFFFFF', '#F3F4F6', '#FEF3C7', '#ECFDF5', '#EFF6FF', '#F5F3FF', '#FDF2F8']}
          />
          <ColorPicker
            label="Fond des cartes"
            value={theme.colors.cardBackground}
            onChange={(cardBackground) =>
              onChange({ colors: { ...theme.colors, cardBackground } })
            }
            presets={['#FFFFFF', '#F9FAFB', '#F3F4F6', '#FEFCE8', '#F0FDF4', '#EFF6FF', '#FAF5FF', '#FFF1F2']}
          />
          <ColorPicker
            label="Texte principal"
            value={theme.colors.text}
            onChange={(text) =>
              onChange({ colors: { ...theme.colors, text } })
            }
            presets={['#111827', '#1F2937', '#374151', '#000000', '#18181B', '#171717', '#0F172A', '#0C0A09']}
          />
          <ColorPicker
            label="Texte secondaire"
            value={theme.colors.textSecondary}
            onChange={(textSecondary) =>
              onChange({ colors: { ...theme.colors, textSecondary } })
            }
            presets={['#6B7280', '#9CA3AF', '#4B5563', '#71717A', '#737373', '#64748B', '#78716C', '#A1A1AA']}
          />
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Typographie</h3>
        <div className="grid gap-4">
          <FontSelector
            label="Police principale"
            value={theme.fonts.body}
            onChange={(body) =>
              onChange({ fonts: { ...theme.fonts, body } })
            }
          />
          <FontSelector
            label="Police des titres"
            value={theme.fonts.heading}
            onChange={(heading) =>
              onChange({ fonts: { ...theme.fonts, heading } })
            }
          />
        </div>
      </div>

      {/* Layout & Styles */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Disposition et styles</h3>
        <div className="space-y-6">
          <LayoutStyleSelector
            value={theme.layout}
            onChange={(layout) => onChange({ layout })}
          />
          <CardStyleSelector
            value={theme.cardStyle}
            onChange={(cardStyle) => onChange({ cardStyle })}
          />
          <ButtonStyleSelector
            value={theme.buttonStyle}
            onChange={(buttonStyle) => onChange({ buttonStyle })}
          />
        </div>
      </div>
    </div>
  )
}
