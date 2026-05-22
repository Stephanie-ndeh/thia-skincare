<script setup lang="ts">
import type { OrderStatus } from '@thia/shared'
import { formatXAF } from '@thia/shared'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

definePageMeta({ layout: 'default', ssr: false, middleware: 'auth' })
useSeoMeta({ title: 'My Account — Thia', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string
const route = useRoute()
const router = useRouter()

interface OrderRow {
  id: string
  reference: string
  status: OrderStatus
  total: number
  created_at: string
}

interface OrdersMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-orange-100 text-orange-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

const currentPage = computed(() => Math.max(1, Number(route.query.page) || 1))

const orders = ref<OrderRow[]>([])
const meta = ref<OrdersMeta | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

async function fetchOrders(page: number) {
  isLoading.value = true
  fetchError.value = null
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    const res = await $fetch<{ data: OrderRow[]; meta: OrdersMeta }>(
      `${apiBase}/orders?page=${page}&limit=10`,
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

function goToPage(page: number) {
  router.push({ query: { ...route.query, page: String(page) } })
}

watch(currentPage, (page) => fetchOrders(page), { immediate: true })
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="lg:flex lg:items-start lg:gap-8">
      <AccountSidebar />

      <div class="min-w-0 flex-1 space-y-6">
        <h1 class="font-heading text-2xl font-semibold text-brand-dark">My Orders</h1>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="space-y-3">
          <div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-lg bg-gray-100" />
        </div>

        <!-- Error -->
        <div
          v-else-if="fetchError"
          class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ fetchError }}
        </div>

        <!-- Empty state -->
        <div
          v-else-if="orders.length === 0"
          class="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center"
        >
          <p class="text-sm font-medium text-brand-dark">No orders yet</p>
          <p class="mt-1 text-sm text-text-muted">When you place an order it will appear here.</p>
          <NuxtLink
            to="/categories"
            class="mt-4 inline-block rounded-full bg-brand-dark px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start shopping
          </NuxtLink>
        </div>

        <!-- Orders list -->
        <template v-else>
          <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table class="w-full text-sm">
              <thead class="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Reference
                  </th>
                  <th class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell">
                    Date
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Status
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                    Total
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
                  <td class="px-4 py-4 font-mono text-xs font-medium text-brand-dark">
                    {{ order.reference }}
                  </td>
                  <td class="hidden px-4 py-4 text-text-muted sm:table-cell">
                    {{ formatDate(order.created_at) }}
                  </td>
                  <td class="px-4 py-4">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        STATUS_STYLES[order.status],
                      ]"
                    >
                      {{ capitalize(order.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-right font-medium text-brand-dark">
                    {{ formatXAF(order.total) }}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <NuxtLink
                      :to="`/account/orders/${order.id}`"
                      class="text-sm font-medium text-brand-accent hover:underline"
                    >
                      View
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="meta && meta.totalPages > 1"
            class="flex items-center justify-between"
          >
            <p class="text-sm text-text-muted">
              Page {{ meta.page }} of {{ meta.totalPages }}
              <span class="ml-1">({{ meta.total }} orders)</span>
            </p>
            <div class="flex items-center gap-2">
              <button
                :disabled="currentPage <= 1"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-text-muted transition-colors hover:border-brand-dark hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                @click="goToPage(currentPage - 1)"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>

              <button
                v-for="p in meta.totalPages"
                :key="p"
                :class="[
                  'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                  p === currentPage
                    ? 'border-brand-dark bg-brand-dark text-white'
                    : 'border-gray-200 bg-white text-text-muted hover:border-brand-dark hover:text-brand-dark',
                ]"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>

              <button
                :disabled="currentPage >= meta.totalPages"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-text-muted transition-colors hover:border-brand-dark hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                @click="goToPage(currentPage + 1)"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
