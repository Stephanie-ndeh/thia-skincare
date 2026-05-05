import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import { initializePayment, verifyPayment } from '../../services/payment.service'

const initializeBodySchema = z.object({
  orderId: z.string().uuid(),
  channel: z.enum(['cm.mtn', 'cm.orange']),
  email: z.string().email(),
  phone: z.string().min(1),
  callbackUrl: z.string().url(),
})

const verifyBodySchema = z.object({
  reference: z.string().min(1),
})

export default async function paymentsRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/payments/initialize',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = initializeBodySchema.parse(request.body)

      // Fetch order to get amount and description
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('id, total, reference')
        .eq('id', body.orderId)
        .eq('user_id', request.user!.id)
        .single()

      if (error || !order) {
        throw new AppError(404, 'ORDER_NOT_FOUND', `Order ${body.orderId} not found`)
      }

      const result = await initializePayment({
        orderId: body.orderId,
        amount: order.total,
        email: body.email,
        phone: body.phone,
        channel: body.channel,
        description: `Thia order ${order.reference}`,
        callbackUrl: body.callbackUrl,
      })

      // Store the NotchPay reference on the order
      await supabaseAdmin
        .from('orders')
        .update({ notchpay_reference: result.reference, payment_status: 'processing' })
        .eq('id', body.orderId)

      return reply.send({ data: { payment_url: result.payment_url, reference: result.reference } })
    },
  )

  fastify.post(
    '/payments/verify',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = verifyBodySchema.parse(request.body)
      const result = await verifyPayment(body.reference)

      // Fetch the associated order for the caller
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('notchpay_reference', body.reference)
        .eq('user_id', request.user!.id)
        .single()

      return reply.send({ data: { ...result, order: order ?? null } })
    },
  )
}
