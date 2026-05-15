import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { Resend } from 'resend'
import type { ContactRequest } from '@thia/shared'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(20),
}) satisfies z.ZodType<ContactRequest>

export default async function contactRoutes(fastify: FastifyInstance) {
  fastify.post('/contact', async (request, reply) => {
    const body = contactSchema.parse(request.body)
    const adminEmail = process.env.ADMIN_EMAIL ?? 'hello@thia.cm'

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'notifications@thia.cm',
        to: adminEmail,
        subject: `[Thia Contact] ${body.subject} - ${body.name}`,
        html: `
          <h2>New contact message from ${body.name}</h2>
          <p><strong>Email:</strong> ${body.email}</p>
          ${body.phone ? `<p><strong>Phone:</strong> ${body.phone}</p>` : ''}
          <p><strong>Subject:</strong> ${body.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${body.message.replace(/\n/g, '<br>')}</p>
        `,
      })
    }

    return reply.status(200).send({ data: { success: true } })
  })
}
