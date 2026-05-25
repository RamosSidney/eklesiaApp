'use client'
import { useMembersSummary, useBirthdays, useMembers } from '@/hooks/useMembers'
import { FileText, BarChart3, Cake, Download } from 'lucide-react'

interface Summary {
  church_id: string
  total: number
  active: number
  visitors: number
  inactive: number
  in_discipleship: number
  new_this_month: number
}

function exportCSV(rows: any[], filename: string) {
  const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Batismo', 'Cadastrado em']
  const data = rows.map(m => [
    m.full_name, m.email ?? '', m.phone ?? '', m.status,
    m.baptism_date ?? '', m.created_at?.slice(0, 10) ?? ''
  ])
  const csv = [headers, ...data].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const { data: sumRaw } = useMembersSummary()
  const { data: bday   } = useBirthdays()
  const { data: all    } = useMembers({ limit: 9999 })

  const sum = sumRaw as Summary | undefined

  const reports = [
    {
      title:  'Lista de membros',
      desc:   'Todos os membros com dados de contato e status',
      icon:   FileText,
      color:  'bg-brand-50 text-brand-600',
      action: () => { const d = (all as any)?.data; if (d) exportCSV(d, `membros_${new Date().toISOString().slice(0,10)}.csv`) },
      label:  'Exportar CSV',
    },
    {
      title:  'Aniversariantes do mês',
      desc:   `${(bday as any[])?.length ?? 0} aniversariantes em ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())}`,
      icon:   Cake,
      color:  'bg-pink-50 text-pink-600',
      action: () => { const d = bday as any[]; if (d) exportCSV(d, 'aniversariantes.csv') },
      label:  'Exportar CSV',
    },
    {
      title:  'Resumo por status',
      desc:   'Ativos, visitantes, em discipulado e inativos',
      icon:   BarChart3,
      color:  'bg-green-50 text-green-600',
      action: () => {
        if (!sum) return
        const rows = [
          ['campo', 'valor'],
          ['total', sum.total],
          ['ativos', sum.active],
          ['visitantes', sum.visitors],
          ['inativos', sum.inactive],
          ['em_discipulado', sum.in_discipleship],
          ['novos_este_mes', sum.new_this_month],
        ]
        const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const a    = document.createElement('a')
        a.href = URL.createObjectURL(blob); a.download = 'resumo.csv'; a.click()
      },
      label:  'Exportar CSV',
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-medium">Relatórios</h1>
        <p className="text-sm text-stone-500 mt-0.5">Exporte dados da sua igreja</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {([
          ['Total',     sum?.total],
          ['Ativos',    sum?.active],
          ['Visitantes',sum?.visitors],
          ['Este mês',  sum?.new_this_month],
        ] as [string, number | undefined][]).map(([label, val]) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-2xl font-medium text-stone-900">{val ?? '—'}</div>
            <div className="text-xs text-stone-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

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
