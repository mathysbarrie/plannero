import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/nav'
import { getOnboardingState } from '@/lib/onboarding'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get business and onboarding state for nav
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let onboardingComplete = true
  if (business) {
    const businessData = business as { id: string }
    const onboardingState = await getOnboardingState(businessData.id)
    onboardingComplete = onboardingState.isComplete
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <div className="dot-grid-bg" />
      <DashboardNav userEmail={user.email || ''} showOnboarding={!onboardingComplete} />
      <main>{children}</main>
    </div>
  )
}
