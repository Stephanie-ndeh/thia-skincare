import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import type { Address } from '@thia/shared'

const addressBodySchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().min(1),
  city: z.string().min(1),
  address_line: z.string().min(1),
  region: z.string().min(1),
  notes: z.string().optional(),
})

const patchAddressSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  address_line: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  is_default: z.boolean().optional(),
})

interface AddressRow {
  id: string
  user_id: string
  full_name: string
  phone: string
  city: string
  address_line: string
  region: string
  notes: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

function shapeAddress(row: AddressRow): Address {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    addressLine: row.address_line,
    region: row.region,
    notes: row.notes,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export default async function addressesRoutes(fastify: FastifyInstance) {
  fastify.get('/addresses', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', request.user!.id)
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)

    return reply.send({ data: (data as unknown as AddressRow[]).map(shapeAddress) })
  })

  fastify.post('/addresses', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const body = addressBodySchema.parse(request.body)
    const userId = request.user!.id

    // If this is the first address, make it default
    const { count } = await supabaseAdmin
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({
        user_id: userId,
        full_name: body.full_name,
        phone: body.phone,
        city: body.city,
        address_line: body.address_line,
        region: body.region,
        notes: body.notes ?? null,
        is_default: count === 0,
      })
      .select('*')
      .single()

    if (error || !data) throw new AppError(500, 'DB_ERROR', error?.message ?? 'Failed to create address')

    return reply.status(201).send({ data: shapeAddress(data as unknown as AddressRow) })
  })

  fastify.patch('/addresses/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = patchAddressSchema.parse(request.body)
    const userId = request.user!.id

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Address not found')

    // If setting as default, unset all others first
    if (body.is_default === true) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update(body)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) throw new AppError(500, 'DB_ERROR', error?.message ?? 'Update failed')

    return reply.send({ data: shapeAddress(data as unknown as AddressRow) })
  })

  fastify.delete('/addresses/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.user!.id

    const { data: existing } = await supabaseAdmin
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Address not found')

    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('id', id)

    if (error) throw new AppError(500, 'DB_ERROR', error.message)

    return reply.status(204).send()
  })
}
