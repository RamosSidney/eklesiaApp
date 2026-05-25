'use client'
import { useMember } from '@/hooks/useMembers'
import { STATUS_LABELS, STATUS_COLORS, type MemberStatus } from '@/types'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, Church } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="py-3 border-b border-stone-50 last:border-0">
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className="text-sm text-stone-900">{value}</p>
    </div>
  )
}

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const { data: member, isLoading } = useMember(params.id)

  if (isLoading) {
    return <div className="p-6 text-center text-stone-400">Carregando...</div>
  }
  if (!member) {
    return <div className="p-6 text-center text-stone-400">Membro não encontrado</div>
  }

  const initials = member.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/members" className="btn-secondary px-2 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-medium">Perfil do membro</h1>
        <div className="flex-1" />
        <Link href={`/members/${member.id}/edit`} className="btn-secondary">
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card lateral */}
        <div className="card p-5 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-xl font-medium text-brand-700 mb-3">
            {initials}
          </div>
          <h2 className="font-medium text-stone-900">{member.full_name}</h2>
          <span className={`badge mt-2 ${STATUS_COLORS[member.status as MemberStatus]}`}>
            {STATUS_LABELS[member.status as MemberStatus]}
          </span>
          <div className="w-full mt-4 space-y-2 text-left">
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-stone-600 hover:text-brand-600">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {member.phone}
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-stone-600 hover:text-brand-600 break-all">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                {member.email}
              </a>
            )}
            {member.address && (
              <p className="flex items-start gap-2 text-sm text-stone-600">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {member.address}
              </p>
            )}
          </div>
        </div>

        {/* Detalhes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados pessoais */}
          <div className="card p-5">
            <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Dados pessoais</h3>
            <Field label="Data de nascimento" value={member.birth_date ? format(parseISO(member.birth_date), "dd/MM/yyyy", { locale: ptBR }) : null} />
            <Field label="CPF" value={member.cpf} />
            <Field label="Estado civil" value={member.marital_status === 'single' ? 'Solteiro(a)' : member.marital_status === 'married' ? 'Casado(a)' : member.marital_status ?? null} />
            <Field label="Gênero" value={member.gender === 'male' ? 'Masculino' : member.gender === 'female' ? 'Feminino' : member.gender ?? null} />
          </div>

          {/* Dados eclesiásticos */}
          <div className="card p-5">
            <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Dados eclesiásticos</h3>
            <Field label="Data de batismo" value={member.baptism_date ? format(parseISO(member.baptism_date), "dd/MM/yyyy", { locale: ptBR }) : null} />
            <Field label="Igreja de origem" value={member.origin_church} />
            <Field label="Cadastrado em" value={format(parseISO(member.created_at), "dd/MM/yyyy", { locale: ptBR })} />
          </div>

          {/* Ministérios */}
          {member.member_ministries && member.member_ministries.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Ministérios</h3>
              <div className="flex flex-wrap gap-2">
                {member.member_ministries.map(mm => (
                  <span key={mm.id} className="badge bg-brand-50 text-brand-800">
                    {mm.ministries?.name} · {mm.role === 'leader' ? 'Líder' : mm.role === 'coordinator' ? 'Coord.' : 'Membro'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {member.notes && (
            <div className="card p-5">
              <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Observações</h3>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
