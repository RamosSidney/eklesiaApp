'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard, Users, UserPlus, Building2,
  CalendarDays, BarChart3, Settings, LogOut, Loader2
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',   label: 'Painel',        icon: LayoutDashboard },
  { href: '/members',     label: 'Membros',        icon: Users },
  { href: '/members/new', label: 'Novo membro',    icon: UserPlus },
  { href: '/ministries',  label: 'Ministérios',    icon: Building2 },
  { href: '/events',      label: 'Eventos',        icon: CalendarDays },
  { href: '/reports',     label: 'Relatórios',     icon: BarChart3 },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
      </div>
    )
  }
  if (!user) return null

  const churchName = (user as any).churches?.name ?? 'Minha Igreja'
  const initials   = (user.full_name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-stone-100 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-stone-100">
          <div className="text-base font-medium text-stone-900">✦ EklēsiaApp</div>
          <div className="text-xs text-stone-400 mt-0.5 truncate">{churchName}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wider px-3 py-2">
            Principal
          </div>
          {NAV.slice(0, 3).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname === href ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wider px-3 py-2 mt-2">
            Gestão
          </div>
          {NAV.slice(3).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname.startsWith(href) ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50">
            <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-800">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-900 truncate">{user.full_name ?? 'Usuário'}</p>
              <p className="text-[10px] text-stone-400">{user.role}</p>
            </div>
            <button onClick={logout} className="text-stone-400 hover:text-stone-700">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
