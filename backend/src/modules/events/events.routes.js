import { z } from 'zod'
import { supabase } from '../../shared/supabase.js'

// Flexibilizando o esquema para aceitar strings normais de data e hora
const eventSchema = z.object({
  title:       z.string().min(2).max(200),
  type:        z.enum(['service','baptism','retreat','cell','wedding','other']).default('service'),
  description: z.string().optional(),
  starts_at:   z.string(), // 👈 Retiramos o .datetime() restrito aqui
  ends_at:     z.string().optional().nullable(), // 👈 E aqui
  location:    z.string().optional(),
})

export async function eventsRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  // GET /api/events?upcoming=true&limit=10
  app.get('/', auth, async (request, reply) => {
    const { church_id } = request.user
    const { upcoming, limit = 20, page = 1 } = request.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('church_id', church_id)
      .order('starts_at', { ascending: upcoming === 'true' })
      .range(offset, offset + Number(limit) - 1)

    if (upcoming === 'true') {
      query = query.gte('starts_at', new Date().toISOString())
    }

    const { data, error, count } = await query
    if (error) return reply.status(500).send({ error: error.message })
    return reply.send({ data, meta: { total: count, page: Number(page), limit: Number(limit) } })
  })

  // GET /api/events/:id
  app.get('/:id', auth, async (request, reply) => {
    const { church_id } = request.user
    const { data, error } = await supabase
      .from('events')
      .select(`*, event_attendances(count)`)
      .eq('id', request.params.id)
      .eq('church_id', church_id)
      .single()

    if (error || !data) return reply.status(404).send({ error: 'Evento não encontrado' })
    return reply.send(data)
  })

  // POST /api/events
  app.post('/', auth, async (request, reply) => {
    const { role, church_id, sub } = request.user
    if (!['super_admin','admin','pastor','secretary'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão para criar eventos' })
    }

    const body = eventSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Dados inválidos', details: body.error.flatten() })

    const { data, error } = await supabase
      .from('events')
      .insert({ ...body.data, church_id, created_by: sub })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // PATCH /api/events/:id
  app.patch('/:id', auth, async (request, reply) => {
    const { role, church_id } = request.user
    if (!['super_admin','admin','pastor','secretary'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão' })
    }

    const body = eventSchema.partial().safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Dados inválidos' })

    const { data, error } = await supabase
      .from('events')
      .update(body.data)
      .eq('id', request.params.id)
      .eq('church_id', church_id)
      .select()
      .single()

    if (error || !data) return reply.status(404).send({ error: 'Evento não encontrado' })
    return reply.send(data)
  })

  // DELETE /api/events/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { role, church_id } = request.user
    if (!['super_admin','admin','pastor'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão' })
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', request.params.id)
      .eq('church_id', church_id)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(204).send()
  })

  // POST /api/events/:id/attendance — registrar presença
  app.post('/:id/attendance', auth, async (request, reply) => {
    const { role } = request.user
    if (!['super_admin','admin','pastor','leader','secretary'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão' })
    }

    const schema = z.object({
      member_id: z.string().uuid(),
      present:   z.boolean().default(true),
    })
    const body = schema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Dados inválidos' })

    const { data, error } = await supabase
      .from('event_attendances')
      .upsert({
        event_id:    request.params.id,
        member_id:   body.data.member_id,
        present:     body.data.present,
        recorded_by: request.user.sub,
      }, { onConflict: 'event_id,member_id' })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // GET /api/events/:id/attendance
  app.get('/:id/attendance', auth, async (request, reply) => {
    const { data, error } = await supabase
      .from('event_attendances')
      .select(`
        id, present, recorded_at,
        member:member_id(id, full_name, photo_url)
      `)
      .eq('event_id', request.params.id)
      .order('present', { ascending: false })

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })
}
