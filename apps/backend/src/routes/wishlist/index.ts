import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import type { WishlistItem, WishlistToggleResponse } from '@thia/shared'

const toggleSchema = z.object({
  product_id: z.string().uuid(),
})

interface RawProduct {
  id: string
  name: string
  slug: string
  categories: { name: string } | null
  product_images: { url: string; is_primary: boolean }[]
  product_variants: { price: number }[]
}

interface RawWishlistRow {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products: RawProduct | null
}

function shapeItem(row: RawWishlistRow): WishlistItem {
  const p = row.products
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    created_at: row.created_at,
    product: p
      ? {
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryName: p.categories?.name ?? '',
          primaryImageUrl:
            p.product_images.find((i) => i.is_primary)?.url ??
            p.product_images[0]?.url ??
            null,
          lowestPrice:
            p.product_variants.length > 0
              ? Math.min(...p.product_variants.map((v) => v.price))
              : 0,
        }
      : null,
  }
}

export default async function wishlistRoutes(fastify: FastifyInstance) {
  fastify.get('/wishlist', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user!.id

    const { data, error } = await supabaseAdmin
      .from('wishlist_items')
      .select(
        'id, user_id, product_id, created_at, products(id, name, slug, categories(name), product_images(url, is_primary), product_variants(price))',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)

    const shaped = (data as unknown as RawWishlistRow[]).map(shapeItem)
    return reply.send({ data: shaped })
  })

  fastify.post('/wishlist', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const body = toggleSchema.parse(request.body)
    const userId = request.user!.id

    const { data: existing } = await supabaseAdmin
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', body.product_id)
      .maybeSingle()

    const result: WishlistToggleResponse = { added: false, product_id: body.product_id }

    if (existing) {
      const { error } = await supabaseAdmin
        .from('wishlist_items')
        .delete()
        .eq('id', existing.id)
      if (error) throw new AppError(500, 'DB_ERROR', error.message)
      result.added = false
    } else {
      const { error } = await supabaseAdmin
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: body.product_id })
      if (error) throw new AppError(500, 'DB_ERROR', error.message)
      result.added = true
    }

    return reply.send({ data: result })
  })
}
