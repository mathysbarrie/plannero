import type { Option } from '@/types/database.types'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OptionsStepProps {
  options: Option[]
  selectedOptionIds: string[]
  onToggle: (optionId: string) => void
  onContinue: () => void
}

export function OptionsStep({ options, selectedOptionIds, onToggle, onContinue }: OptionsStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Ajoutez des options
      </h2>
      <p className="text-gray-500 mb-6">
        Personnalisez votre prestation avec des services supplémentaires
      </p>

      {options.length > 0 ? (
        <div className="space-y-3 mb-8">
          {options.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => onToggle(option.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border-2 border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{option.name}</h3>
                      {option.description && (
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 flex-shrink-0">
                    +{Number(option.price).toFixed(2)} €
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-8">
          <p className="text-gray-500">Aucune option disponible pour ce service.</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onContinue} size="lg">
          {options.length > 0 && selectedOptionIds.length === 0
            ? 'Continuer sans option'
            : 'Continuer'}
        </Button>
      </div>
    </div>
  )
}
