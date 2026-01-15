'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit2, Trash2, Clock, Euro, X, Check, ChevronDown, ChevronRight, Tag, FolderOpen } from 'lucide-react'
import type { Service, Business, Category, Option } from '@/types/database.types'

interface ServiceWithOptions extends Service {
  options?: Option[]
}

export default function ServicesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<ServiceWithOptions[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithOptions | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('60')
  const [categoryId, setCategoryId] = useState<string>('')

  // Upsells form state
  const [serviceOptions, setServiceOptions] = useState<{name: string; price: string; description: string}[]>([])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
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

    if (!businessTyped) {
      router.push('/dashboard/settings')
      return
    }

    setBusiness(businessTyped)

    // Load categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessTyped.id)
      .order('display_order', { ascending: true })

    setCategories((categoriesData || []) as Category[])

    // Expand all categories by default
    const catIds = new Set((categoriesData || []).map((c: Category) => c.id))
    setExpandedCategories(catIds)

    // Load services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessTyped.id)
      .order('created_at', { ascending: true })

    // Load options
    const { data: optionsData } = await supabase
      .from('options')
      .select('*')
      .eq('business_id', businessTyped.id)

    // Associate options with services
    const servicesWithOptions = (servicesData || []).map((service: Service) => ({
      ...service,
      options: (optionsData || []).filter((o: Option) => o.service_id === service.id)
    }))

    setServices(servicesWithOptions as ServiceWithOptions[])
    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setDuration('60')
    setCategoryId('')
    setServiceOptions([])
    setEditingService(null)
  }

  const openEditForm = (service: ServiceWithOptions) => {
    setEditingService(service)
    setName(service.name)
    setDescription(service.description || '')
    setPrice(service.price.toString())
    setDuration(service.duration.toString())
    setCategoryId(service.category_id || '')
    setServiceOptions(
      (service.options || []).map(o => ({
        name: o.name,
        price: o.price.toString(),
        description: o.description || ''
      }))
    )
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const addOption = () => {
    setServiceOptions([...serviceOptions, { name: '', price: '', description: '' }])
  }

  const removeOption = (index: number) => {
    setServiceOptions(serviceOptions.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: 'name' | 'price' | 'description', value: string) => {
    const updated = [...serviceOptions]
    updated[index][field] = value
    setServiceOptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business || !categoryId) return

    setSaving(true)
    const supabase = createClient()

    const serviceData = {
      business_id: business.id,
      category_id: categoryId,
      name,
      description: description || null,
      price: parseFloat(price),
      duration: parseInt(duration),
      is_active: true,
    }

    let serviceId: string

    if (editingService) {
      const { data, error } = await supabase
        .from('services')
        .update(serviceData as never)
        .eq('id', editingService.id)
        .select()
        .single()

      if (error || !data) {
        setSaving(false)
        return
      }
      serviceId = editingService.id

      // Delete old options for this service
      await supabase.from('options').delete().eq('service_id', serviceId)
    } else {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData as never)
        .select()
        .single()

      if (error || !data) {
        setSaving(false)
        return
      }
      serviceId = (data as Service).id
    }

    // Create new options
    const validOptions = serviceOptions.filter(o => o.name && o.price)
    if (validOptions.length > 0) {
      const optionsToInsert = validOptions.map(o => ({
        business_id: business.id,
        service_id: serviceId,
        name: o.name,
        description: o.description || null,
        price: parseFloat(o.price),
        is_active: true,
      }))

      await supabase.from('options').insert(optionsToInsert as never)
    }

    setSaving(false)
    closeForm()
    loadData()
  }

  const handleDelete = async (service: Service) => {
    if (!confirm(`Supprimer "${service.name}" ?`)) return

    const supabase = createClient()
    await supabase.from('services').delete().eq('id', service.id)
    setServices(services.filter(s => s.id !== service.id))
  }

  const toggleActive = async (service: Service) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('services')
      .update({ is_active: !service.is_active } as never)
      .eq('id', service.id)
      .select()
      .single()

    if (data) {
      setServices(services.map(s => s.id === service.id ? { ...s, ...(data as Service) } : s))
    }
  }

  const toggleCategory = (catId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId)
    } else {
      newExpanded.add(catId)
    }
    setExpandedCategories(newExpanded)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`
  }

  // Group services by category
  const servicesByCategory = categories.map(cat => ({
    category: cat,
    services: services.filter(s => s.category_id === cat.id)
  }))

  // Services without category (legacy or error)
  const uncategorizedServices = services.filter(s => !s.category_id)

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

  // No categories yet - prompt user to create some first
  if (categories.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prestations</h1>
            <p className="text-gray-500 mt-1">Gerez vos services et options</p>
          </div>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Creez vos categories en premier
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Avant de creer des prestations, definissez vos categories
              (ex: Textile, Auto, Fin de chantier) et leurs questions de qualification.
            </p>
            <Link href="/dashboard/categories">
              <Button>
                <FolderOpen className="w-4 h-4 mr-2" />
                Creer mes categories
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prestations</h1>
          <p className="text-gray-500 mt-1">Gerez vos services et options</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/categories">
            <Button variant="outline">
              <FolderOpen className="w-4 h-4 mr-2" />
              Categories
            </Button>
          </Link>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle prestation
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6 border-blue-200 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {editingService ? 'Modifier la prestation' : 'Nouvelle prestation'}
            </CardTitle>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category selection - MANDATORY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectionnez une categorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  <Link href="/dashboard/categories" className="text-blue-600 hover:underline">
                    Gerer les categories
                  </Link>
                </p>
              </div>

              <Input
                id="serviceName"
                label="Nom de la prestation *"
                placeholder="Ex : Nettoyage complet canape 3 places"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Decrivez ce que comprend cette prestation..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">EUR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duree *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1h</option>
                    <option value="90">1h30</option>
                    <option value="120">2h</option>
                    <option value="150">2h30</option>
                    <option value="180">3h</option>
                    <option value="240">4h</option>
                    <option value="300">5h</option>
                    <option value="360">6h</option>
                    <option value="480">8h</option>
                  </select>
                </div>
              </div>

              {/* Upsells / Options */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options / Upsells
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une option
                  </button>
                </div>

                {serviceOptions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Aucune option. Les options sont proposees au client apres le choix de la date.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {serviceOptions.map((option, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => updateOption(index, 'name', e.target.value)}
                            placeholder="Nom de l'option"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={option.description}
                              onChange={(e) => updateOption(index, 'description', e.target.value)}
                              placeholder="Description (optionnel)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <div className="relative w-24">
                              <input
                                type="number"
                                value={option.price}
                                onChange={(e) => updateOption(index, 'price', e.target.value)}
                                placeholder="Prix"
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 pr-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">EUR</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" loading={saving} disabled={!categoryId}>
                  {editingService ? 'Enregistrer' : 'Ajouter'}
                </Button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services list grouped by category */}
      {services.length === 0 && !showForm ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 mb-4">
              Vous n&apos;avez pas encore de prestation.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Creer ma premiere prestation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Categorized services */}
          {servicesByCategory.map(({ category, services: catServices }) => (
            <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">({catServices.length})</span>
                </div>
              </button>

              {expandedCategories.has(category.id) && (
                <div className="divide-y divide-gray-100">
                  {catServices.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                      Aucune prestation dans cette categorie
                    </div>
                  ) : (
                    catServices.map(service => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        formatDuration={formatDuration}
                        onEdit={openEditForm}
                        onDelete={handleDelete}
                        onToggleActive={toggleActive}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Legacy uncategorized services */}
          {uncategorizedServices.length > 0 && (
            <div className="border border-orange-200 rounded-xl overflow-hidden bg-orange-50/50">
              <div className="px-4 py-3 bg-orange-100">
                <p className="text-sm text-orange-700">
                  Ces prestations n&apos;ont pas de categorie. Modifiez-les pour les assigner.
                </p>
              </div>
              <div className="divide-y divide-gray-100 bg-white">
                {uncategorizedServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    formatDuration={formatDuration}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                    onToggleActive={toggleActive}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next step hint */}
      {services.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">
            <Check className="w-4 h-4 inline mr-1" />
            {services.length} prestation{services.length > 1 ? 's' : ''} configuree{services.length > 1 ? 's' : ''}.
            {' '}
            <button
              onClick={() => router.push('/dashboard/booking-page')}
              className="underline font-medium hover:no-underline"
            >
              Voir ma page de reservation
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

// Service card component
function ServiceCard({
  service,
  formatDuration,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  service: ServiceWithOptions
  formatDuration: (minutes: number) => string
  onEdit: (service: ServiceWithOptions) => void
  onDelete: (service: Service) => void
  onToggleActive: (service: Service) => void
}) {
  return (
    <div className={`px-4 py-4 bg-white transition-opacity ${!service.is_active ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            {!service.is_active && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                Desactive
              </span>
            )}
          </div>
          {service.description && (
            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Euro className="w-4 h-4" />
              {service.price} EUR
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(service.duration)}
            </span>
            {service.options && service.options.length > 0 && (
              <span className="flex items-center gap-1 text-blue-600">
                <Tag className="w-4 h-4" />
                {service.options.length} option{service.options.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(service)}
            className={`p-2 rounded-lg transition-colors ${
              service.is_active
                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
            }`}
            title={service.is_active ? 'Desactiver' : 'Activer'}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(service)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(service)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
