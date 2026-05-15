import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabase.js'
import { AppError } from '../../plugins/error-handler.js'
import { ORDER_STATUS_TRANSITIONS } from '@thia/shared'
import type { OrderStatus, OrderListItem, OrderItemDetail, OrderDetail } from '@thia/shared'

const ORDER_STATUS_VALUES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

const STATUS_OPTIONS = ['all', ...ORDER_STATUS_VALUES] as const

const listQuerySchema = z.object({
  status: z.enum(STATUS_OPTIONS).default('all'),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
})

interface ProfileRow {
  full_name: string
  phone: string | null
}

interface OrderRow {
  id: string
  order_number: string
  created_at: string
  status: string
  payment_status: string
  total: number
  shipping_city: string
  shipping_phone: string
  shipping_name: string
  user_id: string | null
  profiles: ProfileRow | ProfileRow[] | null
  order_items: { id: string }[]
}

interface OrderDetailRow {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  status: string
  payment_status: string
  payment_channel: string | null
  payment_phone: string | null
  payment_reference: string | null
  notchpay_reference: string | null
  subtotal: number
  shipping_cost: number
  discount_amount: number
  total: number
  discount_code_id: string | null
  shipping_name: string
  shipping_phone: string
  shipping_region: string
  shipping_city: string
  shipping_address_line: string
  shipping_notes: string | null
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  profiles: ProfileRow | ProfileRow[] | null
}

interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
  products: {
    product_images: { url: string; is_primary: boolean }[]
  } | { product_images: { url: string; is_primary: boolean }[] }[] | null
}

export default async function adminOrdersRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/orders',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { status, search, date_from, date_to, page, limit } = listQuerySchema.parse(
        request.query,
      )
      const offset = (page - 1) * limit

      // Resolve user_ids matching the search term (customer name lookup)
      let matchingUserIds: string[] = []
      if (search) {
        const { data: profileMatches } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .ilike('full_name', `%${search}%`)
        matchingUserIds = (profileMatches ?? []).map((p) => p.id as string)
      }

      let query = supabaseAdmin
        .from('orders')
        .select(
          `
          id,
          order_number,
          created_at,
          status,
          payment_status,
          total,
          shipping_city,
          shipping_phone,
          shipping_name,
          user_id,
          profiles!user_id(full_name, phone),
          order_items(id)
        `,
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status !== 'all') {
        query = query.eq('status', status)
      }
      if (date_from) {
        query = query.gte('created_at', date_from)
      }
      if (date_to) {
        query = query.lte('created_at', `${date_to}T23:59:59`)
      }
      if (search) {
        if (matchingUserIds.length > 0) {
          query = query.or(
            `order_number.ilike.%${search}%,shipping_name.ilike.%${search}%,user_id.in.(${matchingUserIds.join(',')})`,
          )
        } else {
          query = query.or(
            `order_number.ilike.%${search}%,shipping_name.ilike.%${search}%`,
          )
        }
      }

      const { data, error, count } = await query

      if (error) throw new AppError(500, 'DB_ERROR', error.message)

      const rows = (data ?? []) as unknown as OrderRow[]

      const items: OrderListItem[] = rows.map((row) => {
        const profileRecord = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
        return {
          id: row.id,
          order_number: row.order_number,
          created_at: row.created_at,
          status: row.status as OrderStatus,
          payment_status: row.payment_status as import('@thia/shared').PaymentStatus,
          total: row.total,
          item_count: Array.isArray(row.order_items) ? row.order_items.length : 0,
          customer_name: profileRecord?.full_name ?? row.shipping_name,
          customer_phone: profileRecord?.phone ?? row.shipping_phone,
          city: row.shipping_city,
        }
      })

      const total = count ?? 0
      return reply.send({
        data: items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      })
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/orders/:id',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params

      const { data: orderRaw, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*, profiles!user_id(full_name, phone)')
        .eq('id', id)
        .single()

      if (orderError || !orderRaw) {
        throw new AppError(404, 'ORDER_NOT_FOUND', `Order ${id} not found`)
      }

      const { data: itemsRaw, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('*, products!product_id(product_images(url, is_primary))')
        .eq('order_id', id)
        .order('created_at', { ascending: true })

      if (itemsError) throw new AppError(500, 'DB_ERROR', itemsError.message)

      const order = orderRaw as unknown as OrderDetailRow
      const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles

      // Fetch email from auth if authenticated user
      let email: string | undefined
      if (order.user_id) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
        email = authUser.user?.email ?? undefined
      }

      const orderItems: OrderItemDetail[] = ((itemsRaw ?? []) as unknown as OrderItemRow[]).map(
        (item) => {
          const productRecord = Array.isArray(item.products) ? item.products[0] : item.products
          const images = productRecord?.product_images ?? []
          const primaryImage = images.find((img) => img.is_primary) ?? images[0]
          return {
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            variant_label: item.variant_label,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total,
            created_at: item.created_at,
            image_url: primaryImage?.url ?? null,
          }
        },
      )

      const result: OrderDetail = {
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        guest_email: order.guest_email,
        status: order.status as OrderStatus,
        payment_status: order.payment_status as import('@thia/shared').PaymentStatus,
        payment_channel: order.payment_channel,
        payment_phone: order.payment_phone,
        payment_reference: order.payment_reference,
        notchpay_reference: order.notchpay_reference,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        discount_amount: order.discount_amount,
        total: order.total,
        discount_code_id: order.discount_code_id,
        shipping_name: order.shipping_name,
        shipping_phone: order.shipping_phone,
        shipping_region: order.shipping_region,
        shipping_city: order.shipping_city,
        shipping_address_line: order.shipping_address_line,
        shipping_notes: order.shipping_notes,
        confirmed_at: order.confirmed_at,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        cancelled_at: order.cancelled_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: orderItems,
        customer: {
          full_name: profile?.full_name ?? order.shipping_name,
          phone: profile?.phone ?? order.shipping_phone,
          email,
        },
      }

      return reply.send({ data: result })
    },
  )

  fastify.patch<{ Params: { id: string } }>(
    '/orders/:id/status',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { id } = request.params
      const { status: newStatus } = updateStatusSchema.parse(request.body)

      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id, status')
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        throw new AppError(404, 'ORDER_NOT_FOUND', `Order ${id} not found`)
      }

      const currentStatus = existing.status as OrderStatus
      const allowed = ORDER_STATUS_TRANSITIONS[currentStatus]

      if (!allowed.includes(newStatus)) {
        throw new AppError(
          422,
          'INVALID_TRANSITION',
          `Cannot transition order from '${currentStatus}' to '${newStatus}'`,
        )
      }

      // Set the appropriate timestamp for this status
      const timestampField: Partial<Record<OrderStatus, string>> = {
        confirmed: 'confirmed_at',
        shipped: 'shipped_at',
        delivered: 'delivered_at',
        cancelled: 'cancelled_at',
      }
      const tsField = timestampField[newStatus]

      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }
      if (tsField) {
        updatePayload[tsField] = new Date().toISOString()
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (updateError || !updated) {
        throw new AppError(500, 'DB_ERROR', updateError?.message ?? 'Failed to update order')
      }

      return reply.send({ data: updated })
    },
  )
}
