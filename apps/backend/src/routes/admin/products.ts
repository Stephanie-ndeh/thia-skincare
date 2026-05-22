import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase.js'
import { AppError } from '../../plugins/error-handler.js'
import type { CreateProductRequest, ToggleProductRequest } from '@thia/shared'

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  size_label: z.string().optional(),
  scent_label: z.string().optional(),
  price: z.number().int().positive(),
  stock_quantity: z.number().int().nonnegative(),
  display_order: z.number().int().nonnegative(),
})

const productBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category_id: z.string().uuid(),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  usage_instructions: z.string().optional(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  variants: z.array(variantSchema).min(1),
}) satisfies z.ZodType<CreateProductRequest>

const toggleSchema = z.object({
  field: z.enum(['is_published', 'is_featured']),
  value: z.boolean(),
}) satisfies z.ZodType<ToggleProductRequest>

const listQuerySchema = z.object({
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

const PRODUCT_SELECT = `
  *,
  categories(id, name, slug),
  product_variants(id, sku, size_label, scent_label, price, stock_quantity, display_order),
  product_images(id, url, storage_path, is_primary, display_order)
`

function buildSku(slug: string, sizeLabel?: string, scentLabel?: string, idx?: number): string {
  const base = slug.toUpperCase().replace(/-/g, '_')
  const label = (sizeLabel || scentLabel || String((idx ?? 0) + 1))
    .toUpperCase()
    .replace(/\s+/g, '_')
  return `${base}_${label}`
}

export default async function adminProductsRoutes(fastify: FastifyInstance) {
  // GET /admin/products
  fastify.get<{ Querystring: z.infer<typeof listQuerySchema> }>(
    '/products',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { search, category_id, page, limit } = listQuerySchema.parse(request.query)
      const offset = (page - 1) * limit

      let query = supabaseAdmin
        .from('products')
        .select(PRODUCT_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (search) query = query.ilike('name', `%${search}%`)
      if (category_id) query = query.eq('category_id', category_id)

      const { data, error, count } = await query
      if (error) throw new AppError(500, 'DB_ERROR', error.message)

      const total = count ?? 0
      return reply.send({
        data: data ?? [],
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      })
    },
  )

  // GET /admin/products/:id
  fastify.get<{ Params: { id: string } }>(
    '/products/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('id', request.params.id)
        .single()

      if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Product not found')
      return reply.send({ data })
    },
  )

  // POST /admin/products
  fastify.post(
    '/products',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const body = productBodySchema.parse(request.body)

      const { data: product, error: prodError } = await supabaseAdmin
        .from('products')
        .insert({
          name: body.name,
          slug: body.slug,
          category_id: body.category_id,
          description: body.description ?? null,
          ingredients: body.ingredients ?? null,
          usage_instructions: body.usage_instructions ?? null,
          is_published: body.is_published,
          is_featured: body.is_featured,
        })
        .select()
        .single()

      if (prodError || !product) {
        throw new AppError(500, 'DB_ERROR', prodError?.message ?? 'Failed to create product')
      }

      const variantRows = body.variants.map((v, idx) => ({
        product_id: (product as { id: string }).id,
        sku: buildSku(body.slug, v.size_label, v.scent_label, idx),
        size_label: v.size_label ?? null,
        scent_label: v.scent_label ?? null,
        price: v.price,
        stock_quantity: v.stock_quantity,
        display_order: idx,
      }))

      const { data: variants, error: varError } = await supabaseAdmin
        .from('product_variants')
        .insert(variantRows)
        .select()

      if (varError) throw new AppError(500, 'DB_ERROR', varError.message)

      return reply.status(201).send({ data: { ...product, product_variants: variants ?? [] } })
    },
  )

  // PUT /admin/products/:id
  fastify.put<{ Params: { id: string } }>(
    '/products/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params
      const body = productBodySchema.parse(request.body)

      const { error: prodError } = await supabaseAdmin
        .from('products')
        .update({
          name: body.name,
          slug: body.slug,
          category_id: body.category_id,
          description: body.description ?? null,
          ingredients: body.ingredients ?? null,
          usage_instructions: body.usage_instructions ?? null,
          is_published: body.is_published,
          is_featured: body.is_featured,
        })
        .eq('id', id)

      if (prodError) throw new AppError(500, 'DB_ERROR', prodError.message)

      // Sync variants
      const { data: existingVariants } = await supabaseAdmin
        .from('product_variants')
        .select('id')
        .eq('product_id', id)

      const existingIds = new Set(
        (existingVariants ?? []).map((v) => (v as { id: string }).id),
      )
      const submittedIds = new Set(
        body.variants.filter((v) => v.id).map((v) => v.id as string),
      )

      const toDelete = [...existingIds].filter((eid) => !submittedIds.has(eid))
      if (toDelete.length > 0) {
        await supabaseAdmin.from('product_variants').delete().in('id', toDelete)
      }

      for (const v of body.variants.filter((v) => v.id)) {
        await supabaseAdmin
          .from('product_variants')
          .update({
            size_label: v.size_label ?? null,
            scent_label: v.scent_label ?? null,
            price: v.price,
            stock_quantity: v.stock_quantity,
            display_order: v.display_order,
          })
          .eq('id', v.id!)
      }

      const newVariants = body.variants.filter((v) => !v.id)
      if (newVariants.length > 0) {
        await supabaseAdmin.from('product_variants').insert(
          newVariants.map((v, idx) => ({
            product_id: id,
            sku: buildSku(body.slug, v.size_label, v.scent_label, idx),
            size_label: v.size_label ?? null,
            scent_label: v.scent_label ?? null,
            price: v.price,
            stock_quantity: v.stock_quantity,
            display_order: v.display_order,
          })),
        )
      }

      const { data: updated, error: fetchError } = await supabaseAdmin
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('id', id)
        .single()

      if (fetchError || !updated) throw new AppError(500, 'DB_ERROR', 'Failed to fetch updated product')
      return reply.send({ data: updated })
    },
  )

  // PATCH /admin/products/:id/toggle
  fastify.patch<{ Params: { id: string } }>(
    '/products/:id/toggle',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params
      const body = toggleSchema.parse(request.body)

      const { data, error } = await supabaseAdmin
        .from('products')
        .update({ [body.field]: body.value })
        .eq('id', id)
        .select()
        .single()

      if (error || !data) throw new AppError(500, 'DB_ERROR', error?.message ?? 'Toggle failed')
      return reply.send({ data })
    },
  )

  // DELETE /admin/products/:id  (soft delete)
  fastify.delete<{ Params: { id: string } }>(
    '/products/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { error } = await supabaseAdmin
        .from('products')
        .update({ is_published: false })
        .eq('id', request.params.id)

      if (error) throw new AppError(500, 'DB_ERROR', error.message)
      return reply.send({ data: { success: true } })
    },
  )

  // POST /admin/products/:id/images
  fastify.post<{ Params: { id: string } }>(
    '/products/:id/images',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params

      const fileData = await request.file()
      if (!fileData) throw new AppError(400, 'VALIDATION_ERROR', 'No file uploaded')

      const buffer = await fileData.toBuffer()
      const storagePath = `${id}/${Date.now()}-${fileData.filename}`

      const { error: storageError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(storagePath, buffer, { contentType: fileData.mimetype, upsert: false })

      if (storageError) throw new AppError(500, 'STORAGE_ERROR', storageError.message)

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(storagePath)

      const { count } = await supabaseAdmin
        .from('product_images')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', id)

      const { data: image, error: imgError } = await supabaseAdmin
        .from('product_images')
        .insert({
          product_id: id,
          url: publicUrl,
          storage_path: storagePath,
          is_primary: (count ?? 0) === 0,
          display_order: count ?? 0,
        })
        .select()
        .single()

      if (imgError || !image) throw new AppError(500, 'DB_ERROR', imgError?.message ?? 'Failed to save image')
      return reply.status(201).send({ data: image })
    },
  )

  // PATCH /admin/products/:id/images/:imageId/primary
  fastify.patch<{ Params: { id: string; imageId: string } }>(
    '/products/:id/images/:imageId/primary',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id, imageId } = request.params

      await supabaseAdmin
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id)

      const { data, error } = await supabaseAdmin
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId)
        .eq('product_id', id)
        .select()
        .single()

      if (error || !data) throw new AppError(500, 'DB_ERROR', error?.message ?? 'Failed to set primary')
      return reply.send({ data })
    },
  )

  // DELETE /admin/products/:id/images/:imageId
  fastify.delete<{ Params: { id: string; imageId: string } }>(
    '/products/:id/images/:imageId',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id, imageId } = request.params

      const { data: image, error: fetchError } = await supabaseAdmin
        .from('product_images')
        .select('id, storage_path, is_primary')
        .eq('id', imageId)
        .eq('product_id', id)
        .single()

      if (fetchError || !image) throw new AppError(404, 'NOT_FOUND', 'Image not found')

      const imgRow = image as { id: string; storage_path: string; is_primary: boolean }

      await supabaseAdmin.storage.from('product-images').remove([imgRow.storage_path])
      await supabaseAdmin.from('product_images').delete().eq('id', imageId)

      if (imgRow.is_primary) {
        const { data: next } = await supabaseAdmin
          .from('product_images')
          .select('id')
          .eq('product_id', id)
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (next) {
          await supabaseAdmin
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', (next as { id: string }).id)
        }
      }

      return reply.send({ data: { success: true } })
    },
  )
}
