interface OnboardingProgressProps {
  completed: number
  total: number
}

export function OnboardingProgress({ completed, total }: OnboardingProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progression</span>
        <span className="text-sm text-gray-500">
          {completed} sur {total} étapes obligatoires
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-600 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
