'use client'
import { useAuth } from '@/hooks/useAuth'
import { useMembersSummary, useBirthdays, useMembers } from '@/hooks/useMembers'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import { Users, UserCheck, Droplets, Building2, Cake } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export default function DashboardPage() {
  const { user }      = useAuth()
  const { data: sum } = useMembersSummary()
  const { data: bday } = useBirthdays()
  const { data: recent } = useMembers({ limit: 5, page: 1 })

  const stats = [
    { label: 'Total de membros',    value: sum?.total       ?? '—', icon: Users,      color: 'bg-brand-50  text-brand-600' },
    { label: 'Membros ativos',      value: sum?.active      ?? '—', icon: UserCheck,  color: 'bg-green-50  text-green-600' },
    { label: 'Batizados este ano',   value: '—',                     icon: Droplets,   color: 'bg-blue-50   text-blue-600' },
    { label: 'Ministérios ativos',  value: '—',                     icon: Building2,  color: 'bg-amber-50  text-amber-600' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-stone-900">
          Bom dia{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-medium text-stone-900">{value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Membros recentes */}
        <div className="card">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-medium">Membros recentes</h2>
            <Link href="/members" className="text-xs text-brand-600 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-stone-50">
            {recent?.data?.map(m => (
              <Link
                key={m.id}
                href={`/members/${m.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-700 flex-shrink-0">
                  {m.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-900 truncate">{m.full_name}</p>
                  <p className="text-xs text-stone-400">{m.phone ?? m.email ?? ''}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[m.status]}`}>
                  {STATUS_LABELS[m.status]}
                </span>
              </Link>
            ))}
            {!recent?.data?.length && (
              <p className="px-5 py-8 text-center text-sm text-stone-400">Nenhum membro ainda</p>
            )}
          </div>
        </div>

        {/* Aniversariantes */}
        <div className="card">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <Cake className="w-4 h-4 text-pink-500" />
            <h2 className="text-sm font-medium">Aniversariantes do mês</h2>
          </div>
          <div className="divide-y divide-stone-50">
            {bday?.slice(0, 6).map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-xs font-medium text-pink-700 flex-shrink-0">
                  {m.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-900 truncate">{m.full_name}</p>
                  <p className="text-xs text-stone-400">{m.phone ?? ''}</p>
                </div>
                <span className="text-xs font-medium text-pink-600">
                  {format(parseISO(m.birth_date), 'dd/MM')}
                </span>
              </div>
            ))}
            {!bday?.length && (
              <p className="px-5 py-8 text-center text-sm text-stone-400">
                Nenhum aniversariante este mês
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
