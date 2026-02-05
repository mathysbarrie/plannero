'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink, PartyPopper } from 'lucide-react'
import type { OnboardingStep } from '@/lib/onboarding'

interface OnboardingCompleteProps {
  businessSlug: string
  optionalSteps: OnboardingStep[]
}

export function OnboardingComplete({ businessSlug, optionalSteps }: OnboardingCompleteProps) {
  const [copied, setCopied] = useState(false)
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${businessSlug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const incompleteOptional = optionalSteps.filter(s => s.status !== 'completed')

  return (
    <div className="text-center py-8">
      {/* Celebration icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 animate-bounce">
        <PartyPopper className="w-8 h-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Felicitations !
      </h2>
      <p className="text-gray-600 mb-8">
        Votre page de reservation est prete a recevoir des clients
      </p>

      {/* Booking URL card */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
        <p className="text-sm text-gray-500 mb-2">Votre lien de reservation</p>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
          <span className="flex-1 text-sm font-medium text-gray-900 truncate">
            /book/{businessSlug}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copier le lien"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <Link
            href={`/book/${businessSlug}`}
            target="_blank"
            className="shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <Link
          href={`/book/${businessSlug}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voir ma page
          <ExternalLink className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>

      {/* Optional steps section */}
      {incompleteOptional.length > 0 && (
        <div className="border-t border-gray-200 pt-8 mt-8 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Etapes bonus pour optimiser vos conversions
          </h3>
          <div className="space-y-3">
            {incompleteOptional.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                <Link
                  href={step.href}
                  className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Faire
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
