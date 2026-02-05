'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Package, Settings, LogOut, Link as LinkIcon, FolderOpen, Users, Rocket } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/categories', label: 'Categories', icon: FolderOpen },
  { href: '/dashboard/services', label: 'Prestations', icon: Package },
  { href: '/dashboard/crm', label: 'Clients', icon: Users },
  { href: '/dashboard/booking-page', label: 'Page de reservation', icon: LinkIcon },
  { href: '/dashboard/settings', label: 'Parametres', icon: Settings },
]

interface DashboardNavProps {
  userEmail: string
  showOnboarding?: boolean
}

export function DashboardNav({ userEmail, showOnboarding }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isOnboardingActive = pathname === '/dashboard/onboarding'

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-neutral-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rotate-45" />
            </div>
            <span className="text-[13px] font-bold tracking-tight uppercase">Plannero</span>
          </Link>

          <div className="hidden md:flex gap-6">
            {/* Onboarding link - shown first when incomplete */}
            {showOnboarding && (
              <Link
                href="/dashboard/onboarding"
                className={`flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold transition-colors ${
                  isOnboardingActive
                    ? 'text-neutral-900'
                    : 'text-neutral-900 border-b border-neutral-900 pb-0.5'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                Demarrage
              </Link>
            )}
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] uppercase tracking-widest font-semibold transition-colors ${
                    isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] text-neutral-400 hidden sm:block">{userEmail}</span>
          <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}
