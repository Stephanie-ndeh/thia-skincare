import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase.js'
import { AppError } from '../../plugins/error-handler.js'

const updateBodySchema = z.object({
  customer_name: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().nonnegative().optional(),
})

export default async function adminTestimonialsRoutes(fastify: FastifyInstance) {
  // GET /admin/testimonials
  fastify.get(
    '/testimonials',
    { preHandler: [fastify.requireAdmin] },
    async (_request, reply) => {
      const { data, error } = await supabaseAdmin
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw new AppError(500, 'DB_ERROR', error.message)
      return reply.send({ data: data ?? [] })
    },
  )

  // POST /admin/testimonials — multipart: fields + optional photo
  fastify.post(
    '/testimonials',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const parts = request.parts()

      let customer_name = ''
      let text = ''
      let is_featured = false
      let display_order = 0
      let photoBuffer: Buffer | null = null
      let photoMimetype = ''
      let photoFilename = ''

      for await (const part of parts) {
        if (part.type === 'file') {
          photoBuffer = await part.toBuffer()
          photoMimetype = part.mimetype
          photoFilename = part.filename
        } else {
          const val = part.value as string
          if (part.fieldname === 'customer_name') customer_name = val
          else if (part.fieldname === 'text') text = val
          else if (part.fieldname === 'is_featured') is_featured = val === 'true'
          else if (part.fieldname === 'display_order') display_order = parseInt(val, 10) || 0
        }
      }

      if (!customer_name || !text) {
        throw new AppError(400, 'VALIDATION_ERROR', 'customer_name and text are required')
      }

      let photo_url: string | null = null
      let storage_path: string | null = null

      if (photoBuffer && photoBuffer.length > 0) {
        const storagePath = `testimonials/${Date.now()}-${photoFilename}`
        const { error: storageError } = await supabaseAdmin.storage
          .from('testimonial-photos')
          .upload(storagePath, photoBuffer, { contentType: photoMimetype, upsert: false })
        if (storageError) throw new AppError(500, 'STORAGE_ERROR', storageError.message)

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from('testimonial-photos').getPublicUrl(storagePath)

        photo_url = publicUrl
        storage_path = storagePath
      }

      const { data, error } = await supabaseAdmin
        .from('testimonials')
        .insert({ customer_name, text, is_featured, display_order, photo_url, storage_path })
        .select()
        .single()

      if (error || !data) {
        throw new AppError(500, 'DB_ERROR', error?.message ?? 'Failed to create testimonial')
      }
      return reply.status(201).send({ data })
    },
  )

  // PUT /admin/testimonials/:id
  fastify.put<{ Params: { id: string } }>(
    '/testimonials/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params
      const body = updateBodySchema.parse(request.body)

      const { data, error } = await supabaseAdmin
        .from('testimonials')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error || !data) {
        throw new AppError(404, 'NOT_FOUND', error?.message ?? 'Testimonial not found')
      }
      return reply.send({ data })
    },
  )

  // DELETE /admin/testimonials/:id
  fastify.delete<{ Params: { id: string } }>(
    '/testimonials/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params

      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('testimonials')
        .select('storage_path')
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        throw new AppError(404, 'NOT_FOUND', 'Testimonial not found')
      }

      const row = existing as { storage_path: string | null }
      if (row.storage_path) {
        await supabaseAdmin.storage.from('testimonial-photos').remove([row.storage_path])
      }

      const { error: deleteError } = await supabaseAdmin
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (deleteError) throw new AppError(500, 'DB_ERROR', deleteError.message)
      return reply.send({ data: { success: true } })
    },
  )

  // POST /admin/testimonials/:id/photo
  fastify.post<{ Params: { id: string } }>(
    '/testimonials/:id/photo',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params

      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('testimonials')
        .select('storage_path')
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        throw new AppError(404, 'NOT_FOUND', 'Testimonial not found')
      }

      const fileData = await request.file()
      if (!fileData) throw new AppError(400, 'VALIDATION_ERROR', 'No photo uploaded')

      const row = existing as { storage_path: string | null }
      if (row.storage_path) {
        await supabaseAdmin.storage.from('testimonial-photos').remove([row.storage_path])
      }

      const buffer = await fileData.toBuffer()
      const storagePath = `testimonials/${Date.now()}-${fileData.filename}`

      const { error: storageError } = await supabaseAdmin.storage
        .from('testimonial-photos')
        .upload(storagePath, buffer, { contentType: fileData.mimetype, upsert: false })

      if (storageError) throw new AppError(500, 'STORAGE_ERROR', storageError.message)

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from('testimonial-photos').getPublicUrl(storagePath)

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('testimonials')
        .update({
          photo_url: publicUrl,
          storage_path: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError || !updated) {
        throw new AppError(500, 'DB_ERROR', updateError?.message ?? 'Failed to update photo')
      }
      return reply.send({ data: updated })
    },
  )
}
