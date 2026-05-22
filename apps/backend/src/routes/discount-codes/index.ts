import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import type { DiscountValidateResponse } from '@thia/shared'

const validateBodySchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().nonnegative().optional(),
})

const INVALID: Pick<DiscountValidateResponse, 'valid' | 'type' | 'value' | 'code'> = {
  valid: false,
  type: 'percentage',
  value: 0,
  code: '',
}

export default async function discountCodesRoutes(fastify: FastifyInstance) {
  fastify.post('/discount-codes/validate', async (request, reply) => {
    const body = validateBodySchema.parse(request.body)

    const { data: dc, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .ilike('code', body.code)
      .eq('is_active', true)
      .single()

    if (error || !dc) {
      const res: DiscountValidateResponse = { ...INVALID, message: 'Invalid discount code.' }
      return reply.send({ data: res })
    }

    if (dc.expires_at && new Date(dc.expires_at) < new Date()) {
      const res: DiscountValidateResponse = { ...INVALID, message: 'This discount code has expired.' }
      return reply.send({ data: res })
    }

    if (dc.usage_limit !== null && dc.usage_count >= dc.usage_limit) {
      const res: DiscountValidateResponse = {
        ...INVALID,
        message: 'This discount code has reached its usage limit.',
      }
      return reply.send({ data: res })
    }

    if (body.subtotal !== undefined && dc.minimum_order && body.subtotal < dc.minimum_order) {
      const res: DiscountValidateResponse = {
        ...INVALID,
        message: `A minimum order of ${dc.minimum_order} XAF is required.`,
      }
      return reply.send({ data: res })
    }

    const res: DiscountValidateResponse = {
      valid: true,
      type: dc.type as 'percentage' | 'fixed',
      value: dc.value,
      message: 'Discount applied.',
      code: (dc.code as string).toUpperCase(),
    }
    return reply.send({ data: res })
  })
}
