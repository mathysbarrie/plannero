'use client'

import type { BookingTheme } from '@/lib/booking-theme'
import { Input } from '@/components/ui/input'
import { ImageUploader } from './ImageUploader'

interface HeaderSectionProps {
  theme: BookingTheme
  businessName: string
  onChange: (updates: Partial<BookingTheme>) => void
  onUploadCover: (file: File) => Promise<string>
}

export function HeaderSection({
  theme,
  businessName,
  onChange,
  onUploadCover,
}: HeaderSectionProps) {
  return (
    <div className="space-y-6">
      {/* Logo toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.header.showLogo}
            onChange={(e) =>
              onChange({
                header: { ...theme.header, showLogo: e.target.checked },
              })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Afficher le logo
          </span>
        </label>
      </div>

      {/* Title */}
      <div>
        <Input
          label="Titre personnalisé"
          value={theme.header.title || ''}
          onChange={(e) =>
            onChange({
              header: { ...theme.header, title: e.target.value || null },
            })
          }
          placeholder={businessName}
        />
        <p className="mt-1 text-xs text-gray-500">
          Laisse vide pour utiliser le nom de ton business
        </p>
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sous-titre / Description
        </label>
        <textarea
          value={theme.header.subtitle || ''}
          onChange={(e) =>
            onChange({
              header: { ...theme.header, subtitle: e.target.value || null },
            })
          }
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Décris ton business en quelques mots..."
        />
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alignement du header
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              onChange({ header: { ...theme.header, alignment: 'left' } })
            }
            className={`flex-1 py-2 px-4 border-2 rounded-lg text-sm font-medium transition-colors ${
              theme.header.alignment === 'left'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Gauche
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ header: { ...theme.header, alignment: 'center' } })
            }
            className={`flex-1 py-2 px-4 border-2 rounded-lg text-sm font-medium transition-colors ${
              theme.header.alignment === 'center'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Centré
          </button>
        </div>
      </div>

      {/* Cover image */}
      <div>
        <ImageUploader
          label="Image de bannière"
          value={theme.header.coverImageUrl}
          onChange={(coverImageUrl) =>
            onChange({ header: { ...theme.header, coverImageUrl } })
          }
          onUpload={onUploadCover}
        />
      </div>

      {/* Overlay opacity */}
      {theme.header.coverImageUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opacité de l&apos;overlay ({Math.round(theme.header.coverOverlayOpacity * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.header.coverOverlayOpacity * 100}
            onChange={(e) =>
              onChange({
                header: {
                  ...theme.header,
                  coverOverlayOpacity: parseInt(e.target.value) / 100,
                },
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="mt-1 text-xs text-gray-500">
            Un overlay sombre peut améliorer la lisibilité du texte
          </p>
        </div>
      )}
    </div>
  )
}
