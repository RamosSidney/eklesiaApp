'use client'
import { useMembersSummary, useBirthdays, useMembers } from '@/hooks/useMembers'
import { FileText, Table, Cake, BarChart3, Download } from 'lucide-react'

function exportCSV(members: any[]) {
  const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Batismo', 'Cadastrado em']
  const rows = members.map(m => [
    m.full_name, m.email ?? '', m.phone ?? '', m.status,
    m.baptism_date ?? '', m.created_at?.slice(0, 10) ?? ''
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `membros_${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const { data: sum  } = useMembersSummary()
  const { data: bday } = useBirthdays()
  const { data: all  } = useMembers({ limit: 9999 })

  const reports = [
    {
      title: 'Lista de membros',
      desc:  'Todos os membros com dados de contato e status',
      icon:  FileText,
      color: 'bg-brand-50 text-brand-600',
      action: () => all?.data && exportCSV(all.data),
      label: 'Exportar CSV',
    },
    {
      title: 'Aniversariantes do mês',
      desc:  `${bday?.length ?? 0} aniversariantes em ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())}`,
      icon:  Cake,
      color: 'bg-pink-50 text-pink-600',
      action: () => bday && exportCSV(bday),
      label: 'Exportar CSV',
    },
    {
      title: 'Resumo por status',
      desc:  'Ativos, visitantes, em discipulado e inativos',
      icon:  BarChart3,
      color: 'bg-green-50 text-green-600',
      action: () => {
        if (!sum) return
        const csv = Object.entries(sum as any)
          .filter(([k]) => k !== 'church_id')
          .map(([k, v]) => `"${k}","${v}"`)
          .join('\n')
        const blob = new Blob([`"campo","valor"\n${csv}`], { type: 'text/csv' })
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
        a.download = 'resumo.csv'; a.click()
      },
      label: 'Exportar CSV',
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-medium">Relatórios</h1>
        <p className="text-sm text-stone-500 mt-0.5">Exporte dados da sua igreja</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          ['Total', sum?.total],
          ['Ativos', sum?.active],
          ['Visitantes', sum?.visitors],
          ['Este mês', sum?.new_this_month],
        ].map(([label, val]) => (
          <div key={label as string} className="card p-4 text-center">
            <div className="text-2xl font-medium text-stone-900">{val ?? '—'}</div>
            <div className="text-xs text-stone-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Relatórios */}
      <div className="grid gap-3">
        {reports.map(({ title, desc, icon: Icon, color, action, label }) => (
          <div key={title} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-stone-900">{title}</h3>
              <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
            </div>
            <button onClick={action} className="btn-secondary flex-shrink-0">
              <Download className="w-3.5 h-3.5" />
              {label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
