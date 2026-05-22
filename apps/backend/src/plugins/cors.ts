import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { env } from '../config/env'

const allowedOrigins: (string | RegExp)[] = [
  env.FRONTEND_URL,
  'https://thia.cm',
  /https:\/\/.*\.vercel\.app$/,
]

export default fp(async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin),
      )
      cb(null, allowed)
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
})
