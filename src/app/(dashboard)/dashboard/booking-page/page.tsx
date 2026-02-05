'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check, ExternalLink, Eye, Paintbrush } from 'lucide-react'
import type { Business } from '@/types/database.types'

export default function BookingPageSettings() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const bookingUrl = business?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${business.slug}`
    : null

  useEffect(() => {
    loadBusiness()
  }, [])

  const loadBusiness = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setBusiness(data as Business | null)
    setLoading(false)
  }

  const copyToClipboard = async () => {
    if (!bookingUrl) return

    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 pt-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 w-1/3"></div>
          <div className="h-32 bg-neutral-200"></div>
        </div>
      </div>
    )
  }

  if (!business?.slug) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 pt-10">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">Page de réservation</h1>
        <div className="border border-neutral-200 bg-white p-12 text-center">
          <p className="text-[13px] text-neutral-500 mb-4">
            Configure d&apos;abord ton business dans les paramètres pour obtenir ton lien de réservation.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/settings'}
            className="bg-neutral-900 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Configurer mon business
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-20">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Page de réservation</h1>
        <p className="text-[11px] text-neutral-400 mt-1 uppercase tracking-wider">
          Partage ce lien avec tes clients pour qu&apos;ils puissent réserver
        </p>
      </header>

      {/* Lien de réservation */}
      <section className="mb-8">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-4">Ton lien de réservation</h2>
        <div className="border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 px-4 py-3 font-mono text-[12px] text-neutral-700 truncate">
              {bookingUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copier
                </>
              )}
            </button>
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-neutral-100">
            <a
              href={bookingUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-600 hover:border-neutral-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ouvrir
            </a>
            <a
              href="/dashboard/booking-page/customize"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Personnaliser
            </a>
          </div>
        </div>
      </section>

      {/* Aperçu */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Aperçu
          </h2>
        </div>
        <div className="border border-neutral-200 bg-white overflow-hidden">
          <iframe
            src={bookingUrl || ''}
            className="w-full h-[600px]"
            title="Aperçu de la page de réservation"
          />
        </div>
      </section>
    </div>
  )
}
