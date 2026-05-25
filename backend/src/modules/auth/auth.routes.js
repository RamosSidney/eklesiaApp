import { z } from 'zod'
import { supabase } from '../../shared/supabase.js'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
})

export async function authRoutes(app) {
  // POST /api/auth/login
  app.post('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: body.error.flatten() })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    body.data.email,
      password: body.data.password,
    })

    if (error || !data.user) {
      return reply.status(401).send({ error: 'Email ou senha incorretos' })
    }

    // Busca dados do usuário no banco
    const { data: userData } = await supabase
      .from('users')
      .select('id, role, church_id, full_name, churches(name)')
      .eq('id', data.user.id)
      .single()

    if (!userData) {
      return reply.status(403).send({ error: 'Usuário sem perfil configurado' })
    }

    const token = app.jwt.sign({
      sub:       userData.id,
      role:      userData.role,
      church_id: userData.church_id,
      name:      userData.full_name,
    }, { expiresIn: '8h' })

    return reply.send({
      token,
      user: {
        id:         userData.id,
        name:       userData.full_name,
        role:       userData.role,
        church_id:  userData.church_id,
        church_name: userData.churches?.name,
      },
    })
  })

  // POST /api/auth/refresh  (usa token Supabase diretamente)
  app.post('/refresh', { onRequest: [app.authenticate] }, async (request, reply) => {
    const user = request.user
    const token = app.jwt.sign({
      sub:       user.sub,
      role:      user.role,
      church_id: user.church_id,
      name:      user.name,
    }, { expiresIn: '8h' })
    return reply.send({ token })
  })

  // GET /api/auth/me
  app.get('/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { data } = await supabase
      .from('users')
      .select('id, role, church_id, full_name, churches(name, logo_url)')
      .eq('id', request.user.sub)
      .single()
    return reply.send(data)
  })
}
