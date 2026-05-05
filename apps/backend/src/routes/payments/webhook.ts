import { createHmac } from 'crypto'
import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../plugins/error-handler'
import { env } from '../../config/env'

export default async function paymentsWebhookRoutes(fastify: FastifyInstance) {
  fastify.post('/payments/webhook', async (request, reply) => {
    const sig = request.headers['x-notch-signature'] as string | undefined
    if (!sig) {
      throw new AppError(400, 'INVALID_SIGNATURE', 'Missing webhook signature')
    }

    const secret = env.NOTCHPAY_WEBHOOK_SECRET
    if (!secret) {
      fastify.log.error('NOTCHPAY_WEBHOOK_SECRET is not configured')
      return reply.status(200).send({ received: true })
    }

    const expected = createHmac('sha256', secret)
      .update(JSON.stringify(request.body))
      .digest('hex')

    if (sig !== expected) {
      fastify.log.warn({ sig, expected }, 'Webhook signature mismatch')
      throw new AppError(400, 'INVALID_SIGNATURE', 'Webhook signature verification failed')
    }

    const payload = request.body as {
      event?: string
      data?: { reference?: string; [key: string]: unknown }
    }

    if (payload.event !== 'payment.complete') {
      return reply.status(200).send({ received: true })
    }

    const reference = payload.data?.reference
    if (!reference) {
      fastify.log.warn('payment.complete webhook missing reference')
      return reply.status(200).send({ received: true })
    }

    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id, discount_code, order_items(variant_id, quantity)')
        .eq('notchpay_reference', reference)
        .single()

      if (orderError || !order) {
        fastify.log.warn({ reference }, 'payment.complete: order not found')
        return reply.status(200).send({ received: true })
      }

      // Mark order as paid
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_status: 'completed' })
        .eq('id', order.id)

      // Decrement stock for each order item
      const items = order.order_items as Array<{ variant_id: string; quantity: number }>
      for (const item of items) {
        const { data: variant } = await supabaseAdmin
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single()

        if (variant) {
          await supabaseAdmin
            .from('product_variants')
            .update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) })
            .eq('id', item.variant_id)
        }
      }

      // Increment discount usage if a code was applied
      if (order.discount_code) {
        const { data: dc } = await supabaseAdmin
          .from('discount_codes')
          .select('id, times_used')
          .ilike('code', order.discount_code as string)
          .single()

        if (dc) {
          await supabaseAdmin
            .from('discount_codes')
            .update({ times_used: dc.times_used + 1 })
            .eq('id', dc.id)
        }
      }
    } catch (err) {
      // Always return 200 to NotchPay even on internal errors
      fastify.log.error(err, 'payment.complete webhook handler error')
    }

    return reply.status(200).send({ received: true })
  })
}
