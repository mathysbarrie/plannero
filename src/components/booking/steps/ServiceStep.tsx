import type { Service, Category } from '@/types/database.types'
import { Clock, Check } from 'lucide-react'

interface ServiceStepProps {
  services: Service[]
  categories: Category[]
  selectedServiceId: string | null
  onSelect: (serviceId: string) => void
}

export function ServiceStep({ services, categories, selectedServiceId, onSelect }: ServiceStepProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins ? `${hours}h${mins}` : `${hours}h`
  }

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const catId = service.category_id || 'uncategorized'
    if (!acc[catId]) acc[catId] = []
    acc[catId].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Get category names map
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat
    return acc
  }, {} as Record<string, Category>)

  // Sort categories by display_order
  const sortedCategoryIds = [
    ...categories.sort((a, b) => a.display_order - b.display_order).map(c => c.id),
    ...(servicesByCategory['uncategorized'] ? ['uncategorized'] : [])
  ].filter(id => servicesByCategory[id]?.length > 0)

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun service disponible pour le moment.</p>
      </div>
    )
  }

  const renderServiceCard = (service: Service) => {
    const isSelected = service.id === selectedServiceId
    return (
      <button
        key={service.id}
        onClick={() => onSelect(service.id)}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          isSelected
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{service.name}</h3>
              {isSelected && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
            {service.description && (
              <p className="text-sm text-gray-500 mt-1">{service.description}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {formatDuration(service.duration)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {Number(service.price).toFixed(2)} €
            </p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Choisissez votre prestation
      </h2>
      <p className="text-gray-500 mb-6">
        Sélectionnez le service qui correspond à vos besoins
      </p>

      {sortedCategoryIds.length > 1 ? (
        // Multiple categories: show grouped
        <div className="space-y-6">
          {sortedCategoryIds.map((categoryId) => {
            const category = categoryMap[categoryId]
            const categoryServices = servicesByCategory[categoryId] || []

            return (
              <div key={categoryId}>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  {category?.name || 'Autres services'}
                </h3>
                {category?.description && (
                  <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                )}
                <div className="space-y-3">
                  {categoryServices.map(renderServiceCard)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Single or no category: show flat list
        <div className="space-y-3">
          {services.map(renderServiceCard)}
        </div>
      )}
    </div>
  )
}
