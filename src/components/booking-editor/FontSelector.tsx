'use client'

import { AVAILABLE_FONTS } from '@/lib/booking-theme'

interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  label?: string
}

export function FontSelector({ value, onChange, label }: FontSelectorProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {AVAILABLE_FONTS.map((font) => (
          <option
            key={font.value}
            value={font.value}
            style={{ fontFamily: font.value }}
          >
            {font.label}
          </option>
        ))}
      </select>
    </div>
  )
}
