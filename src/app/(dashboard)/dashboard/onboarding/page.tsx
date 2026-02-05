import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOnboardingState } from '@/lib/onboarding'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete'
import { Rocket, HelpCircle } from 'lucide-react'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard/settings')
  }

  const businessData = business as { id: string; slug: string }
  const onboardingState = await getOnboardingState(businessData.id)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Rocket className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configurez votre page de reservation
          </h1>
        </div>
        <p className="text-gray-600 ml-12">
          Suivez ces etapes pour recevoir vos premieres reservations
        </p>
      </div>

      {/* Content */}
      {onboardingState.isComplete ? (
        <OnboardingComplete
          businessSlug={onboardingState.businessSlug!}
          optionalSteps={onboardingState.steps.filter(s => s.isOptional)}
        />
      ) : (
        <OnboardingChecklist
          steps={onboardingState.steps}
          completedCount={onboardingState.completedCount}
          totalRequired={onboardingState.totalRequired}
        />
      )}

      {/* Help section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
          <HelpCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Besoin d&apos;aide ?</h3>
            <p className="text-sm text-gray-600">
              Contactez-nous et nous vous guiderons dans le processus de configuration.
            </p>
            <a
              href="mailto:support@plannero.com"
              className="inline-flex items-center mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
