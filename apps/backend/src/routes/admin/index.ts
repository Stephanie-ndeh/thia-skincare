import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../../config/supabase.js'
import { AppError } from '../../plugins/error-handler.js'

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/metrics',
    { preHandler: [fastify.requireAdmin] },
    async (_request, reply) => {
      const { count: totalOrders, error: e1 } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
      if (e1) throw new AppError(500, 'DB_ERROR', e1.message)

      const { data: revenueRows, error: e2 } = await supabaseAdmin
        .from('orders')
        .select('total')
        .eq('payment_status', 'completed')
      if (e2) throw new AppError(500, 'DB_ERROR', e2.message)
      const totalRevenue = (revenueRows ?? []).reduce(
        (sum, r) => sum + (r.total as number),
        0,
      )

      const { count: totalProducts, error: e3 } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
      if (e3) throw new AppError(500, 'DB_ERROR', e3.message)

      const { count: totalCustomers, error: e4 } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
      if (e4) throw new AppError(500, 'DB_ERROR', e4.message)

      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString()

      const { count: ordersThisMonth, error: e5 } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
      if (e5) throw new AppError(500, 'DB_ERROR', e5.message)

      const { data: monthRevRows, error: e6 } = await supabaseAdmin
        .from('orders')
        .select('total')
        .eq('payment_status', 'completed')
        .gte('created_at', startOfMonth)
      if (e6) throw new AppError(500, 'DB_ERROR', e6.message)
      const revenueThisMonth = (monthRevRows ?? []).reduce(
        (sum, r) => sum + (r.total as number),
        0,
      )

      return reply.send({
        data: {
          total_orders: totalOrders ?? 0,
          total_revenue: totalRevenue,
          total_products: totalProducts ?? 0,
          total_customers: totalCustomers ?? 0,
          orders_this_month: ordersThisMonth ?? 0,
          revenue_this_month: revenueThisMonth,
        },
      })
    },
  )

  fastify.get(
    '/low-stock',
    { preHandler: [fastify.requireAdmin] },
    async (_request, reply) => {
      const { data, error } = await supabaseAdmin
        .from('product_variants')
        .select('id, product_id, sku, size_label, scent_label, stock_quantity, products(id, name)')
        .lt('stock_quantity', 5)
        .order('stock_quantity', { ascending: true })

      if (error) throw new AppError(500, 'DB_ERROR', error.message)

      interface VariantRow {
        id: string
        product_id: string
        sku: string
        size_label: string | null
        scent_label: string | null
        stock_quantity: number
        products: { id: string; name: string } | { id: string; name: string }[] | null
      }

      const rows = (data ?? []) as unknown as VariantRow[]

      const result = rows.map((v) => {
        const productRecord = Array.isArray(v.products) ? v.products[0] : v.products
        const labelParts = [v.size_label, v.scent_label].filter(Boolean)
        return {
          id: v.id,
          product_id: productRecord?.id ?? v.product_id,
          product_name: productRecord?.name ?? '',
          variant_label: labelParts.length > 0 ? labelParts.join(' / ') : v.sku,
          stock_quantity: v.stock_quantity,
        }
      })

      return reply.send({ data: result })
    },
  )

  fastify.get(
    '/orders',
    { preHandler: [fastify.requireAdmin] },
    async (_request, reply) => {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, status, payment_status, total, created_at, shipping_name')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw new AppError(500, 'DB_ERROR', error.message)

      return reply.send({ data: data ?? [] })
    },
  )
}
