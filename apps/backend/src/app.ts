import Fastify from 'fastify'
import corsPlugin from './plugins/cors'
import rateLimitPlugin from './plugins/rate-limit'
import errorHandlerPlugin from './plugins/error-handler'
import authPlugin from './plugins/auth'
import healthRoutes from './routes/health'

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  await fastify.register(corsPlugin)
  await fastify.register(rateLimitPlugin)
  await fastify.register(errorHandlerPlugin)
  await fastify.register(authPlugin)
  await fastify.register(healthRoutes)

  return fastify
}
