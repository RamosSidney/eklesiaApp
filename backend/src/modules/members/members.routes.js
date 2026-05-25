import { z } from 'zod'
import { supabase } from '../../shared/supabase.js'

const memberSchema = z.object({
  full_name:       z.string().min(2).max(200),
  email:           z.string().email().optional().or(z.literal('')),
  phone:           z.string().optional(),
  birth_date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  cpf:             z.string().optional(),
  marital_status:  z.enum(['single','married','divorced','widowed','separated']).optional(),
  gender:          z.enum(['male','female','other']).optional(),
  address:         z.string().optional(),
  status:          z.enum(['visitor','in_discipleship','active','inactive','transferred','deceased']).default('visitor'),
  baptism_date:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  origin_church:   z.string().optional(),
  conversion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes:           z.string().optional(),
})

export async function membersRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  // GET /api/members?search=&status=&ministry_id=&page=1&limit=20
  app.get('/', auth, async (request, reply) => {
    const { church_id } = request.user
    const { search, status, ministry_id, page = 1, limit = 20 } = request.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('members')
      .select(`
        id, full_name, email, phone, birth_date, status, photo_url, created_at,
        member_ministries(ministry_id, role, ministries(name))
      `, { count: 'exact' })
      .eq('church_id', church_id)
      .order('full_name')
      .range(offset, offset + Number(limit) - 1)

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (ministry_id) {
      query = query.eq('member_ministries.ministry_id', ministry_id)
    }

    const { data, error, count } = await query
    if (error) return reply.status(500).send({ error: error.message })

    return reply.send({
      data,
      meta: { total: count, page: Number(page), limit: Number(limit), pages: Math.ceil(count / limit) },
    })
  })

  // GET /api/members/birthdays — aniversariantes do mês
  app.get('/birthdays', auth, async (request, reply) => {
    const { church_id } = request.user
    const { data, error } = await supabase
      .from('v_birthday_this_month')
      .select('*')
      .eq('church_name', church_id) // view filtra por church indiretamente
      .order('birth_day')
    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // GET /api/members/summary
  app.get('/summary', auth, async (request, reply) => {
    const { church_id } = request.user
    const { data, error } = await supabase
      .from('v_members_summary')
      .select('*')
      .eq('church_id', church_id)
      .single()
    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // GET /api/members/:id
  app.get('/:id', auth, async (request, reply) => {
    const { church_id } = request.user
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        member_ministries(
          id, role, joined_at, left_at,
          ministries(id, name)
        )
      `)
      .eq('id', request.params.id)
      .eq('church_id', church_id)
      .single()

    if (error || !data) return reply.status(404).send({ error: 'Membro não encontrado' })
    return reply.send(data)
  })

  // POST /api/members
  app.post('/', auth, async (request, reply) => {
    const { role, church_id, sub } = request.user
    if (!['super_admin','admin','pastor','secretary'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão para cadastrar membros' })
    }

    const body = memberSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: body.error.flatten() })
    }

    const { data, error } = await supabase
      .from('members')
      .insert({ ...body.data, church_id, created_by: sub })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // PATCH /api/members/:id
  app.patch('/:id', auth, async (request, reply) => {
    const { role, church_id } = request.user
    if (!['super_admin','admin','pastor','secretary'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão' })
    }

    const body = memberSchema.partial().safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: body.error.flatten() })
    }

    const { data, error } = await supabase
      .from('members')
      .update(body.data)
      .eq('id', request.params.id)
      .eq('church_id', church_id)
      .select()
      .single()

    if (error || !data) return reply.status(404).send({ error: 'Membro não encontrado' })
    return reply.send(data)
  })

  // DELETE /api/members/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { role, church_id } = request.user
    if (!['super_admin','admin'].includes(role)) {
      return reply.status(403).send({ error: 'Apenas administradores podem excluir membros' })
    }

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', request.params.id)
      .eq('church_id', church_id)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(204).send()
  })

  // POST /api/members/:id/ministry — vincular a ministério
  app.post('/:id/ministry', auth, async (request, reply) => {
    const { role, church_id } = request.user
    if (!['super_admin','admin','pastor','leader'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão' })
    }

    const schema = z.object({
      ministry_id: z.string().uuid(),
      role:        z.enum(['member','leader','coordinator']).default('member'),
    })
    const body = schema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Dados inválidos' })

    // Confirma que o ministério pertence à mesma igreja
    const { data: ministry } = await supabase
      .from('ministries')
      .select('id')
      .eq('id', body.data.ministry_id)
      .eq('church_id', church_id)
      .single()

    if (!ministry) return reply.status(404).send({ error: 'Ministério não encontrado' })

    const { data, error } = await supabase
      .from('member_ministries')
      .upsert({
        member_id:   request.params.id,
        ministry_id: body.data.ministry_id,
        role:        body.data.role,
      }, { onConflict: 'member_id,ministry_id' })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })
}
