import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import { ZodError } from 'zod'
import corsPlugin from './plugins/cors'
import rateLimitPlugin from './plugins/rate-limit'
import errorHandlerPlugin, { AppError } from './plugins/error-handler'
import authPlugin from './plugins/auth'
import healthRoutes from './routes/health'
import categoriesRoutes from './routes/categories/index'
import productsRoutes from './routes/products/index'
import searchRoutes from './routes/search/index'
import testimonialsRoutes from './routes/testimonials/index'
import shippingRoutes from './routes/shipping/index'
import ordersRoutes from './routes/orders/index'
import discountCodesRoutes from './routes/discount-codes/index'
import paymentsRoutes from './routes/payments/index'
import paymentsWebhookRoutes from './routes/payments/webhook'
import reviewsRoutes from './routes/reviews/index'
import wishlistRoutes from './routes/wishlist/index'
import profileRoutes from './routes/profile/index'
import addressesRoutes from './routes/addresses/index'
import adminRoutes from './routes/admin/index'
import adminProductsRoutes from './routes/admin/products'
import adminOrdersRoutes from './routes/admin/orders'
import adminReviewsRoutes from './routes/admin/reviews'
import adminTestimonialsRoutes from './routes/admin/testimonials'
import adminDiscountCodesRoutes from './routes/admin/discount-codes'
import contactRoutes from './routes/contact/index'

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, details: error.details ?? [] },
      })
    }
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        },
      })
    }
    fastify.log.error(error)
    return reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: [] },
    })
  })

  await fastify.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })
  await fastify.register(corsPlugin)
  await fastify.register(rateLimitPlugin)
  await fastify.register(errorHandlerPlugin)
  await fastify.register(authPlugin)
  await fastify.register(healthRoutes)
  await fastify.register(categoriesRoutes)
  await fastify.register(productsRoutes)
  await fastify.register(searchRoutes)
  await fastify.register(testimonialsRoutes)
  await fastify.register(shippingRoutes)
  await fastify.register(ordersRoutes)
  await fastify.register(discountCodesRoutes)
  await fastify.register(paymentsRoutes)
  await fastify.register(paymentsWebhookRoutes)
  await fastify.register(reviewsRoutes)
  await fastify.register(wishlistRoutes)
  await fastify.register(profileRoutes)
  await fastify.register(addressesRoutes)
  await fastify.register(adminRoutes, { prefix: '/admin' })
  await fastify.register(adminProductsRoutes, { prefix: '/admin' })
  await fastify.register(adminOrdersRoutes, { prefix: '/admin' })
  await fastify.register(adminReviewsRoutes, { prefix: '/admin' })
  await fastify.register(adminTestimonialsRoutes, { prefix: '/admin' })
  await fastify.register(adminDiscountCodesRoutes, { prefix: '/admin' })
  await fastify.register(contactRoutes)

  return fastify
}
