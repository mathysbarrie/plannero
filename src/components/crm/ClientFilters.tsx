'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export interface FiltersState {
  search: string
  bookingCount: string
  totalSpent: string
  lastVisit: string
  sortBy: string
}

interface ClientFiltersProps {
  filters: FiltersState
}

export function ClientFilters({ filters }: ClientFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilters = useCallback((updates: Partial<FiltersState>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  const hasActiveFilters = filters.bookingCount || filters.totalSpent || filters.lastVisit

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, email ou telephone..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtres:</span>
        </div>

        {/* Booking count filter */}
        <select
          value={filters.bookingCount}
          onChange={(e) => updateFilters({ bookingCount: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Reservations</option>
          <option value="0">Aucune</option>
          <option value="1-5">1 a 5</option>
          <option value="5+">Plus de 5</option>
        </select>

        {/* Total spent filter */}
        <select
          value={filters.totalSpent}
          onChange={(e) => updateFilters({ totalSpent: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Montant depense</option>
          <option value="<100">Moins de 100 EUR</option>
          <option value="100-500">100 - 500 EUR</option>
          <option value="500+">Plus de 500 EUR</option>
        </select>

        {/* Last visit filter */}
        <select
          value={filters.lastVisit}
          onChange={(e) => updateFilters({ lastVisit: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Derniere visite</option>
          <option value="<30">Moins de 30 jours</option>
          <option value="30-90">1 a 3 mois</option>
          <option value="90+">Plus de 3 mois</option>
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Trier par</option>
          <option value="name">Nom (A-Z)</option>
          <option value="name-desc">Nom (Z-A)</option>
          <option value="last_booking">Derniere visite</option>
          <option value="total_spent">Total depense</option>
          <option value="booking_count">Nb reservations</option>
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>
    </div>
  )
}
