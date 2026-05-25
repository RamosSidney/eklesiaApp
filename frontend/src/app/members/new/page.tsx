'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateMember } from '@/hooks/useMembers'
import type { MemberStatus } from '@/types'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewMemberPage() {
  const router       = useRouter()
  const createMember = useCreateMember()

  const [form, setForm] = useState({
    full_name:      '',
    email:          '',
    phone:          '',
    birth_date:     '',
    cpf:            '',
    marital_status: '',
    gender:         '',
    address:        '',
    status:         'visitor' as MemberStatus,
    baptism_date:   '',
    origin_church:  '',
    notes:          '',
  })
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const payload: Record<string, string | undefined> = { ...form }
      // Limpa campos vazios opcionais
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k] })
      await createMember.mutateAsync(payload as any)
      router.push('/members')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/members" className="btn-secondary px-2 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-medium">Novo membro</h1>
          <p className="text-sm text-stone-500">Preencha os dados do novo membro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dados pessoais */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Dados pessoais</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome completo *</label>
              <input className="input" placeholder="Nome Sobrenome" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div>
              <label className="label">Data de nascimento</label>
              <input type="date" className="input" value={form.birth_date} onChange={set('birth_date')} />
            </div>
            <div>
              <label className="label">CPF</label>
              <input className="input" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} />
            </div>
            <div>
              <label className="label">Estado civil</label>
              <select className="input" value={form.marital_status} onChange={set('marital_status')}>
                <option value="">Selecione...</option>
                <option value="single">Solteiro(a)</option>
                <option value="married">Casado(a)</option>
                <option value="divorced">Divorciado(a)</option>
                <option value="widowed">Viúvo(a)</option>
                <option value="separated">Separado(a)</option>
              </select>
            </div>
            <div>
              <label className="label">Gênero</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option value="">Selecione...</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Contato</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="email@exemplo.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Telefone / WhatsApp</label>
              <input type="tel" className="input" placeholder="(11) 99999-0000" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="col-span-2">
              <label className="label">Endereço</label>
              <input className="input" placeholder="Rua, número, bairro, cidade — UF" value={form.address} onChange={set('address')} />
            </div>
          </div>
        </div>

        {/* Dados eclesiásticos */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Dados eclesiásticos</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status *</label>
              <select className="input" value={form.status} onChange={set('status')} required>
                <option value="visitor">Visitante</option>
                <option value="in_discipleship">Em discipulado</option>
                <option value="active">Membro ativo</option>
                <option value="inactive">Membro inativo</option>
                <option value="transferred">Transferido</option>
              </select>
            </div>
            <div>
              <label className="label">Data de batismo</label>
              <input type="date" className="input" value={form.baptism_date} onChange={set('baptism_date')} />
            </div>
            <div className="col-span-2">
              <label className="label">Igreja de origem</label>
              <input className="input" placeholder="Nome da igreja anterior" value={form.origin_church} onChange={set('origin_church')} />
            </div>
            <div className="col-span-2">
              <label className="label">Observações</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Informações adicionais..."
                value={form.notes}
                onChange={set('notes')}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/members" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={createMember.isPending} className="btn-primary disabled:opacity-50">
            <Save className="w-4 h-4" />
            {createMember.isPending ? 'Salvando...' : 'Salvar membro'}
          </button>
        </div>
      </form>
    </div>
  )
}
