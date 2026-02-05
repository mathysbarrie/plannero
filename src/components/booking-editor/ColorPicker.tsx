'use client'

import { useState, useRef, useEffect } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  presets?: string[]
}

const DEFAULT_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
]

export function ColorPicker({ value, onChange, label, presets = DEFAULT_PRESETS }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue)
    }
  }

  const handlePresetClick = (color: string) => {
    onChange(color)
    setInputValue(color)
    setIsOpen(false)
  }

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className="w-6 h-6 rounded border border-gray-200"
            style={{ backgroundColor: value }}
          />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm text-gray-700 bg-transparent outline-none uppercase"
            placeholder="#000000"
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                    value === color ? 'border-gray-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                />
              ))}
            </div>
            <input
              type="color"
              value={value}
              onChange={(e) => handlePresetClick(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  )
}
