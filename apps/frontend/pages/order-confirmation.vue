<script setup lang="ts">
import { formatXAF } from '@thia/shared'

definePageMeta({ layout: 'default', ssr: false })

const config = useRuntimeConfig()
const route = useRoute()
const cartStore = useCartStore()
const apiBase = config.public.apiBaseUrl as string

// ── State ──────────────────────────────────────────────────────────────────

const status = ref<'loading' | 'success' | 'error'>('loading')
const order = ref<{
  reference: string
  total: number
  order_items: Array<{
    id: string
    product_name: string
    variant_label: string
    quantity: number
    unit_price: number
    line_total: number
  }>
} | null>(null)

// ── On mount: verify payment ──────────────────────────────────────────────

onMounted(async () => {
  const reference = route.query.reference as string | undefined
  const transaction = route.query.transaction as string | undefined

  if (!reference || !transaction) {
    status.value = 'error'
    return
  }

  try {
    const result = await $fetch<{
      data: { status: string; order: typeof order.value }
    }>(`${apiBase}/payments/verify`, {
      method: 'POST',
      body: { reference },
    })

    if (result.data.status === 'complete') {
      order.value = result.data.order
      cartStore.clearCart()
      status.value = 'success'
    } else {
      status.value = 'error'
    }
  } catch {
    status.value = 'error'
  }
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12">
    <!-- Loading state -->
    <div v-if="status === 'loading'" class="flex flex-col items-center gap-4 py-16 text-center">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-brand-dark border-t-transparent" />
      <p class="text-text-muted">Verifying your payment…</p>
    </div>

    <!-- Success state -->
    <div v-else-if="status === 'success'" class="flex flex-col items-center gap-6 text-center">
      <!-- Animated checkmark -->
      <div class="flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-green-100">
        <svg class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h1 class="font-heading text-2xl font-semibold text-text-dark">Order Confirmed!</h1>
        <p v-if="order?.reference" class="mt-1 font-mono text-sm text-text-muted">
          {{ order.reference }}
        </p>
      </div>

      <!-- Items list -->
      <div v-if="order?.order_items?.length" class="w-full rounded-xl border border-border bg-white p-5 text-left">
        <h2 class="mb-3 text-sm font-semibold text-text-dark">Items ordered</h2>
        <ul class="divide-y divide-border text-sm">
          <li
            v-for="item in order.order_items"
            :key="item.id"
            class="flex items-center justify-between py-2.5"
          >
            <div>
              <p class="font-medium text-text-dark">{{ item.product_name }}</p>
              <p class="text-xs text-text-muted">{{ item.variant_label }} &times; {{ item.quantity }}</p>
            </div>
            <span class="text-text-dark">{{ formatXAF(item.line_total) }}</span>
          </li>
        </ul>
        <div v-if="order.total" class="mt-3 flex justify-between border-t border-border pt-3 font-semibold text-text-dark">
          <span>Total</span>
          <span>{{ formatXAF(order.total) }}</span>
        </div>
      </div>

      <NuxtLink
        to="/categories"
        class="rounded-full bg-brand-dark px-8 py-3 text-sm font-semibold text-white"
      >
        Continue Shopping
      </NuxtLink>
    </div>

    <!-- Failure state -->
    <div v-else class="flex flex-col items-center gap-6 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <svg class="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <div>
        <h1 class="font-heading text-2xl font-semibold text-text-dark">Payment Failed</h1>
        <p class="mt-2 text-text-muted">
          We couldn't verify your payment. Please try again or contact support.
        </p>
      </div>

      <NuxtLink
        to="/checkout"
        class="rounded-full bg-brand-dark px-8 py-3 text-sm font-semibold text-white"
      >
        Try Again
      </NuxtLink>

      <!-- Support contacts -->
      <div class="w-full rounded-xl border border-border bg-white p-5 text-left text-sm">
        <p class="mb-3 font-semibold text-text-dark">Need help? Contact support</p>
        <div class="space-y-2 text-text-muted">
          <div class="flex items-center gap-2">
            <span class="text-base">📱</span>
            <span>MTN MoMo Support: <a href="tel:+2376xxxx" class="font-medium text-text-dark">670 000 000</a></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-base">🟠</span>
            <span>Orange Money Support: <a href="tel:+2376xxxx" class="font-medium text-text-dark">655 000 000</a></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
