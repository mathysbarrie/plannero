'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Business, Database } from '@/types/database.types'

type BusinessUpdate = Database['public']['Tables']['businesses']['Update']
import { type BookingTheme, getThemeFromBusiness } from '@/lib/booking-theme'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeSection, HeaderSection, StepsSection, ConfirmationSection } from '@/components/booking-editor'
import { ArrowLeft, Save, ExternalLink, Palette, Layout, List, CheckCircle } from 'lucide-react'

interface CustomizePageClientProps {
  business: Business
}

type TabId = 'theme' | 'header' | 'steps' | 'confirmation'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'theme', label: 'Thème', icon: <Palette className="w-4 h-4" /> },
  { id: 'header', label: 'Header', icon: <Layout className="w-4 h-4" /> },
  { id: 'steps', label: 'Étapes', icon: <List className="w-4 h-4" /> },
  { id: 'confirmation', label: 'Confirmation', icon: <CheckCircle className="w-4 h-4" /> },
]

export function CustomizePageClient({ business }: CustomizePageClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<TabId>('theme')
  const [theme, setTheme] = useState<BookingTheme>(() => getThemeFromBusiness(business))
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const bookingUrl = business.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${business.slug}`
    : null

  const updateTheme = useCallback((updates: Partial<BookingTheme>) => {
    setTheme((prev) => {
      const newTheme = { ...prev }

      if (updates.colors) {
        newTheme.colors = { ...prev.colors, ...updates.colors }
      }
      if (updates.fonts) {
        newTheme.fonts = { ...prev.fonts, ...updates.fonts }
      }
      if (updates.header) {
        newTheme.header = { ...prev.header, ...updates.header }
      }
      if (updates.confirmation) {
        newTheme.confirmation = { ...prev.confirmation, ...updates.confirmation }
      }
      if (updates.layout !== undefined) {
        newTheme.layout = updates.layout
      }
      if (updates.cardStyle !== undefined) {
        newTheme.cardStyle = updates.cardStyle
      }
      if (updates.buttonStyle !== undefined) {
        newTheme.buttonStyle = updates.buttonStyle
      }
      if (updates.stepsOrder !== undefined) {
        newTheme.stepsOrder = updates.stepsOrder
      }
      if (updates.skipOptionsStep !== undefined) {
        newTheme.skipOptionsStep = updates.skipOptionsStep
      }

      return newTheme
    })
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setSaving(true)

    try {
      const updateData: BusinessUpdate = {
        // Colors
        accent_color: theme.colors.accent,
        background_color: theme.colors.background,
        card_background: theme.colors.cardBackground,
        text_color: theme.colors.text,
        text_secondary: theme.colors.textSecondary,
        // Fonts
        font_family: theme.fonts.body,
        font_heading: theme.fonts.heading,
        // Layout
        layout_style: theme.layout,
        card_style: theme.cardStyle,
        button_style: theme.buttonStyle,
        // Header
        show_logo: theme.header.showLogo,
        header_title: theme.header.title,
        header_subtitle: theme.header.subtitle,
        header_alignment: theme.header.alignment,
        cover_image_url: theme.header.coverImageUrl,
        cover_overlay_opacity: theme.header.coverOverlayOpacity,
        // Steps
        steps_order: theme.stepsOrder,
        skip_options_step: theme.skipOptionsStep,
        // Confirmation
        confirmation_title: theme.confirmation.title,
        confirmation_message: theme.confirmation.message,
        confirmation_show_summary: theme.confirmation.showSummary,
        confirmation_cta_text: theme.confirmation.ctaText,
        confirmation_cta_url: theme.confirmation.ctaUrl,
      }

      const { error } = await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('id', business.id)

      if (error) {
        throw error
      }

      setHasChanges(false)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadCover = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handlePreview = async () => {
    if (hasChanges) {
      await handleSave()
    }
    if (bookingUrl) {
      window.open(bookingUrl, '_blank')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/booking-page')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Personnaliser la page
            </h1>
            <p className="text-gray-500 mt-1">
              Modifie l&apos;apparence de ta page de réservation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePreview}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'theme' && (
            <ThemeSection theme={theme} onChange={updateTheme} />
          )}
          {activeTab === 'header' && (
            <HeaderSection
              theme={theme}
              businessName={business.name}
              onChange={updateTheme}
              onUploadCover={handleUploadCover}
            />
          )}
          {activeTab === 'steps' && (
            <StepsSection theme={theme} onChange={updateTheme} />
          )}
          {activeTab === 'confirmation' && (
            <ConfirmationSection theme={theme} onChange={updateTheme} />
          )}
        </CardContent>
      </Card>

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg text-sm">
          Modifications non enregistrées
        </div>
      )}
    </div>
  )
}
