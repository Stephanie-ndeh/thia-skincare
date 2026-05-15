import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'

interface WithDisplayOrder {
  display_order: number
}

const productCache = new Map<string, { data: unknown; timestamp: number }>()
const PRODUCT_CACHE_TTL = 2 * 60 * 1000

export default async function productsRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { slug: string } }>('/products/:slug', async (request, reply) => {
    const { slug } = request.params

    const cacheKey = `product-${slug}`
    const cached = productCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < PRODUCT_CACHE_TTL) {
      return reply.send({ data: cached.data })
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        product_variants (id, sku, size_label, scent_label, price, stock_quantity, display_order),
        product_images (id, url, storage_path, is_primary, display_order),
        reviews (
          id, rating, text, created_at, status,
          profiles (full_name)
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .eq('reviews.status', 'approved')
      .single()

    if (error || !product) throw new AppError(404, 'PRODUCT_NOT_FOUND', `Product "${slug}" not found`)

    if (product.product_variants) {
      (product.product_variants as WithDisplayOrder[]).sort((a, b) => a.display_order - b.display_order)
    }
    if (product.product_images) {
      (product.product_images as WithDisplayOrder[]).sort((a, b) => a.display_order - b.display_order)
    }

    productCache.set(cacheKey, { data: product, timestamp: Date.now() })
    return reply.send({ data: product })
  })
}
