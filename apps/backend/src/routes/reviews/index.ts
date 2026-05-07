import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import type { CreateReviewRequest } from '@thia/shared'

const createReviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(20),
}) satisfies z.ZodType<CreateReviewRequest>

export default async function reviewsRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/reviews',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = createReviewSchema.parse(request.body)
      const userId = request.user!.id

      // Prevent duplicate reviews
      const { data: existing } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('product_id', body.product_id)
        .eq('user_id', userId)
        .maybeSingle()

      if (existing) {
        throw new AppError(409, 'ALREADY_REVIEWED', 'You have already reviewed this product')
      }

      const { data: review, error } = await supabaseAdmin
        .from('reviews')
        .insert({
          product_id: body.product_id,
          user_id: userId,
          rating: body.rating,
          text: body.text,
          status: 'pending',
        })
        .select()
        .single()

      if (error || !review) {
        throw new AppError(500, 'DB_ERROR', error?.message ?? 'Failed to create review')
      }

      return reply.status(201).send({ data: review })
    },
  )
}
