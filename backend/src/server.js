import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

import { authRoutes } from './modules/auth/auth.routes.js'
import { membersRoutes } from './modules/members/members.routes.js'
import { ministriesRoutes } from './modules/ministries/ministries.routes.js'
import { eventsRoutes } from './modules/events/events.routes.js'

const app = Fastify({ logger: process.env.NODE_ENV !== 'test' })

// ── Plugins ────────────────────────────────────────────────
await app.register(helmet, { contentSecurityPolicy: false })
await app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
})
await app.register(jwt, { secret: process.env.JWT_SECRET })
await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })

// ── Decorator: autenticação ────────────────────────────────
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
})

// ── Rotas ──────────────────────────────────────────────────
app.register(authRoutes,       { prefix: '/api/auth' })
app.register(membersRoutes,    { prefix: '/api/members' })
app.register(ministriesRoutes, { prefix: '/api/ministries' })
app.register(eventsRoutes,     { prefix: '/api/events' })

app.get('/health', () => ({ status: 'ok', ts: new Date().toISOString() }))

// ── Start ──────────────────────────────────────────────────
const port = parseInt(process.env.PORT ?? '3001')
try {
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`✦ EklēsiaApp API rodando em http://localhost:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
