import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { env } from '../config/env'

export default async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
}
