'use client'

interface StyleOption<T> {
  value: T
  label: string
  preview: React.ReactNode
}

interface StyleSelectorProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: StyleOption<T>[]
  label?: string
}

export function StyleSelector<T extends string>({
  value,
  onChange,
  options,
  label,
}: StyleSelectorProps<T>) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors ${
              value === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="mb-2">{option.preview}</div>
            <span className="text-xs text-gray-600">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Pre-built button style options
export function ButtonStyleSelector({
  value,
  onChange,
}: {
  value: 'rounded' | 'square' | 'pill'
  onChange: (value: 'rounded' | 'square' | 'pill') => void
}) {
  const options: StyleOption<'rounded' | 'square' | 'pill'>[] = [
    {
      value: 'rounded',
      label: 'Arrondi',
      preview: (
        <div className="w-16 h-6 bg-blue-500 rounded-lg" />
      ),
    },
    {
      value: 'square',
      label: 'Carré',
      preview: (
        <div className="w-16 h-6 bg-blue-500 rounded-none" />
      ),
    },
    {
      value: 'pill',
      label: 'Pilule',
      preview: (
        <div className="w-16 h-6 bg-blue-500 rounded-full" />
      ),
    },
  ]

  return (
    <StyleSelector
      value={value}
      onChange={onChange}
      options={options}
      label="Style des boutons"
    />
  )
}

// Pre-built card style options
export function CardStyleSelector({
  value,
  onChange,
}: {
  value: 'bordered' | 'shadow' | 'flat' | 'rounded'
  onChange: (value: 'bordered' | 'shadow' | 'flat' | 'rounded') => void
}) {
  const options: StyleOption<'bordered' | 'shadow' | 'flat' | 'rounded'>[] = [
    {
      value: 'bordered',
      label: 'Bordure',
      preview: (
        <div className="w-14 h-10 bg-white border border-gray-200 rounded-lg" />
      ),
    },
    {
      value: 'shadow',
      label: 'Ombre',
      preview: (
        <div className="w-14 h-10 bg-white shadow-md rounded-lg" />
      ),
    },
    {
      value: 'flat',
      label: 'Plat',
      preview: (
        <div className="w-14 h-10 bg-gray-100 rounded-lg" />
      ),
    },
    {
      value: 'rounded',
      label: 'Arrondi+',
      preview: (
        <div className="w-14 h-10 bg-white border border-gray-200 rounded-2xl" />
      ),
    },
  ]

  return (
    <StyleSelector
      value={value}
      onChange={onChange}
      options={options}
      label="Style des cartes"
    />
  )
}

// Pre-built layout style options
export function LayoutStyleSelector({
  value,
  onChange,
}: {
  value: 'default' | 'sidebar-left' | 'sidebar-right' | 'compact'
  onChange: (value: 'default' | 'sidebar-left' | 'sidebar-right' | 'compact') => void
}) {
  const options: StyleOption<'default' | 'sidebar-left' | 'sidebar-right' | 'compact'>[] = [
    {
      value: 'default',
      label: 'Standard',
      preview: (
        <div className="w-16 h-10 bg-gray-100 rounded flex gap-1 p-1">
          <div className="flex-1 bg-white rounded" />
          <div className="w-4 bg-gray-200 rounded" />
        </div>
      ),
    },
    {
      value: 'sidebar-left',
      label: 'Sidebar gauche',
      preview: (
        <div className="w-16 h-10 bg-gray-100 rounded flex gap-1 p-1">
          <div className="w-4 bg-gray-200 rounded" />
          <div className="flex-1 bg-white rounded" />
        </div>
      ),
    },
    {
      value: 'sidebar-right',
      label: 'Sidebar droite',
      preview: (
        <div className="w-16 h-10 bg-gray-100 rounded flex gap-1 p-1">
          <div className="flex-1 bg-white rounded" />
          <div className="w-4 bg-gray-200 rounded" />
        </div>
      ),
    },
    {
      value: 'compact',
      label: 'Compact',
      preview: (
        <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center p-1">
          <div className="w-10 h-8 bg-white rounded" />
        </div>
      ),
    },
  ]

  return (
    <StyleSelector
      value={value}
      onChange={onChange}
      options={options}
      label="Disposition"
    />
  )
}
