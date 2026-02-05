import { createClient } from '@/lib/supabase/server'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  href: string
  status: 'completed' | 'current' | 'pending'
  isOptional: boolean
  badge?: string
  tip?: string
}

export interface OnboardingState {
  steps: OnboardingStep[]
  completedCount: number
  totalRequired: number
  totalOptionalCompleted: number
  isComplete: boolean
  businessSlug: string | null
}

const DEFAULT_ACCENT_COLOR = '#3B82F6'
const DEFAULT_FONT_FAMILY = 'Inter'

interface BusinessOnboardingData {
  name: string
  slug: string
  logo_url: string | null
  accent_color: string | null
  font_family: string | null
  header_title: string | null
  header_subtitle: string | null
  cover_image_url: string | null
}

export async function getOnboardingState(businessId: string): Promise<OnboardingState> {
  const supabase = await createClient()

  // Fetch all data in parallel
  const [businessResult, categoriesResult, servicesResult, businessHoursResult] = await Promise.all([
    supabase.from('businesses').select(`
      name, slug, logo_url,
      accent_color, font_family, header_title, header_subtitle, cover_image_url
    `).eq('id', businessId).single(),
    supabase.from('categories').select('id').eq('business_id', businessId),
    supabase.from('services').select('id').eq('business_id', businessId).eq('is_active', true),
    supabase.from('business_hours').select('id').eq('business_id', businessId)
  ])

  const business = businessResult.data as BusinessOnboardingData | null
  const categories = categoriesResult.data ?? []
  const services = servicesResult.data ?? []
  const businessHours = businessHoursResult.data ?? []

  // Calculate step completion
  const profileComplete = !!(business?.name && business?.slug)
  const logoComplete = !!business?.logo_url
  const categoryComplete = categories.length >= 1
  const serviceComplete = services.length >= 1
  const hoursComplete = businessHours.length >= 1

  // Check if at least one customization has been made
  const customizationComplete = !!(
    (business?.accent_color && business.accent_color !== DEFAULT_ACCENT_COLOR) ||
    (business?.font_family && business.font_family !== DEFAULT_FONT_FAMILY) ||
    business?.header_title ||
    business?.header_subtitle ||
    business?.cover_image_url
  )

  const readyToShare = profileComplete && categoryComplete && serviceComplete

  // Determine current step (first non-completed required step)
  const getStatus = (isComplete: boolean, prerequisiteComplete: boolean): 'completed' | 'current' | 'pending' => {
    if (isComplete) return 'completed'
    if (prerequisiteComplete) return 'current'
    return 'pending'
  }

  // For optional steps, they become "current" only after their prerequisite is done
  // but they don't block the next required step
  const getOptionalStatus = (isComplete: boolean, prerequisiteComplete: boolean): 'completed' | 'current' | 'pending' => {
    if (isComplete) return 'completed'
    if (prerequisiteComplete) return 'current'
    return 'pending'
  }

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Configurer votre profil',
      description: 'Nom de votre entreprise et URL de réservation',
      href: '/dashboard/settings',
      status: profileComplete ? 'completed' : 'current',
      isOptional: false
    },
    {
      id: 'logo',
      title: 'Ajouter votre logo',
      description: 'Personnalisez votre page avec votre identité',
      href: '/dashboard/settings',
      status: getOptionalStatus(logoComplete, profileComplete),
      isOptional: true,
      badge: 'Optionnel'
    },
    {
      id: 'category',
      title: 'Créer une catégorie',
      description: 'Organisez vos services par catégorie',
      href: '/dashboard/categories',
      status: getStatus(categoryComplete, profileComplete),
      isOptional: false
    },
    {
      id: 'service',
      title: 'Ajouter un service',
      description: 'Définissez vos prestations avec prix et durée',
      href: '/dashboard/services',
      status: getStatus(serviceComplete, categoryComplete),
      isOptional: false
    },
    {
      id: 'hours',
      title: 'Définir vos horaires',
      description: 'Par défaut : Lun-Ven 9h-18h',
      href: '/dashboard/settings',
      status: getOptionalStatus(hoursComplete, serviceComplete),
      isOptional: true,
      badge: 'Optionnel'
    },
    {
      id: 'customize',
      title: 'Personnaliser votre page',
      description: 'Couleurs, typographie et style de votre page',
      href: '/dashboard/booking-page/customize',
      status: getOptionalStatus(customizationComplete, serviceComplete),
      isOptional: true,
      badge: 'Recommandé',
      tip: 'Une page personnalisée convertit 2x mieux !'
    },
    {
      id: 'share',
      title: 'Partager votre page',
      description: 'Votre page de réservation est prête !',
      href: '/dashboard/booking-page',
      status: readyToShare ? 'completed' : 'pending',
      isOptional: false
    }
  ]

  // Count completed required steps
  const requiredSteps = steps.filter(s => !s.isOptional)
  const completedRequired = requiredSteps.filter(s => s.status === 'completed').length

  // Count completed optional steps
  const optionalSteps = steps.filter(s => s.isOptional)
  const completedOptional = optionalSteps.filter(s => s.status === 'completed').length

  return {
    steps,
    completedCount: completedRequired,
    totalRequired: requiredSteps.length,
    totalOptionalCompleted: completedOptional,
    isComplete: readyToShare,
    businessSlug: business?.slug ?? null
  }
}
