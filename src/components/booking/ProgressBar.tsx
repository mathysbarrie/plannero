interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  accentColor?: string
}

const STEP_LABELS = ['Service', 'Questions', 'Date & Heure', 'Options', 'Coordonnées']

export function ProgressBar({ currentStep, totalSteps, accentColor = '#171717' }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ color: 'var(--booking-text, #171717)' }}
        >
          Étape {currentStep}/{totalSteps}
        </span>
        <span
          className="text-[11px] uppercase tracking-wider"
          style={{ color: 'var(--booking-text-secondary, #737373)' }}
        >
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>
      <div className="w-full bg-neutral-100 h-1">
        <div
          className="h-1 transition-all duration-300"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  )
}
