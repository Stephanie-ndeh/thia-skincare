import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'

export default async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
  })
}
