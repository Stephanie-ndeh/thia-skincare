<script setup lang="ts">
import { formatXAF } from '@thia/shared'
import type { OrderStatus } from '@thia/shared'

interface AdminOrderRow {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: string
  total: number
  created_at: string
  shipping_name: string
}

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const orders = ref<AdminOrderRow[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-orange-100 text-orange-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

onMounted(async () => {
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    const res = await $fetch<{ data: AdminOrderRow[] }>(
      `${apiBase}/admin/orders`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    orders.value = res.data
  } catch {
    fetchError.value = 'Failed to load recent orders.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div class="border-b border-gray-100 px-5 py-4">
      <h2 class="text-sm font-semibold text-brand-dark">Recent Orders</h2>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3 p-5">
      <div v-for="n in 5" :key="n" class="h-10 animate-pulse rounded bg-gray-100" />
    </div>

    <!-- Error -->
    <div
      v-else-if="fetchError"
      class="px-5 py-4 text-sm text-red-600"
    >
      {{ fetchError }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="orders.length === 0"
      class="px-5 py-10 text-center text-sm text-text-muted"
    >
      No orders yet
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-100 bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
              Order Ref
            </th>
            <th class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell">
              Customer
            </th>
            <th class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted md:table-cell">
              Date
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
              Total
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
              Status
            </th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="order in orders"
            :key="order.id"
            class="transition-colors hover:bg-gray-50"
          >
            <td class="px-4 py-3 font-mono text-xs font-medium text-brand-dark">
              {{ order.order_number }}
            </td>
            <td class="hidden px-4 py-3 text-text-muted sm:table-cell">
              {{ order.shipping_name }}
            </td>
            <td class="hidden px-4 py-3 text-text-muted md:table-cell">
              {{ formatDate(order.created_at) }}
            </td>
            <td class="px-4 py-3 text-right font-medium text-brand-dark">
              {{ formatXAF(order.total) }}
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  STATUS_STYLES[order.status],
                ]"
              >
                {{ capitalize(order.status) }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <NuxtLink
                :to="`/admin/orders/${order.id}`"
                class="text-sm font-medium text-brand-accent hover:underline"
              >
                View
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
