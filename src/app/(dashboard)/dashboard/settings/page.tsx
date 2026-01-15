'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, ChevronDown, Upload, Calendar, ExternalLink, X } from 'lucide-react'
import type { Business } from '@/types/database.types'

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [business, setBusiness] = useState<Business | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [slug, setSlug] = useState('')
  const [slugError, setSlugError] = useState('')
  const [bufferTime, setBufferTime] = useState('15')
  const [minNotice, setMinNotice] = useState('2')
  const [success, setSuccess] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    loadBusiness()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBusiness = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const businessTyped = businessData as Business | null
    if (businessTyped) {
      setBusiness(businessTyped)
      setName(businessTyped.name || '')
      setSlug(businessTyped.slug || '')
      setLogoUrl(businessTyped.logo_url)
    }

    setEmail(user.email || '')
    setLoading(false)
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!business?.slug || slug === generateSlug(business.name)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSlugChange = async (value: string) => {
    const cleanSlug = generateSlug(value)
    setSlug(cleanSlug)
    setSlugError('')

    if (cleanSlug && cleanSlug !== business?.slug) {
      const supabase = createClient()
      const { data } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', cleanSlug)
        .single()

      if (data) {
        setSlugError(`Ce slug est déjà pris. Essayez : ${cleanSlug}-pro ou ${cleanSlug}-${new Date().getFullYear()}`)
      }
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 2 Mo')
      return
    }

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setLogoUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadLogo = async (businessId: string): Promise<string | null> => {
    if (!logoFile) return logoUrl

    setUploadingLogo(true)
    const supabase = createClient()

    const fileExt = logoFile.name.split('.').pop()
    const fileName = `${businessId}.${fileExt}`

    const { error } = await supabase.storage
      .from('logos')
      .upload(fileName, logoFile, { upsert: true })

    setUploadingLogo(false)

    if (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload du logo')
      return logoUrl
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (slugError) return

    setSaving(true)
    setSuccess(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    let businessId = business?.id

    // If no business exists, create it first to get the ID for logo upload
    if (!business) {
      const { data: newBusiness } = await supabase
        .from('businesses')
        .insert({
          name,
          slug,
          user_id: user.id,
        } as never)
        .select()
        .single()

      if (newBusiness) {
        businessId = (newBusiness as Business).id
      }
    }

    if (!businessId) {
      setSaving(false)
      return
    }

    // Upload logo if a new one was selected
    const newLogoUrl = await uploadLogo(businessId)

    // Update business with logo URL
    await supabase
      .from('businesses')
      .update({
        name,
        slug,
        logo_url: newLogoUrl,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', businessId)

    setSaving(false)
    setSuccess(true)

    setTimeout(() => {
      router.push('/dashboard/services')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const completedFields = [name, email, slug].filter(Boolean).length
  const totalFields = 3

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurer mon business</h1>
        <p className="text-gray-500 mt-1">
          Quelques infos pour activer votre page de réservation et votre planning.
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span className={completedFields === totalFields ? 'text-green-600' : ''}>
              {completedFields}/{totalFields} champs complétés
            </span>
          </div>
          {completedFields === totalFields && (
            <Check className="w-4 h-4 text-green-600" />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloc 1 - Identité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identité du business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Nom du business *"
              placeholder="Ex : CleanPro Paris"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />

            <div>
              <Input
                id="email"
                type="email"
                label="Email de contact *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Affiché sur votre page de réservation
              </p>
            </div>

            <div>
              <Input
                id="phone"
                type="tel"
                label="Téléphone"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pour être recontacté rapidement (facultatif)
              </p>
            </div>

            <Input
              id="city"
              label="Ville / Zone principale"
              placeholder="Ex : Paris / 20 km autour"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo (facultatif)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
              {logoPreview || logoUrl ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={logoPreview || logoUrl || ''}
                      alt="Logo preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Ajouter un logo</span>
                </button>
              )}
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG ou SVG. Max 2 Mo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bloc 2 - Page de réservation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Page de réservation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de votre page *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                  plannero.fr/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    slugError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="mon-business"
                  required
                />
              </div>
              {slugError && (
                <p className="text-xs text-red-500 mt-1">{slugError}</p>
              )}
              {slug && !slugError && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Votre page : plannero.fr/{slug}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bloc 3 - Planning */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Google Calendar</p>
                <p className="text-sm text-gray-500">
                  Synchronisez vos indispos pour éviter les doubles réservations
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Connecter
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              On lit vos indispos pour éviter les doubles réservations. Aucune modification de votre calendrier.
            </p>
          </CardContent>
        </Card>

        {/* Bloc 4 - Paramètres avancés */}
        <Card>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <span className="font-medium text-gray-700">Paramètres avancés</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdvanced && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée tampon entre 2 interventions
                </label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Pas de tampon</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 heure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Délai minimum avant réservation
                </label>
                <select
                  value={minNotice}
                  onChange={(e) => setMinNotice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Pas de délai</option>
                  <option value="2">2 heures</option>
                  <option value="4">4 heures</option>
                  <option value="24">24 heures</option>
                  <option value="48">48 heures</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuseau horaire
                </label>
                <input
                  type="text"
                  value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Détecté automatiquement</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Success message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span>Business configuré. Redirection vers les prestations...</span>
          </div>
        )}
      </form>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Passer (je le ferai plus tard)
          </button>
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={saving || uploadingLogo}
            disabled={!name || !slug || !!slugError}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  )
}
