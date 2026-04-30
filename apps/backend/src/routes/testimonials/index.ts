import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'

export default async function testimonialsRoutes(fastify: FastifyInstance) {
  fastify.get('/testimonials', async (_request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    return reply.send({ data: data ?? [] })
  })
}
