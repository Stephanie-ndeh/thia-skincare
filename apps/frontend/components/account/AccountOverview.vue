<script setup lang="ts">
import { Package, Heart, User, MapPin } from 'lucide-vue-next'
import type { OrderStatus } from '@thia/shared'
import { formatXAF } from '@thia/shared'

const authStore = useAuthStore()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

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

const quickLinks = [
  { label: 'Orders',    description: 'Track your orders',    to: '/account/orders',    icon: Package },
  { label: 'Wishlist',  description: 'Saved items',          to: '/account/wishlist',  icon: Heart },
  { label: 'Profile',   description: 'Your details',         to: '/account/profile',   icon: User },
  { label: 'Addresses', description: 'Delivery addresses',   to: '/account/addresses', icon: MapPin },
]

const orders = ref<OrderRow[]>([])
const meta = ref<OrdersMeta | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const firstName = computed(() => {
  const name = authStore.fullName
  if (!name) return 'there'
  return name.split(' ')[0]
})

const totalOrders = computed(() => meta.value?.total ?? orders.value.length)

const totalSpent = computed(() =>
  orders.value.reduce((sum, o) => sum + o.total, 0),
)

const memberSince = computed(() => {
  if (!authStore.profile?.createdAt) return '—'
  return new Date(authStore.profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

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

    const res = await $fetch<{ data: OrderRow[]; meta: OrdersMeta }>(
      `${apiBase}/orders?limit=3`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    orders.value = res.data
    meta.value = res.meta
  } catch {
    fetchError.value = 'Failed to load recent orders.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome -->
    <div>
      <h1 class="font-heading text-2xl font-semibold text-brand-dark">
        Welcome back, {{ firstName }}! 👋
      </h1>
      <p class="mt-1 text-sm text-text-muted">Here's a summary of your account.</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Orders</p>
        <p class="mt-2 text-2xl font-semibold text-brand-dark">{{ totalOrders }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Spent</p>
        <p class="mt-2 text-2xl font-semibold text-brand-dark">{{ formatXAF(totalSpent) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Member Since</p>
        <p class="mt-2 text-lg font-semibold text-brand-dark">{{ memberSince }}</p>
      </div>
    </div>

    <!-- Recent Orders -->
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-heading text-base font-semibold text-brand-dark">Recent Orders</h2>
        <NuxtLink
          to="/account/orders"
          class="text-sm font-medium text-brand-accent hover:underline"
        >
          View all
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="h-14 animate-pulse rounded-lg bg-gray-100" />
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
        class="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center"
      >
        <p class="text-sm text-text-muted">You haven't placed any orders yet.</p>
        <NuxtLink
          to="/categories"
          class="mt-3 inline-block rounded-full bg-brand-dark px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Start shopping
        </NuxtLink>
      </div>

      <!-- Orders table -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-100 bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                Reference
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                Status
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                Total
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-mono text-xs font-medium text-brand-dark">
                {{ order.reference }}
              </td>
              <td class="px-4 py-3 text-text-muted">{{ formatDate(order.created_at) }}</td>
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
              <td class="px-4 py-3 text-right font-medium text-brand-dark">
                {{ formatXAF(order.total) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Quick Links -->
    <section>
      <h2 class="mb-4 font-heading text-base font-semibold text-brand-dark">Quick Links</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 text-center transition-shadow hover:shadow-md"
        >
          <component :is="link.icon" class="h-6 w-6 text-brand-accent" />
          <span class="text-sm font-medium text-brand-dark">{{ link.label }}</span>
          <span class="text-xs text-text-muted">{{ link.description }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
