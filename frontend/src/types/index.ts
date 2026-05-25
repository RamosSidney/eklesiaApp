export type MemberStatus =
  | 'visitor'
  | 'in_discipleship'
  | 'active'
  | 'inactive'
  | 'transferred'
  | 'deceased'

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'pastor'
  | 'leader'
  | 'secretary'
  | 'viewer'

export interface Member {
  id: string
  church_id: string
  full_name: string
  email?: string
  phone?: string
  birth_date?: string
  cpf?: string
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated'
  gender?: 'male' | 'female' | 'other'
  address?: string
  photo_url?: string
  status: MemberStatus
  baptism_date?: string
  origin_church?: string
  conversion_date?: string
  notes?: string
  created_at: string
  updated_at: string
  member_ministries?: MemberMinistry[]
}

export interface Ministry {
  id: string
  church_id: string
  name: string
  description?: string
  leader_id?: string
  leader?: Pick<Member, 'id' | 'full_name' | 'photo_url'>
  active: boolean
  created_at: string
  member_ministries?: { count: number }[]
}

export interface MemberMinistry {
  id: string
  member_id: string
  ministry_id: string
  role: 'member' | 'leader' | 'coordinator'
  joined_at: string
  left_at?: string
  ministries?: Pick<Ministry, 'id' | 'name'>
  member?: Pick<Member, 'id' | 'full_name' | 'photo_url' | 'status'>
}

export interface Event {
  id: string
  church_id: string
  title: string
  type: 'service' | 'baptism' | 'retreat' | 'cell' | 'wedding' | 'other'
  description?: string
  starts_at: string
  ends_at?: string
  location?: string
  created_at: string
}

export interface User {
  id: string
  church_id: string
  full_name?: string
  role: UserRole
  churches?: { name: string; logo_url?: string }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; pages: number }
}

export const STATUS_LABELS: Record<MemberStatus, string> = {
  visitor:         'Visitante',
  in_discipleship: 'Em discipulado',
  active:          'Ativo',
  inactive:        'Inativo',
  transferred:     'Transferido',
  deceased:        'Falecido',
}

export const STATUS_COLORS: Record<MemberStatus, string> = {
  visitor:         'bg-amber-100 text-amber-800',
  in_discipleship: 'bg-blue-100 text-blue-800',
  active:          'bg-green-100 text-green-800',
  inactive:        'bg-gray-100 text-gray-600',
  transferred:     'bg-purple-100 text-purple-800',
  deceased:        'bg-red-100 text-red-800',
}

export const EVENT_TYPE_LABELS: Record<Event['type'], string> = {
  service:  'Culto',
  baptism:  'Batismo',
  retreat:  'Retiro',
  cell:     'Célula',
  wedding:  'Casamento',
  other:    'Outro',
}
