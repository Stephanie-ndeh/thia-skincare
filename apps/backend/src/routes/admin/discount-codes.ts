import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase.js'
import { AppError } from '../../plugins/error-handler.js'

const createBodySchema = z.object({
  code: z.string().min(1),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  minimum_order: z.number().int().nonnegative().optional(),
  usage_limit: z.number().int().positive().optional(),
  starts_at: z.string().optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean(),
})

const updateBodySchema = z.object({
  type: z.enum(['percentage', 'fixed']).optional(),
  value: z.number().positive().optional(),
  minimum_order: z.number().int().nonnegative().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  starts_at: z.string().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

const toggleBodySchema = z.object({
  is_active: z.boolean(),
})

export default async function adminDiscountCodesRoutes(fastify: FastifyInstance) {
  // GET /admin/discount-codes
  fastify.get(
    '/discount-codes',
    { preHandler: [fastify.requireAdmin] },
    async (_request, reply) => {
      const { data, error } = await supabaseAdmin
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new AppError(500, 'DB_ERROR', error.message)
      return reply.send({ data: data ?? [] })
    },
  )

  // POST /admin/discount-codes
  fastify.post(
    '/discount-codes',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const body = createBodySchema.parse(request.body)

      if (body.type === 'percentage' && body.value > 100) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Percentage value cannot exceed 100')
      }

      const { data: existing } = await supabaseAdmin
        .from('discount_codes')
        .select('id')
        .ilike('code', body.code)
        .maybeSingle()

      if (existing) {
        throw new AppError(409, 'CONFLICT', 'A discount code with this code already exists')
      }

      const { data, error } = await supabaseAdmin
        .from('discount_codes')
        .insert({ ...body, code: body.code.toUpperCase() })
        .select()
        .single()

      if (error || !data) {
        throw new AppError(500, 'DB_ERROR', error?.message ?? 'Failed to create discount code')
      }
      return reply.status(201).send({ data })
    },
  )

  // PUT /admin/discount-codes/:id
  fastify.put<{ Params: { id: string } }>(
    '/discount-codes/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params
      const body = updateBodySchema.parse(request.body)

      if (body.type === 'percentage' && body.value !== undefined && body.value > 100) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Percentage value cannot exceed 100')
      }

      const { data, error } = await supabaseAdmin
        .from('discount_codes')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error || !data) {
        throw new AppError(404, 'NOT_FOUND', error?.message ?? 'Discount code not found')
      }
      return reply.send({ data })
    },
  )

  // PATCH /admin/discount-codes/:id/toggle
  fastify.patch<{ Params: { id: string } }>(
    '/discount-codes/:id/toggle',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params
      const { is_active } = toggleBodySchema.parse(request.body)

      const { data, error } = await supabaseAdmin
        .from('discount_codes')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error || !data) {
        throw new AppError(404, 'NOT_FOUND', error?.message ?? 'Discount code not found')
      }
      return reply.send({ data })
    },
  )

  // DELETE /admin/discount-codes/:id
  fastify.delete<{ Params: { id: string } }>(
    '/discount-codes/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params

      const { error } = await supabaseAdmin
        .from('discount_codes')
        .delete()
        .eq('id', id)

      if (error) throw new AppError(500, 'DB_ERROR', error.message)
      return reply.send({ data: { success: true } })
    },
  )
}
