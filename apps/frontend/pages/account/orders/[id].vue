<script setup lang="ts">
import type { OrderStatus } from '@thia/shared'
import { formatXAF } from '@thia/shared'

definePageMeta({ layout: 'default', ssr: false, middleware: 'auth' })
useSeoMeta({ title: 'My Account — Thia', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string
const route = useRoute()

interface OrderItemRow {
  id: string
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  line_total: number
}

interface OrderDetailRow {
  id: string
  reference: string
  status: OrderStatus
  payment_status: string
  payment_channel: string | null
  subtotal: number
  shipping_cost: number
  discount_amount: number
  discount_code: string | null
  total: number
  shipping_name: string
  shipping_phone: string
  shipping_city: string
  shipping_address: string
  shipping_region: string
  created_at: string
  order_items: OrderItemRow[]
}

const CHANNEL_LABELS: Record<string, string> = {
  'cm.mtn': 'MTN Mobile Money',
  'cm.orange': 'Orange Money',
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-orange-100 text-orange-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

const order = ref<OrderDetailRow | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)
const notFound = ref(false)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

    const res = await $fetch<{ data: OrderDetailRow }>(
      `${apiBase}/orders/${route.params.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    order.value = res.data
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 404) {
      notFound.value = true
    } else {
      fetchError.value = 'Failed to load order.'
    }
  } finally {
    isLoading.value = false
  }
})

const breadcrumbs = computed(() => [
  { label: 'Account', href: '/account' },
  { label: 'Orders', href: '/account/orders' },
  { label: order.value?.reference ?? '…' },
])
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="lg:flex lg:items-start lg:gap-8">
      <AccountSidebar />

      <div class="min-w-0 flex-1 space-y-6">
        <Breadcrumb :items="breadcrumbs" />

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="space-y-4">
          <div class="h-8 w-48 animate-pulse rounded bg-gray-100" />
          <div class="h-48 animate-pulse rounded-xl bg-gray-100" />
          <div class="h-32 animate-pulse rounded-xl bg-gray-100" />
        </div>

        <!-- Not found -->
        <div v-else-if="notFound" class="py-16 text-center">
          <p class="text-sm font-medium text-brand-dark">Order not found</p>
          <NuxtLink
            to="/account/orders"
            class="mt-3 inline-block text-sm font-medium text-brand-accent hover:underline"
          >
            Back to orders
          </NuxtLink>
        </div>

        <!-- Error -->
        <div
          v-else-if="fetchError"
          class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ fetchError }}
        </div>

        <!-- Order detail -->
        <template v-else-if="order">
          <!-- Header -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 class="font-heading text-xl font-semibold text-brand-dark">
                {{ order.reference }}
              </h1>
              <p class="mt-0.5 text-sm text-text-muted">{{ formatDate(order.created_at) }}</p>
            </div>
            <span
              :class="[
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                STATUS_STYLES[order.status],
              ]"
            >
              {{ capitalize(order.status) }}
            </span>
          </div>

          <!-- Items -->
          <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div class="border-b border-gray-100 px-5 py-4">
              <h2 class="font-heading text-sm font-semibold text-brand-dark">Items</h2>
            </div>
            <div class="divide-y divide-gray-100">
              <div
                v-for="item in order.order_items"
                :key="item.id"
                class="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-brand-dark">{{ item.product_name }}</p>
                  <p class="text-xs text-text-muted">{{ item.variant_label }} · Qty {{ item.quantity }}</p>
                </div>
                <p class="shrink-0 text-sm font-medium text-brand-dark">
                  {{ formatXAF(item.line_total) }}
                </p>
              </div>
            </div>
          </section>

          <!-- Shipping + Payment -->
          <div class="grid gap-4 sm:grid-cols-2">
            <!-- Shipping address -->
            <section class="rounded-xl border border-gray-200 bg-white p-5">
              <h2 class="mb-3 font-heading text-sm font-semibold text-brand-dark">Shipping Address</h2>
              <p class="text-sm text-brand-dark">{{ order.shipping_name }}</p>
              <p class="text-sm text-text-muted">{{ order.shipping_phone }}</p>
              <p class="text-sm text-text-muted">{{ order.shipping_address }}</p>
              <p class="text-sm text-text-muted">{{ order.shipping_city }}, {{ order.shipping_region }}</p>
            </section>

            <!-- Payment method -->
            <section class="rounded-xl border border-gray-200 bg-white p-5">
              <h2 class="mb-3 font-heading text-sm font-semibold text-brand-dark">Payment</h2>
              <p class="text-sm text-brand-dark">
                {{ order.payment_channel ? (CHANNEL_LABELS[order.payment_channel] ?? order.payment_channel) : '—' }}
              </p>
              <p class="mt-1 text-sm text-text-muted capitalize">
                Status: {{ order.payment_status }}
              </p>
            </section>
          </div>

          <!-- Price breakdown -->
          <section class="rounded-xl border border-gray-200 bg-white p-5">
            <h2 class="mb-4 font-heading text-sm font-semibold text-brand-dark">Order Summary</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-text-muted">Subtotal</span>
                <span class="text-brand-dark">{{ formatXAF(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-muted">Shipping</span>
                <span class="text-brand-dark">
                  {{ order.shipping_cost === 0 ? 'Free' : formatXAF(order.shipping_cost) }}
                </span>
              </div>
              <div v-if="order.discount_amount > 0" class="flex justify-between text-green-700">
                <span>Discount{{ order.discount_code ? ` (${order.discount_code})` : '' }}</span>
                <span>-{{ formatXAF(order.discount_amount) }}</span>
              </div>
              <div class="flex justify-between border-t border-gray-100 pt-2 font-semibold">
                <span class="text-brand-dark">Total</span>
                <span class="text-brand-dark">{{ formatXAF(order.total) }}</span>
              </div>
            </div>
          </section>

          <NuxtLink
            to="/account/orders"
            class="inline-block text-sm font-medium text-brand-accent hover:underline"
          >
            ← Back to orders
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>
