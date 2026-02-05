import Link from 'next/link'
import { Check, Lightbulb, Star } from 'lucide-react'
import type { OnboardingStep as OnboardingStepType } from '@/lib/onboarding'

interface OnboardingStepProps {
  step: OnboardingStepType
  stepNumber: number
  isLast: boolean
}

export function OnboardingStep({ step, stepNumber, isLast }: OnboardingStepProps) {
  const isCompleted = step.status === 'completed'
  const isCurrent = step.status === 'current'
  const isPending = step.status === 'pending'
  const isRecommended = step.badge === 'Recommandé'

  return (
    <div className="relative flex gap-4">
      {/* Vertical connector line */}
      {!isLast && (
        <div
          className={`absolute left-4 top-10 w-0.5 h-[calc(100%-2.5rem)] ${
            isCompleted ? 'bg-green-500' : 'bg-gray-200'
          } ${isPending ? 'border-dashed' : ''}`}
        />
      )}

      {/* Status indicator circle */}
      <div
        className={`
          relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full
          transition-all duration-300
          ${isCompleted ? 'bg-green-500 text-white' : ''}
          ${isCurrent && !isRecommended ? 'border-2 border-blue-500 bg-white text-blue-500 animate-pulse' : ''}
          ${isCurrent && isRecommended ? 'border-2 border-amber-500 bg-white text-amber-500' : ''}
          ${isPending ? 'border-2 border-gray-300 bg-white text-gray-400' : ''}
        `}
      >
        {isCompleted ? (
          <Check className="h-5 w-5" />
        ) : isRecommended && !isCompleted ? (
          <Star className="h-4 w-4" />
        ) : (
          <span className="text-sm font-medium">{stepNumber}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`
              font-medium
              ${isCompleted ? 'text-green-600' : ''}
              ${isCurrent ? 'text-gray-900' : ''}
              ${isPending ? 'text-gray-400' : ''}
            `}
          >
            {step.title}
          </h3>
          {step.badge && (
            <span
              className={`
                rounded-full px-2 py-0.5 text-xs font-medium
                ${step.badge === 'Recommandé' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}
              `}
            >
              {step.badge}
            </span>
          )}
        </div>

        <p className={`mt-1 text-sm ${isPending ? 'text-gray-300' : 'text-gray-500'}`}>
          {step.description}
        </p>

        {/* Tip for recommended steps */}
        {step.tip && isCurrent && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{step.tip}</span>
          </div>
        )}

        {/* Action button */}
        {isCurrent && (
          <div className="mt-3 flex gap-2">
            <Link
              href={step.href}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {step.isOptional ? 'Ajouter' : 'Commencer'}
              <span className="ml-1">→</span>
            </Link>
            {step.isOptional && (
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Passer
              </button>
            )}
          </div>
        )}

        {/* Completed steps can still be clicked to revisit */}
        {isCompleted && (
          <Link
            href={step.href}
            className="mt-2 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Modifier →
          </Link>
        )}
      </div>
    </div>
  )
}
