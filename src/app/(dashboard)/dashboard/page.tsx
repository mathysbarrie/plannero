import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react'
import type { Business, Booking } from '@/types/database.types'

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
    return (
      <div className="p-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Bienvenue sur Plannero</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Votre espace business n&apos;est pas encore configuré.
              Commencez par créer votre profil business.
            </p>
            <a
              href="/dashboard/settings"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Configurer mon business
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = await getDashboardStats(business.id)
  const bookings = await getUpcomingBookings(business.id)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
      </div>

      {/* Today Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Aujourd&apos;hui</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Interventions</p>
                  <p className="text-2xl font-bold">{stats.today.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">CA du jour</p>
                  <p className="text-2xl font-bold">{stats.today.revenue.toFixed(0)}€</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upsells</p>
                  <p className="text-2xl font-bold">+{stats.today.upsells.toFixed(0)}€</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Week Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Cette semaine</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">CA total</p>
              <p className="text-2xl font-bold">{stats.week.revenue.toFixed(0)}€</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Panier moyen</p>
              <p className="text-2xl font-bold">{stats.week.avgBasket.toFixed(0)}€</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Taux d&apos;upsell</p>
              <p className="text-2xl font-bold">{stats.week.upsellRate.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">No-shows</p>
              <p className="text-2xl font-bold text-red-500">{stats.week.noShows}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Planning business</h2>
        <Card>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune réservation à venir</p>
                <p className="text-sm">Partagez votre page de réservation pour recevoir des clients</p>
              </div>
            ) : (
              <div className="divide-y">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                        <p className="text-xs text-gray-500">{booking.time}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.client_name}</p>
                        <p className="text-sm text-gray-500">
                          {booking.services?.name || 'Service'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{booking.total_price}€</p>
                      {booking.total_price > booking.base_price && (
                        <p className="text-xs text-green-600">
                          +{(booking.total_price - booking.base_price).toFixed(0)}€ options
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
