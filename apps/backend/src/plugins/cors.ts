import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { env } from '../config/env'

export default fp(async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
})
