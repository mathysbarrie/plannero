import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Calendar, DollarSign, TrendingUp, Users, Clock } from 'lucide-react'
import type { Business, Booking } from '@/types/database.types'
import { getOnboardingState } from '@/lib/onboarding'

async function getBusinessData(userId: string): Promise<Business | null> {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)
    .single()

  return business as Business | null
}

async function getDashboardStats(businessId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get today's bookings
  const { data: todayBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .eq('date', today)

  // Get week's bookings
  const { data: weekBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .gte('date', weekAgo)
    .lte('date', today)

  const todayData = (todayBookings || []) as Booking[]
  const weekData = (weekBookings || []) as Booking[]

  const todayCount = todayData.length
  const todayRevenue = todayData.reduce((sum, b) => sum + b.total_price, 0)
  const todayUpsells = todayData.reduce((sum, b) => sum + (b.total_price - b.base_price), 0)

  const weekRevenue = weekData.reduce((sum, b) => sum + b.total_price, 0)
  const weekCount = weekData.length
  const avgBasket = weekCount > 0 ? weekRevenue / weekCount : 0
  const weekUpsells = weekData.reduce((sum, b) => sum + (b.total_price - b.base_price), 0)
  const upsellRate = weekRevenue > 0 ? (weekUpsells / weekRevenue) * 100 : 0
  const noShows = weekData.filter(b => b.status === 'no_show').length

  return {
    today: { count: todayCount, revenue: todayRevenue, upsells: todayUpsells },
    week: { revenue: weekRevenue, avgBasket, upsellRate, noShows },
  }
}

type BookingWithService = Booking & { services: { name: string } | null }

async function getUpcomingBookings(businessId: string): Promise<BookingWithService[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      services:service_id (name)
    `)
    .eq('business_id', businessId)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(10)

  return (bookings || []) as BookingWithService[]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const business = await getBusinessData(user.id)

  // If no business exists, show setup prompt
  if (!business) {
    redirect('/dashboard/settings')
  }

  // Check if new user (business created < 24h ago) and redirect to onboarding
  const businessCreatedAt = new Date(business.created_at)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const isNewUser = businessCreatedAt > twentyFourHoursAgo

  if (isNewUser) {
    const onboardingState = await getOnboardingState(business.id)
    if (!onboardingState.isComplete) {
      redirect('/dashboard/onboarding')
    }
  }

  const stats = await getDashboardStats(business.id)
  const bookings = await getUpcomingBookings(business.id)

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-medium border border-neutral-200 bg-neutral-100 text-neutral-600 tracking-tight">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900">{business.name}</h1>
        </div>
      </header>

      {/* Today Stats */}
      <section className="mb-12">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-4">Aujourd&apos;hui</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-neutral-200">
          <div className="p-4 bg-white border-r border-b border-neutral-200 hover:border-neutral-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-neutral-50 border border-neutral-100">
                <Calendar size={14} className="text-neutral-500" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={10} /> +12%
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">Interventions</span>
            <p className="text-xl font-light tracking-tight text-neutral-900">{stats.today.count}</p>
          </div>

          <div className="p-4 bg-white border-r border-b border-neutral-200 hover:border-neutral-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-neutral-50 border border-neutral-100">
                <DollarSign size={14} className="text-neutral-500" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={10} /> +8%
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">CA du jour</span>
            <p className="text-xl font-light tracking-tight text-neutral-900">{stats.today.revenue.toFixed(0)}€</p>
          </div>

          <div className="p-4 bg-white border-r border-b border-neutral-200 hover:border-neutral-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-neutral-50 border border-neutral-100">
                <TrendingUp size={14} className="text-neutral-500" />
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">Upsells</span>
            <p className="text-xl font-light tracking-tight text-neutral-900">+{stats.today.upsells.toFixed(0)}€</p>
          </div>
        </div>
      </section>

      {/* Week Stats */}
      <section className="mb-12">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-4">Cette semaine</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-l border-t border-neutral-200">
          <div className="p-4 bg-white border-r border-b border-neutral-200 hover:border-neutral-400 transition-colors">
            <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">CA total</span>
            <p className="text-xl font-light tracking-tight text-neutral-900">{stats.week.revenue.toFixed(0)}€</p>
          </div>

          <div className="p-4 bg-white border-r border-b border-neutral-200 hover:border-neutral-400 transition-colors">
            <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">Panier moyen</span>
            <p className="text-xl font-light tracking-tight text-neutral-900">{stats.week.avgBasket.toFixed(0)}€</p>
          </div>

          <div className="p-4 bg-white border-r border-b border-neutral-200 hover:border-neutral-400 transition-colors">
            <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">Taux d&apos;upsell</span>
            <p className="text-xl font-light tracking-tight text-neutral-900">{stats.week.upsellRate.toFixed(1)}%</p>
          </div>

          <div className="p-4 bg-white border-r border-b border-neutral-200 hover:border-neutral-400 transition-colors">
            <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">No-shows</span>
            <p className="text-xl font-light tracking-tight text-amber-700">{stats.week.noShows}</p>
          </div>
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400">Queue / Planning</h2>
          <button className="text-[10px] uppercase font-bold text-neutral-900 border-b border-neutral-900 pb-0.5">Voir tout</button>
        </div>
        <div className="border border-neutral-200 bg-white overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
              <p className="text-[13px] text-neutral-500">Aucune réservation à venir</p>
              <p className="text-[11px] text-neutral-400 mt-1">Partagez votre page de réservation pour recevoir des clients</p>
            </div>
          ) : (
            <div>
              {bookings.map((booking) => (
                <div key={booking.id} className="group flex items-center justify-between py-3 px-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-neutral-800">{booking.client_name}</span>
                    <span className="text-[11px] text-neutral-400">{booking.services?.name || 'Service'}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <Clock size={12} />
                      <span className="text-[11px] tabular-nums">{booking.date} · {booking.time}</span>
                    </div>
                    <span className="text-[13px] font-medium text-neutral-900">{booking.total_price}€</span>
                    {booking.total_price > booking.base_price && (
                      <span className="px-2 py-0.5 text-[10px] font-medium border border-emerald-100 bg-emerald-50 text-emerald-700 tracking-tight">
                        +{(booking.total_price - booking.base_price).toFixed(0)}€
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
