import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'

export default async function categoriesRoutes(fastify: FastifyInstance) {
  fastify.get('/categories', async (_request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*, products(count)')
      .order('display_order', { ascending: true })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
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
