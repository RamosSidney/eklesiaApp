import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co'
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Auth ──────────────────────────────────────────────────────
export const signIn  = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

// ── Members ───────────────────────────────────────────────────
export const getMembers = async ({ churchId, search = '', status = '', page = 1, perPage = 20 }) => {
  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .eq('church_id', churchId)
    .order('full_name')
    .range((page - 1) * perPage, page * perPage - 1)

  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('full_name', `%${search}%`)

  return query
}

export const getMemberById = (id) =>
  supabase.from('members').select('*, member_ministries(*, ministries(*))').eq('id', id).single()

export const createMember = (data) =>
  supabase.from('members').insert(data).select().single()

export const updateMember = (id, data) =>
  supabase.from('members').update(data).eq('id', id).select().single()

export const deleteMember = (id) =>
  supabase.from('members').delete().eq('id', id)

// ── Ministries ────────────────────────────────────────────────
export const getMinistries = (churchId) =>
  supabase.from('ministries').select('*, members(id, full_name)').eq('church_id', churchId).order('name')

export const createMinistry = (data) =>
  supabase.from('ministries').insert(data).select().single()

export const updateMinistry = (id, data) =>
  supabase.from('ministries').update(data).eq('id', id).select().single()

// ── Events ────────────────────────────────────────────────────
export const getEvents = (churchId) =>
  supabase.from('events').select('*').eq('church_id', churchId).order('starts_at', { ascending: false })

export const createEvent = (data) =>
  supabase.from('events').insert(data).select().single()

// ── Dashboard ─────────────────────────────────────────────────
export const getDashboardStats = async (churchId) => {
  const [membersRes, ministriesRes, eventsRes, birthdaysRes] = await Promise.all([
    supabase.from('members').select('status', { count: 'exact' }).eq('church_id', churchId),
    supabase.from('ministries').select('id', { count: 'exact' }).eq('church_id', churchId).eq('active', true),
    supabase.from('events').select('id', { count: 'exact' }).eq('church_id', churchId),
    supabase.from('v_birthday_this_month').select('*').eq('church_id', churchId).limit(10),
  ])
  return {
    members:    membersRes.data || [],
    totalMembers: membersRes.count || 0,
    totalMinistries: ministriesRes.count || 0,
    totalEvents: eventsRes.count || 0,
    birthdays:  birthdaysRes.data || [],
  }
}
