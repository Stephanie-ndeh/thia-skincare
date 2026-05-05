import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import type { ShippingZone, ShippingCalculateResponse } from '@thia/shared'

const calculateBodySchema = z.object({
  city: z.string().min(1),
  subtotal: z.number().int().nonnegative(),
})

export default async function shippingRoutes(fastify: FastifyInstance) {
  fastify.get('/shipping/zones', async (_request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('shipping_zones')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)

    const zones: ShippingZone[] = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      cities: row.cities ?? [],
      rate: row.rate,
      freeThreshold: row.free_threshold,
      displayOrder: row.display_order,
      isActive: row.is_active,
    }))

    return reply.send({ data: zones })
  })

  fastify.post('/shipping/calculate', async (request, reply) => {
    const body = calculateBodySchema.parse(request.body)
    const cityLower = body.city.toLowerCase()

    const { data: zones, error } = await supabaseAdmin
      .from('shipping_zones')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)

    const matched = (zones ?? []).find((zone) =>
      (zone.cities as string[] ?? []).map((c) => c.toLowerCase()).includes(cityLower)
    )

    let result: ShippingCalculateResponse

    if (matched) {
      const isFree = matched.free_threshold > 0 && body.subtotal >= matched.free_threshold
      result = {
        rate: isFree ? 0 : matched.rate,
        zoneName: matched.name,
        isFree,
      }
    } else {
      result = {
        rate: 2500,
        zoneName: 'Standard',
        isFree: false,
      }
    }

    return reply.send({ data: result })
  })
}
