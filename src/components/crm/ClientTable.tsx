'use client'

import Link from 'next/link'
import type { ClientWithStats } from '@/types/database.types'
import { Users, ChevronRight } from 'lucide-react'

interface ClientTableProps {
  clients: ClientWithStats[]
}

export function ClientTable({ clients }: ClientTableProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Les clients apparaitront ici automatiquement apres leur premiere reservation, ou vous pouvez les ajouter manuellement.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Telephone
            </th>
            <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reservations
            </th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Total depense
            </th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Derniere visite
            </th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4">
                <Link href={`/dashboard/crm/${client.id}`} className="block">
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                {client.phone || '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full">
                  {client.booking_count}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 hidden sm:table-cell">
                {formatPrice(client.total_spent)}
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-500 hidden lg:table-cell">
                {formatDate(client.last_booking_date)}
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/dashboard/crm/${client.id}`}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg inline-flex"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
