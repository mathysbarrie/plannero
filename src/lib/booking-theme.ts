import type { Business } from '@/types/database.types'

export interface BookingTheme {
  colors: {
    accent: string
    background: string
    cardBackground: string
    text: string
    textSecondary: string
  }
  fonts: {
    body: string
    heading: string
  }
  layout: 'default' | 'sidebar-left' | 'sidebar-right' | 'compact'
  cardStyle: 'bordered' | 'shadow' | 'flat' | 'rounded'
  buttonStyle: 'rounded' | 'square' | 'pill'
  header: {
    showLogo: boolean
    title: string | null
    subtitle: string | null
    alignment: 'left' | 'center'
    coverImageUrl: string | null
    coverOverlayOpacity: number
  }
  stepsOrder: string[]
  skipOptionsStep: boolean
  confirmation: {
    title: string
    message: string | null
    showSummary: boolean
    ctaText: string | null
    ctaUrl: string | null
  }
}

export const DEFAULT_THEME: BookingTheme = {
  colors: {
    accent: '#171717', // neutral-900 - monochrome accent
    background: '#FDFDFD', // off-white
    cardBackground: '#FFFFFF',
    text: '#171717', // neutral-900
    textSecondary: '#737373', // neutral-500
  },
  fonts: {
    body: 'Inter',
    heading: 'Inter',
  },
  layout: 'default',
  cardStyle: 'bordered',
  buttonStyle: 'square', // Architectural Clarity uses sharp edges
  header: {
    showLogo: true,
    title: null,
    subtitle: null,
    alignment: 'left',
    coverImageUrl: null,
    coverOverlayOpacity: 0,
  },
  stepsOrder: ['service', 'questions', 'datetime', 'options', 'contact'],
  skipOptionsStep: false,
  confirmation: {
    title: 'Réservation confirmée',
    message: null,
    showSummary: true,
    ctaText: null,
    ctaUrl: null,
  },
}

export const AVAILABLE_FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
]

export function getThemeFromBusiness(business: Business): BookingTheme {
  return {
    colors: {
      accent: business.accent_color || DEFAULT_THEME.colors.accent,
      background: business.background_color || DEFAULT_THEME.colors.background,
      cardBackground: business.card_background || DEFAULT_THEME.colors.cardBackground,
      text: business.text_color || DEFAULT_THEME.colors.text,
      textSecondary: business.text_secondary || DEFAULT_THEME.colors.textSecondary,
    },
    fonts: {
      body: business.font_family || DEFAULT_THEME.fonts.body,
      heading: business.font_heading || DEFAULT_THEME.fonts.heading,
    },
    layout: business.layout_style || DEFAULT_THEME.layout,
    cardStyle: business.card_style || DEFAULT_THEME.cardStyle,
    buttonStyle: business.button_style || DEFAULT_THEME.buttonStyle,
    header: {
      showLogo: business.show_logo ?? DEFAULT_THEME.header.showLogo,
      title: business.header_title,
      subtitle: business.header_subtitle,
      alignment: business.header_alignment || DEFAULT_THEME.header.alignment,
      coverImageUrl: business.cover_image_url,
      coverOverlayOpacity: business.cover_overlay_opacity ?? DEFAULT_THEME.header.coverOverlayOpacity,
    },
    stepsOrder: (business.steps_order as string[]) || DEFAULT_THEME.stepsOrder,
    skipOptionsStep: business.skip_options_step ?? DEFAULT_THEME.skipOptionsStep,
    confirmation: {
      title: business.confirmation_title || DEFAULT_THEME.confirmation.title,
      message: business.confirmation_message,
      showSummary: business.confirmation_show_summary ?? DEFAULT_THEME.confirmation.showSummary,
      ctaText: business.confirmation_cta_text,
      ctaUrl: business.confirmation_cta_url,
    },
  }
}

export function generateCSSVariables(theme: BookingTheme): Record<string, string> {
  return {
    '--booking-accent': theme.colors.accent,
    '--booking-accent-hover': adjustColor(theme.colors.accent, -10),
    '--booking-accent-light': adjustColor(theme.colors.accent, 90),
    '--booking-background': theme.colors.background,
    '--booking-card-background': theme.colors.cardBackground,
    '--booking-text': theme.colors.text,
    '--booking-text-secondary': theme.colors.textSecondary,
    '--booking-font-body': theme.fonts.body,
    '--booking-font-heading': theme.fonts.heading,
  }
}

export function generateCSSVariablesString(theme: BookingTheme): string {
  const vars = generateCSSVariables(theme)
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

// Adjust color brightness (positive = lighter, negative = darker)
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`
}

export function getCardClasses(cardStyle: BookingTheme['cardStyle']): string {
  switch (cardStyle) {
    case 'bordered':
      return 'border border-neutral-200 bg-white hover:border-neutral-300 transition-colors'
    case 'shadow':
      return 'shadow-md bg-white'
    case 'flat':
      return 'bg-neutral-50'
    case 'rounded':
      return 'border border-neutral-200 bg-white rounded-2xl'
    default:
      return 'border border-neutral-200 bg-white'
  }
}

export function getButtonClasses(buttonStyle: BookingTheme['buttonStyle']): string {
  switch (buttonStyle) {
    case 'rounded':
      return 'rounded-lg'
    case 'square':
      return 'rounded-none'
    case 'pill':
      return 'rounded-full'
    default:
      return 'rounded-lg'
  }
}

export function getGoogleFontsUrl(fonts: string[]): string {
  const uniqueFonts = Array.from(new Set(fonts)).filter(f => f !== 'Inter')
  if (uniqueFonts.length === 0) return ''

  const families = uniqueFonts
    .map(f => f.replace(/\s+/g, '+') + ':wght@400;500;600;700')
    .join('&family=')

  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`
}
