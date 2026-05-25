import { z } from 'zod'
import { supabase } from '../../shared/supabase.js'

const ministrySchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().optional(),
  leader_id:   z.string().uuid().optional().nullable(),
  active:      z.boolean().default(true),
})

export async function ministriesRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  // GET /api/ministries
  app.get('/', auth, async (request, reply) => {
    const { church_id } = request.user
    const { data, error } = await supabase
      .from('ministries')
      .select(`
        id, name, description, active, created_at,
        leader:leader_id(id, full_name, photo_url),
        member_ministries(count)
      `)
      .eq('church_id', church_id)
      .order('name')

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // GET /api/ministries/:id/members
  app.get('/:id/members', auth, async (request, reply) => {
    const { church_id } = request.user
    const { data, error } = await supabase
      .from('member_ministries')
      .select(`
        id, role, joined_at,
        member:member_id(id, full_name, email, phone, photo_url, status)
      `)
      .eq('ministry_id', request.params.id)
      .is('left_at', null)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // POST /api/ministries
  app.post('/', auth, async (request, reply) => {
    const { role, church_id, sub } = request.user
    if (!['super_admin','admin','pastor'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão para criar ministérios' })
    }

    const body = ministrySchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Dados inválidos', details: body.error.flatten() })

    const { data, error } = await supabase
      .from('ministries')
      .insert({ ...body.data, church_id })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // PATCH /api/ministries/:id
  app.patch('/:id', auth, async (request, reply) => {
    const { role, church_id } = request.user
    if (!['super_admin','admin','pastor','leader'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão' })
    }

    const body = ministrySchema.partial().safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Dados inválidos' })

    const { data, error } = await supabase
      .from('ministries')
      .update(body.data)
      .eq('id', request.params.id)
      .eq('church_id', church_id)
      .select()
      .single()

    if (error || !data) return reply.status(404).send({ error: 'Ministério não encontrado' })
    return reply.send(data)
  })

  // DELETE /api/ministries/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { role, church_id } = request.user
    if (!['super_admin','admin'].includes(role)) {
      return reply.status(403).send({ error: 'Sem permissão' })
    }

    const { error } = await supabase
      .from('ministries')
      .delete()
      .eq('id', request.params.id)
      .eq('church_id', church_id)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(204).send()
  })
}
