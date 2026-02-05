'use client'

import type { BookingTheme } from '@/lib/booking-theme'

interface BookingHeaderProps {
  businessName: string
  logoUrl: string | null
  theme: BookingTheme
}

export function BookingHeader({ businessName, logoUrl, theme }: BookingHeaderProps) {
  const title = theme.header.title || businessName
  const showLogo = theme.header.showLogo && logoUrl
  const alignment = theme.header.alignment

  return (
    <div className="relative mb-8">
      {/* Cover image */}
      {theme.header.coverImageUrl && (
        <div className="absolute inset-0 -mx-4 -mt-6 h-48 overflow-hidden">
          <img
            src={theme.header.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          {theme.header.coverOverlayOpacity > 0 && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: theme.header.coverOverlayOpacity }}
            />
          )}
        </div>
      )}

      {/* Header content */}
      <div
        className={`relative ${theme.header.coverImageUrl ? 'pt-32' : ''} ${
          alignment === 'center' ? 'text-center' : ''
        }`}
      >
        <div
          className={`flex items-center gap-4 ${
            alignment === 'center' ? 'justify-center' : ''
          } ${theme.header.coverImageUrl ? 'flex-col' : ''}`}
        >
          {showLogo && (
            <img
              src={logoUrl}
              alt={businessName}
              className={`object-cover border border-neutral-200 ${
                theme.header.coverImageUrl ? 'w-16 h-16 -mt-10' : 'w-10 h-10'
              }`}
              style={{ backgroundColor: 'var(--booking-card-background)' }}
            />
          )}
          <div>
            <h1
              className="text-lg font-light tracking-tight"
              style={{
                color: theme.header.coverImageUrl
                  ? '#FFFFFF'
                  : 'var(--booking-text)',
                fontFamily: 'var(--booking-font-heading)',
                textShadow: theme.header.coverImageUrl
                  ? '0 1px 2px rgba(0,0,0,0.3)'
                  : 'none',
              }}
            >
              {title}
            </h1>
            {theme.header.subtitle && (
              <p
                className="mt-1 text-[11px] uppercase tracking-wider"
                style={{
                  color: theme.header.coverImageUrl
                    ? 'rgba(255,255,255,0.9)'
                    : 'var(--booking-text-secondary)',
                }}
              >
                {theme.header.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
