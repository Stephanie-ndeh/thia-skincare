import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'

const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

export default async function categoriesRoutes(fastify: FastifyInstance) {
  fastify.get('/categories', async (_request, reply) => {
    const cacheKey = 'all-categories'
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return reply.send({ data: cached.data })
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*, products(count)')
      .order('display_order', { ascending: true })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    cache.set(cacheKey, { data, timestamp: Date.now() })
    return reply.send({ data })
  })

  fastify.get<{ Params: { slug: string } }>('/categories/:slug', async (request, reply) => {
    const { slug } = request.params

    const { data: category, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (catError || !category) throw new AppError(404, 'CATEGORY_NOT_FOUND', `Category "${slug}" not found`)

    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        product_variants (id, sku, size_label, scent_label, price, stock_quantity, display_order),
        product_images (id, url, storage_path, is_primary, display_order)
      `)
      .eq('category_id', category.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (prodError) throw new AppError(500, 'DB_ERROR', prodError.message)

    return reply.send({ data: { category, products: products ?? [] } })
  })
}
