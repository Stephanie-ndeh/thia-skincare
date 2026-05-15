<script setup lang="ts">
import { formatXAF } from '@thia/shared'
import { useDebounceFn } from '@vueuse/core'
import type { OrderListItem, OrderStatus, PaymentStatus } from '@thia/shared'

definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const orders = ref<OrderListItem[]>([])
const meta = ref<Meta | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const activeStatus = ref<OrderStatus | 'all'>('all')
const search = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)

const STATUS_TABS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

async function fetchOrders() {
  isLoading.value = true
  fetchError.value = null
  try {
    const token = await getToken()
    if (!token) return
    const params = new URLSearchParams({ page: String(currentPage.value), limit: '20' })
    if (activeStatus.value !== 'all') params.set('status', activeStatus.value)
    if (search.value) params.set('search', search.value)
    if (dateFrom.value) params.set('date_from', dateFrom.value)
    if (dateTo.value) params.set('date_to', dateTo.value)

    const res = await $fetch<{ data: OrderListItem[]; meta: Meta }>(
      `${apiBase}/admin/orders?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    orders.value = res.data
    meta.value = res.meta
  } catch {
    fetchError.value = 'Failed to load orders.'
  } finally {
    isLoading.value = false
  }
}

const debouncedFetch = useDebounceFn(fetchOrders, 300)

watch(search, () => {
  currentPage.value = 1
  debouncedFetch()
})
watch([activeStatus, dateFrom, dateTo], () => {
  currentPage.value = 1
  fetchOrders()
})
watch(currentPage, fetchOrders)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function statusBadgeClass(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

function paymentBadgeClass(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    pending: 'bg-gray-100 text-gray-600',
    processing: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

onMounted(fetchOrders)
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <h2 class="font-heading text-2xl font-semibold text-brand-dark">Orders</h2>
      <span
        v-if="meta"
        class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-text-muted"
      >
        {{ meta.total }}
      </span>
    </div>

    <!-- Status tabs -->
    <div class="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
      <button
        v-for="tab in STATUS_TABS"
        :key="tab.value"
        type="button"
        :class="[
          'px-3 py-2 text-sm font-medium transition-colors',
          activeStatus === tab.value
            ? 'border-b-2 border-brand-dark text-brand-dark'
            : 'text-text-muted hover:text-brand-dark',
        ]"
        @click="activeStatus = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <input
        v-model="search"
        type="search"
        class="min-w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
        placeholder="Search by reference or customer…"
      />
      <input
        v-model="dateFrom"
        type="date"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
      />
      <input
        v-model="dateTo"
        type="date"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
      />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <div v-for="n in 8" :key="n" class="h-14 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700">
      {{ fetchError }}
    </div>

    <!-- Table -->
    <template v-else>
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-100 bg-gray-50">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted"
              >
                Reference
              </th>
              <th
                class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell"
              >
                Customer
              </th>
              <th
                class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted md:table-cell"
              >
                Date
              </th>
              <th
                class="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted lg:table-cell"
              >
                Items
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted"
              >
                Total
              </th>
              <th
                class="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell"
              >
                Payment
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted"
              >
                Status
              </th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="orders.length === 0">
              <td colspan="8" class="px-4 py-10 text-center text-sm text-text-muted">
                No orders found
              </td>
            </tr>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-3">
                <span class="font-mono text-xs font-medium text-brand-dark">
                  {{ order.order_number }}
                </span>
              </td>

              <td class="hidden px-4 py-3 sm:table-cell">
                <p class="font-medium text-brand-dark">{{ order.customer_name }}</p>
                <p class="text-xs text-text-muted">{{ order.city }}</p>
              </td>

              <td class="hidden px-4 py-3 text-text-muted md:table-cell">
                {{ formatDate(order.created_at) }}
              </td>

              <td class="hidden px-4 py-3 text-center text-text-muted lg:table-cell">
                {{ order.item_count }}
              </td>

              <td class="px-4 py-3 text-right font-medium text-brand-dark">
                {{ formatXAF(order.total) }}
              </td>

              <td class="hidden px-4 py-3 text-center sm:table-cell">
                <span
                  :class="[
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    paymentBadgeClass(order.payment_status),
                  ]"
                >
                  {{ order.payment_status }}
                </span>
              </td>

              <td class="px-4 py-3 text-center">
                <span
                  :class="[
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    statusBadgeClass(order.status),
                  ]"
                >
                  {{ order.status }}
                </span>
              </td>

              <td class="px-4 py-3 text-right">
                <NuxtLink
                  :to="`/admin/orders/${order.id}`"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-brand-dark transition-colors hover:border-brand-dark hover:bg-gray-50"
                >
                  View
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.totalPages > 1" class="flex items-center justify-between text-sm">
        <p class="text-text-muted">
          {{ meta.total }} orders &mdash; page {{ meta.page }} of {{ meta.totalPages }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="currentPage === 1"
            :class="[
              'flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
              currentPage === 1
                ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                : 'border-gray-200 bg-white text-text-muted hover:border-brand-dark',
            ]"
            @click="currentPage--"
          >
            Prev
          </button>
          <button
            v-for="p in meta.totalPages"
            :key="p"
            :class="[
              'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
              p === currentPage
                ? 'border-brand-dark bg-brand-dark text-white'
                : 'border-gray-200 bg-white text-text-muted hover:border-brand-dark',
            ]"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button
            :disabled="currentPage === meta.totalPages"
            :class="[
              'flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
              currentPage === meta.totalPages
                ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                : 'border-gray-200 bg-white text-text-muted hover:border-brand-dark',
            ]"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
