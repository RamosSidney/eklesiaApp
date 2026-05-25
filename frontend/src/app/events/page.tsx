'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Event } from '@/types'
import { EVENT_TYPE_LABELS } from '@/types'
import { Plus, CalendarDays, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function useEvents() {
  return useQuery<{ data: Event[] }>({
    queryKey: ['events'],
    queryFn:  () => api.get('/api/events?upcoming=true&limit=20'),
  })
}

function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Event>) => api.post<Event>('/api/events', data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

const TYPE_COLORS: Record<Event['type'], string> = {
  service:  'bg-brand-50  text-brand-700',
  baptism:  'bg-blue-50   text-blue-700',
  retreat:  'bg-green-50  text-green-700',
  cell:     'bg-amber-50  text-amber-700',
  wedding:  'bg-pink-50   text-pink-700',
  other:    'bg-stone-100 text-stone-600',
}

export default function EventsPage() {
  const { data, isLoading } = useEvents()
  const createEvent = useCreateEvent()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'service', starts_at: '', location: '' })

  const set = (f: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [f]: e.target.value }))

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createEvent.mutateAsync(form as any)
    setForm({ title: '', type: 'service', starts_at: '', location: '' })
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Eventos</h1>
          <p className="text-sm text-stone-500 mt-0.5">Próximos eventos da igreja</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Criar evento
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-medium mb-4">Novo evento</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Título *</label>
              <input className="input" placeholder="Ex: Culto de domingo" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={set('type')}>
                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Data e hora *</label>
              <input type="datetime-local" className="input" value={form.starts_at} onChange={set('starts_at')} required />
            </div>
            <div className="col-span-2">
              <label className="label">Local</label>
              <input className="input" placeholder="Templo central, Salão..." value={form.location} onChange={set('location')} />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={createEvent.isPending} className="btn-primary disabled:opacity-50">
                {createEvent.isPending ? 'Salvando...' : 'Criar evento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <p className="text-center text-stone-400 py-12">Carregando...</p>}

      <div className="space-y-3">
        {data?.data?.map(ev => (
          <div key={ev.id} className="card p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-stone-100 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-stone-600">
                {format(parseISO(ev.starts_at), 'dd', { locale: ptBR })}
              </span>
              <span className="text-xs text-stone-400 uppercase">
                {format(parseISO(ev.starts_at), 'MMM', { locale: ptBR })}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-stone-900">{ev.title}</h3>
                <span className={`badge flex-shrink-0 ${TYPE_COLORS[ev.type]}`}>
                  {EVENT_TYPE_LABELS[ev.type]}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  {format(parseISO(ev.starts_at), "HH:mm", { locale: ptBR })}
                </span>
                {ev.location && (
                  <span className="flex items-center gap-1 text-xs text-stone-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {ev.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !data?.data?.length && (
          <div className="text-center py-16 text-stone-400">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Nenhum evento próximo</p>
          </div>
        )}
      </div>
    </div>
  )
}
