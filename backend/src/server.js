import 'dotenv/config'
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

// — Plugins
await app.register(helmet, { contentSecurityPolicy: false })
await app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
})
await app.register(jwt, { secret: process.env.JWT_SECRET })
await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })

// — Decorator: autenticação
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
})

// — Registro das Rotas com Prefixos
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(membersRoutes, { prefix: '/api/members' })
await app.register(ministriesRoutes, { prefix: '/api/ministries' })
await app.register(eventsRoutes, { prefix: '/api/events' })

// 👇 ADICIONE ESSA ROTA AQUI (Fora de qualquer prefixo)
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// — Inicialização do Servidor (Configuração para o Railway e Local)
const port = parseInt(process.env.PORT ?? '3001')
try {
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`✦ EklēsiaApp API rodando em http://localhost:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}