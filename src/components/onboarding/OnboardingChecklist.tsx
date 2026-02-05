import type { OnboardingStep as OnboardingStepType } from '@/lib/onboarding'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingStep } from './OnboardingStep'

interface OnboardingChecklistProps {
  steps: OnboardingStepType[]
  completedCount: number
  totalRequired: number
}

export function OnboardingChecklist({ steps, completedCount, totalRequired }: OnboardingChecklistProps) {
  // Calculate step numbers (only for required steps, optional don't have numbers)
  let requiredStepNumber = 0

  return (
    <div>
      <OnboardingProgress completed={completedCount} total={totalRequired} />

      <nav aria-label="Progression de la configuration">
        <ol role="list" className="space-y-0">
          {steps.map((step, index) => {
            // Increment step number only for required steps
            if (!step.isOptional) {
              requiredStepNumber++
            }
            const displayNumber = step.isOptional ? index + 1 : requiredStepNumber

            return (
              <li
                key={step.id}
                aria-current={step.status === 'current' ? 'step' : undefined}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <OnboardingStep
                  step={step}
                  stepNumber={displayNumber}
                  isLast={index === steps.length - 1}
                />
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
