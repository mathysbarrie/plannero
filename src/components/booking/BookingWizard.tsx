'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import type { Business, Service, Option, BusinessHours, Category, CategoryQuestion } from '@/types/database.types'
import { ProgressBar } from './ProgressBar'
import { BookingSummary } from './BookingSummary'
import { ServiceStep } from './steps/ServiceStep'
import { QuestionsStep } from './steps/QuestionsStep'
import { DateTimeStep } from './steps/DateTimeStep'
import { OptionsStep } from './steps/OptionsStep'
import { ContactStep } from './steps/ContactStep'
import { ArrowLeft } from 'lucide-react'

interface BookingWizardProps {
  business: Business
  services: Service[]
  categories: Category[]
  categoryQuestions: CategoryQuestion[]
  options: Option[]
  businessHours: BusinessHours[]
}

export interface BookingState {
  step: number
  serviceId: string | null
  answers: Record<string, string>
  date: string | null
  time: string | null
  optionIds: string[]
  contact: {
    name: string
    email: string
    phone: string
  }
}

const TOTAL_STEPS = 5

export function BookingWizard({ business, services, categories, categoryQuestions, options, businessHours }: BookingWizardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse answers from URL (format: q_id1=val1&q_id2=val2)
  const parseAnswers = useCallback(() => {
    const answers: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith('q_')) {
        answers[key.slice(2)] = value
      }
    })
    return answers
  }, [searchParams])

  // Parse state from URL
  const state: BookingState = useMemo(() => ({
    step: parseInt(searchParams.get('step') || '1'),
    serviceId: searchParams.get('service'),
    answers: parseAnswers(),
    date: searchParams.get('date'),
    time: searchParams.get('time'),
    optionIds: searchParams.get('options')?.split(',').filter(Boolean) || [],
    contact: {
      name: searchParams.get('name') || '',
      email: searchParams.get('email') || '',
      phone: searchParams.get('phone') || '',
    },
  }), [searchParams, parseAnswers])

  // Update URL with new state
  const updateState = useCallback((updates: Partial<BookingState>) => {
    const params = new URLSearchParams(searchParams.toString())

    if (updates.step !== undefined) params.set('step', updates.step.toString())
    if (updates.serviceId !== undefined) {
      if (updates.serviceId) params.set('service', updates.serviceId)
      else params.delete('service')
    }
    if (updates.answers !== undefined) {
      // Clear old answers
      Array.from(params.keys()).forEach(key => {
        if (key.startsWith('q_')) params.delete(key)
      })
      // Set new answers
      Object.entries(updates.answers).forEach(([qId, val]) => {
        if (val) params.set(`q_${qId}`, val)
      })
    }
    if (updates.date !== undefined) {
      if (updates.date) params.set('date', updates.date)
      else params.delete('date')
    }
    if (updates.time !== undefined) {
      if (updates.time) params.set('time', updates.time)
      else params.delete('time')
    }
    if (updates.optionIds !== undefined) {
      if (updates.optionIds.length) params.set('options', updates.optionIds.join(','))
      else params.delete('options')
    }
    if (updates.contact !== undefined) {
      if (updates.contact.name) params.set('name', updates.contact.name)
      if (updates.contact.email) params.set('email', updates.contact.email)
      if (updates.contact.phone) params.set('phone', updates.contact.phone)
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const goToStep = useCallback((step: number) => {
    updateState({ step })
  }, [updateState])

  // Get selected service
  const selectedService = useMemo(() =>
    services.find(s => s.id === state.serviceId) || null,
    [services, state.serviceId]
  )

  // Get questions for selected service's category
  const questionsForService = useMemo(() => {
    if (!selectedService?.category_id) return []
    return categoryQuestions
      .filter(q => q.category_id === selectedService.category_id)
      .sort((a, b) => a.display_order - b.display_order)
  }, [selectedService, categoryQuestions])

  const goNext = useCallback(() => {
    if (state.step < TOTAL_STEPS) {
      goToStep(state.step + 1)
    }
  }, [state.step, goToStep])

  const goBack = useCallback(() => {
    if (state.step > 1) {
      // Skip step 2 if no questions when going back from step 3
      if (state.step === 3 && questionsForService.length === 0) {
        goToStep(1)
      } else {
        goToStep(state.step - 1)
      }
    }
  }, [state.step, goToStep, questionsForService.length])

  // Get selected options
  const selectedOptions = useMemo(() =>
    options.filter(o => state.optionIds.includes(o.id)),
    [options, state.optionIds]
  )

  // Calculate total
  const total = useMemo(() => {
    let sum = selectedService?.price || 0
    selectedOptions.forEach(o => sum += o.price)
    return sum
  }, [selectedService, selectedOptions])

  // Render current step
  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <ServiceStep
            services={services}
            categories={categories}
            selectedServiceId={state.serviceId}
            onSelect={(serviceId) => {
              // Check if selected service's category has questions
              const service = services.find(s => s.id === serviceId)
              const hasQuestions = service?.category_id &&
                categoryQuestions.some(q => q.category_id === service.category_id)
              // Skip to step 3 if no questions, otherwise go to step 2
              updateState({ serviceId, step: hasQuestions ? 2 : 3 })
            }}
          />
        )
      case 2:
        return (
          <QuestionsStep
            questions={questionsForService}
            answers={state.answers}
            onUpdate={(answers) => updateState({ answers })}
            onContinue={goNext}
          />
        )
      case 3:
        return (
          <DateTimeStep
            businessId={business.id}
            businessHours={businessHours}
            serviceDuration={selectedService?.duration || 60}
            selectedDate={state.date}
            selectedTime={state.time}
            onSelect={(date, time) => {
              updateState({ date, time, step: 4 })
            }}
          />
        )
      case 4:
        return (
          <OptionsStep
            options={options.filter(o => !o.service_id || o.service_id === state.serviceId)}
            selectedOptionIds={state.optionIds}
            onToggle={(optionId) => {
              const newIds = state.optionIds.includes(optionId)
                ? state.optionIds.filter(id => id !== optionId)
                : [...state.optionIds, optionId]
              updateState({ optionIds: newIds })
            }}
            onContinue={goNext}
          />
        )
      case 5:
        return (
          <ContactStep
            contact={state.contact}
            onUpdate={(contact) => updateState({ contact })}
            onSubmit={async () => {
              // Submit will be handled inside ContactStep
            }}
            business={business}
            selectedService={selectedService}
            selectedOptions={selectedOptions}
            selectedDate={state.date}
            selectedTime={state.time}
            total={total}
            answers={state.answers}
            questions={questionsForService}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {business.logo_url && (
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <h1 className="text-xl font-semibold text-gray-900">{business.name}</h1>
        </div>
        <ProgressBar currentStep={state.step} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Main content */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Step content */}
        <div className="lg:col-span-2">
          {state.step > 1 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
          {renderStep()}
        </div>

        {/* Summary sidebar - desktop */}
        <div className="hidden lg:block">
          <BookingSummary
            service={selectedService}
            date={state.date}
            time={state.time}
            options={selectedOptions}
            total={total}
          />
        </div>
      </div>

      {/* Summary footer - mobile */}
      {state.step > 1 && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{total.toFixed(2)} EUR</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
