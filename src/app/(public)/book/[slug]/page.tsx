import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BookingWizard } from '@/components/booking/BookingWizard'
import type { Business, Service, Option, BusinessHours, Category, CategoryQuestion } from '@/types/database.types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BookingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch business by slug
  const { data: businessData } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!businessData) {
    notFound()
  }

  const business = businessData as Business

  // Fetch active services
  const { data: servicesData } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('business_id', business.id)
    .order('display_order', { ascending: true })

  // Fetch category questions
  const categoryIds = (categoriesData || []).map((c: Category) => c.id)
  const { data: questionsData } = categoryIds.length > 0
    ? await supabase
        .from('category_questions')
        .select('*')
        .in('category_id', categoryIds)
        .order('display_order', { ascending: true })
    : { data: [] }

  // Fetch active options
  const { data: optionsData } = await supabase
    .from('options')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // Fetch business hours
  const { data: businessHoursData } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', business.id)
    .order('day_of_week', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <BookingWizard
        business={business}
        services={(servicesData || []) as Service[]}
        categories={(categoriesData || []) as Category[]}
        categoryQuestions={(questionsData || []) as CategoryQuestion[]}
        options={(optionsData || []) as Option[]}
        businessHours={(businessHoursData || []) as BusinessHours[]}
      />
    </div>
  )
}
