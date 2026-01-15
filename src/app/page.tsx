import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, TrendingUp, Users, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="py-6 px-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">Plannero</span>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Essai gratuit
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            La plateforme de réservation pour les pros du nettoyage
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gérez vos réservations, boostez votre CA avec les upsells,
            et donnez une image pro à votre business.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Démarrer gratuitement
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Page de réservation pro</h3>
            <p className="text-gray-600">
              Une page personnalisée avec votre logo et vos couleurs.
              Partagez-la à vos clients.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upsells automatiques</h3>
            <p className="text-gray-600">
              Proposez des options additionnelles et augmentez
              votre panier moyen sans effort.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dashboard business</h3>
            <p className="text-gray-600">
              Voyez votre CA, vos réservations et vos stats
              en un coup d&apos;oeil.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          Plannero - La plateforme de réservation pour les pros du nettoyage
        </div>
      </footer>
    </div>
  )
}
