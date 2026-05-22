import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase.js'
import { AppError } from '../../plugins/error-handler.js'
import type { ReviewListItem, ReviewStatus } from '@thia/shared'

const REVIEW_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const
const STATUS_OPTIONS = ['all', ...REVIEW_STATUS_VALUES] as const

const listQuerySchema = z.object({
  status: z.enum(STATUS_OPTIONS).default('pending'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
})

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: z.enum(['approved', 'rejected']),
})

interface ReviewRow {
  id: string
  product_id: string
  rating: number
  text: string
  status: string
  created_at: string
  products: { name: string; slug: string } | { name: string; slug: string }[] | null
  profiles: { full_name: string } | { full_name: string }[] | null
}

export default async function adminReviewsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/reviews',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { status, page, limit } = listQuerySchema.parse(request.query)
      const offset = (page - 1) * limit

      let query = supabaseAdmin
        .from('reviews')
        .select(
          `
          id,
          product_id,
          rating,
          text,
          status,
          created_at,
          products!product_id(name, slug),
          profiles!user_id(full_name)
        `,
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) throw new AppError(500, 'DB_ERROR', error.message)

      const rows = (data ?? []) as unknown as ReviewRow[]

      const items: ReviewListItem[] = rows.map((row) => {
        const product = Array.isArray(row.products) ? row.products[0] : row.products
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
        return {
          id: row.id,
          product_id: row.product_id,
          product_name: product?.name ?? '',
          product_slug: product?.slug ?? '',
          customer_name: profile?.full_name ?? 'Customer',
          rating: row.rating,
          text: row.text,
          status: row.status as ReviewStatus,
          created_at: row.created_at,
        }
      })

      const total = count ?? 0
      return reply.send({
        data: items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      })
    },
  )

  // IMPORTANT: register /bulk before /:id so the literal route matches first
  fastify.patch(
    '/reviews/bulk',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { ids, status } = bulkUpdateSchema.parse(request.body)

      const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids)
        .select('id')

      if (error) throw new AppError(500, 'DB_ERROR', error.message)

      return reply.send({ data: { updated: (data ?? []).length } })
    },
  )

  fastify.patch<{ Params: { id: string } }>(
    '/reviews/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params
      const { status } = updateStatusSchema.parse(request.body)

      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        throw new AppError(404, 'REVIEW_NOT_FOUND', `Review ${id} not found`)
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError || !updated) {
        throw new AppError(500, 'DB_ERROR', updateError?.message ?? 'Failed to update review')
      }

      return reply.send({ data: updated })
    },
  )
}
