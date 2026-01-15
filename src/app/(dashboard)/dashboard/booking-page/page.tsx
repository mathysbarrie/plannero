'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink, Eye } from 'lucide-react'
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
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!business?.slug) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page de réservation</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              Configure d&apos;abord ton business dans les paramètres pour obtenir ton lien de réservation.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/settings'}>
              Configurer mon business
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Page de réservation</h1>
        <p className="text-gray-500 mt-1">
          Partage ce lien avec tes clients pour qu&apos;ils puissent réserver.
        </p>
      </div>

      {/* Lien de réservation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Ton lien de réservation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 truncate">
              {bookingUrl}
            </div>
            <Button
              onClick={copyToClipboard}
              variant={copied ? 'primary' : 'outline'}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-3 mt-4">
            <a
              href={bookingUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Aperçu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-gray-200">
            <iframe
              src={bookingUrl || ''}
              className="w-full h-[600px] rounded-b-xl"
              title="Aperçu de la page de réservation"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
