import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
  })

  // Override rate limit for all /auth/* routes
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url.startsWith('/auth')) {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      }
    }
  })
})
