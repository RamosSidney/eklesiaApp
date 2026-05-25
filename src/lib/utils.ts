import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null, pattern = 'dd/MM/yyyy'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

export function formatPhone(phone: string | null): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  }
  return phone
}

export function formatCPF(cpf: string | null): string {
  if (!cpf) return '—'
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export const STATUS_LABELS: Record<string, string> = {
  visitor:        'Visitante',
  in_discipleship:'Em discipulado',
  active:         'Ativo',
  inactive:       'Inativo',
  transferred:    'Transferido',
  deceased:       'Falecido',
}

export const STATUS_BADGE: Record<string, string> = {
  visitor:         'badge-visitor',
  in_discipleship: 'badge-disciple',
  active:          'badge-active',
  inactive:        'badge-inactive',
  transferred:     'badge-inactive',
  deceased:        'badge-inactive',
}

export const MARITAL_LABELS: Record<string, string> = {
  single:    'Solteiro(a)',
  married:   'Casado(a)',
  divorced:  'Divorciado(a)',
  widowed:   'Viúvo(a)',
  separated: 'Separado(a)',
}
