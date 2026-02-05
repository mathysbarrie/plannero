'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Client } from '@/types/database.types'

interface ClientFormProps {
  businessId: string
  client?: Client | null
  onClose: () => void
  onSuccess?: (client: Client) => void
}

export function ClientForm({ businessId, client, onClose, onSuccess }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(client?.name || '')
  const [email, setEmail] = useState(client?.email || '')
  const [phone, setPhone] = useState(client?.phone || '')

  const isEdit = !!client

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      if (isEdit) {
        // Update existing client
        const { data, error: updateError } = await supabase
          .from('clients')
          .update({ name, email, phone: phone || null } as never)
          .eq('id', client.id)
          .select()
          .single()

        if (updateError) {
          if (updateError.code === '23505') {
            throw new Error('Un client avec cet email existe deja')
          }
          throw updateError
        }

        onSuccess?.(data as Client)
      } else {
        // Create new client
        const { data, error: insertError } = await supabase
          .from('clients')
          .insert({
            business_id: businessId,
            name,
            email,
            phone: phone || null
          } as never)
          .select()
          .single()

        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error('Un client avec cet email existe deja')
          }
          throw insertError
        }

        onSuccess?.(data as Client)
      }

      router.refresh()
      onClose()
    } catch (err) {
      console.error('Error saving client:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const isValid = name.trim() && email.trim() && email.includes('@')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Modifier le client' : 'Ajouter un client'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nom complet *"
            placeholder="Jean Dupont"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            label="Email *"
            placeholder="jean@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="tel"
            label="Telephone"
            placeholder="06 12 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!isValid}
              className="flex-1"
            >
              {isEdit ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
