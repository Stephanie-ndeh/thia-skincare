import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'

export default async function searchRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { q?: string } }>('/search', async (request, reply) => {
    const { q } = request.query

    if (!q || q.trim().length < 2) {
      return reply.send({ data: [], meta: { total: 0 } })
    }

    const { data, error, count } = await supabaseAdmin
      .from('products')
      .select(`
        id, name, slug, description, is_featured, created_at,
        categories (id, name, slug),
        product_variants (id, price, stock_quantity, display_order),
        product_images (id, url, is_primary, display_order)
      `, { count: 'exact' })
      .eq('is_published', true)
      .textSearch('search_vector', q.trim(), {
        type: 'websearch',
        config: 'english',
      })

    if (error) throw new AppError(500, 'SEARCH_ERROR', error.message)

    return reply.send({ data: data ?? [], meta: { total: count ?? 0 } })
  })
}
