'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Ministry } from '@/types'
import { Plus, Users, Building2, Edit } from 'lucide-react'
import { useState } from 'react'

function useMinistries() {
  return useQuery<Ministry[]>({
    queryKey: ['ministries'],
    queryFn:  () => api.get('/api/ministries'),
  })
}

function useCreateMinistry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Ministry>) => api.post<Ministry>('/api/ministries', data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['ministries'] }),
  })
}

export default function MinistriesPage() {
  const { data: ministries, isLoading } = useMinistries()
  const createMinistry = useCreateMinistry()
  const [showForm, setShowForm] = useState(false)
  const [name, setName]         = useState('')
  const [desc, setDesc]         = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createMinistry.mutateAsync({ name, description: desc })
    setName(''); setDesc(''); setShowForm(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Ministérios</h1>
          <p className="text-sm text-stone-500 mt-0.5">{ministries?.length ?? 0} ministérios cadastrados</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo ministério
        </button>
      </div>

      {/* Formulário inline */}
      {showForm && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-medium mb-4">Criar ministério</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Nome *</label>
              <input className="input" placeholder="Ex: Louvor, Jovens, Infantil..." value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Descrição</label>
              <input className="input" placeholder="Descrição opcional" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={createMinistry.isPending} className="btn-primary disabled:opacity-50">
                {createMinistry.isPending ? 'Salvando...' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {isLoading && <p className="text-center text-stone-400 py-12">Carregando...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ministries?.map(m => {
          const count = m.member_ministries?.[0]?.count ?? 0
          return (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <span className={`badge ${m.active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {m.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <h3 className="font-medium text-stone-900">{m.name}</h3>
              {m.description && (
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{m.description}</p>
              )}
              <div className="flex items-center gap-1 mt-3 text-xs text-stone-400">
                <Users className="w-3.5 h-3.5" />
                <span>{count} membros</span>
              </div>
              {m.leader && (
                <div className="mt-2 text-xs text-stone-500">
                  Líder: <span className="text-stone-700">{m.leader.full_name}</span>
                </div>
              )}
            </div>
          )
        })}
        {!isLoading && !ministries?.length && (
          <div className="col-span-3 text-center py-16 text-stone-400">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Nenhum ministério cadastrado ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}
