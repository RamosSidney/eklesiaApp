'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useMembers, useDeleteMember } from '@/hooks/useMembers'
import { STATUS_LABELS, STATUS_COLORS, type MemberStatus } from '@/types'
import { Search, Plus, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '',               label: 'Todos os status' },
  { value: 'active',         label: 'Ativo' },
  { value: 'visitor',        label: 'Visitante' },
  { value: 'in_discipleship',label: 'Em discipulado' },
  { value: 'inactive',       label: 'Inativo' },
]

export default function MembersPage() {
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('')
  const [page,    setPage]    = useState(1)

  const { data, isLoading } = useMembers({ search, status, page, limit: 20 })
  const deleteMember        = useDeleteMember()

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return
    deleteMember.mutate(id)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-stone-900">Membros</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {(data as any)?.meta?.total ?? 0} membros cadastrados
          </p>
        </div>
        <Link href="/members/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo membro
        </Link>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="flex gap-3 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input w-48"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-stone-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Contato</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Cadastrado em</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-400">Carregando...</td></tr>
              )}
              {!isLoading && !data?.data.length && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-400">Nenhum membro encontrado</td></tr>
              )}
              {data?.data.map(m => (
                <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-700 flex-shrink-0">
                        {m.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-stone-900">{m.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    <div>{m.phone ?? '—'}</div>
                    <div className="text-xs">{m.email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[m.status as MemberStatus]}`}>
                      {STATUS_LABELS[m.status as MemberStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {format(parseISO(m.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/members/${m.id}`}
                        className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(m.id, m.full_name)}
                        className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {data && data.meta.pages > 1 && (
          <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-400">
              Página {data.meta.page} de {data.meta.pages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-2 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))}
                disabled={page === data.meta.pages}
                className="btn-secondary px-2 py-1.5 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
