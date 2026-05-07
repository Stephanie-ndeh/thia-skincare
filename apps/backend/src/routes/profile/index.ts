import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import { isValidCameroonPhone } from '@thia/shared'
import type { Profile, UpdateProfileRequest } from '@thia/shared'

const patchSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
}) satisfies z.ZodType<UpdateProfileRequest>

interface ProfileRow {
  id: string
  full_name: string
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

function shapeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export default async function profileRoutes(fastify: FastifyInstance) {
  fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, created_at, updated_at')
      .eq('id', request.user!.id)
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Profile not found')

    return reply.send({ data: shapeProfile(data as unknown as ProfileRow) })
  })

  fastify.patch('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const body = patchSchema.parse(request.body)

    if (body.phone !== undefined && body.phone !== '' && !isValidCameroonPhone(body.phone)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid Cameroonian phone number')
    }

    const updates: Record<string, string> = {}
    if (body.full_name !== undefined) updates.full_name = body.full_name
    if (body.phone !== undefined) updates.phone = body.phone

    if (Object.keys(updates).length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'No fields to update')
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', request.user!.id)
      .select('id, full_name, phone, role, created_at, updated_at')
      .single()

    if (error || !data) throw new AppError(500, 'DB_ERROR', error?.message ?? 'Update failed')

    return reply.send({ data: shapeProfile(data as unknown as ProfileRow) })
  })
}
