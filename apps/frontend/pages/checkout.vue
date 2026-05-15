<script setup lang="ts">
import { isValidCameroonPhone, formatXAF } from '@thia/shared'
import type { DeliveryData } from '~/components/checkout/DeliveryForm.vue'

definePageMeta({ layout: 'checkout', ssr: false, middleware: 'auth' })

const { t } = useI18n()
useSeoMeta({
  title: () => t('seo.checkout_title'),
  robots: 'noindex, nofollow',
})

const cartStore = useCartStore()
const { state, calculateShipping, placeOrder } = useCheckout()

// ── Derived ────────────────────────────────────────────────────────────────

const total = computed(() =>
  Math.max(0, cartStore.subtotal - cartStore.discountAmount + state.shippingRate),
)

const isFormValid = computed(() => {
  const d = state.deliveryData
  if (!d) return false
  return (
    d.fullName.trim() !== '' &&
    d.phone.trim() !== '' &&
    d.city.trim() !== '' &&
    d.address.trim() !== '' &&
    d.region.trim() !== '' &&
    isValidCameroonPhone(d.phone)
  )
})

// ── Delivery form binding ──────────────────────────────────────────────────

const delivery = computed<DeliveryData>({
  get: () =>
    state.deliveryData ?? {
      fullName: '',
      phone: '',
      city: '',
      address: '',
      region: '',
    },
  set: (val) => {
    state.deliveryData = val
  },
})
</script>

<template>
  <div>
    <h1 class="mb-6 font-heading text-2xl font-semibold text-text-dark">Checkout</h1>

    <div class="grid gap-6 lg:grid-cols-[1fr_380px]">
      <!-- Left column: forms -->
      <div class="space-y-6">
        <!-- Delivery details -->
        <section class="rounded-xl border border-border bg-white p-5">
          <h2 class="mb-4 font-heading text-base font-semibold text-text-dark">Delivery Details</h2>
          <DeliveryForm
            v-model="delivery"
            @city-changed="calculateShipping"
          />
          <p v-if="state.isLoading && !state.orderId" class="mt-2 text-xs text-text-muted">
            Calculating shipping…
          </p>
        </section>

        <!-- Payment method -->
        <section class="rounded-xl border border-border bg-white p-5">
          <h2 class="mb-4 font-heading text-base font-semibold text-text-dark">Payment Method</h2>
          <PaymentMethodSelector v-model="state.selectedChannel" />
        </section>
      </div>

      <!-- Right column: order summary + CTA -->
      <div class="space-y-4">
        <CheckoutOrderSummary
          :items="cartStore.items"
          :subtotal="cartStore.subtotal"
          :shipping-rate="state.shippingRate"
          :discount-amount="cartStore.discountAmount"
          :discount-code="cartStore.discountCode"
          :total="total"
        />

        <p v-if="state.error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ state.error }}
        </p>

        <button
          type="button"
          :disabled="!isFormValid || state.isLoading"
          @click="placeOrder"
          class="w-full rounded-full bg-brand-dark py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          <span v-if="state.isLoading && state.orderId">Processing…</span>
          <span v-else>Place Order · {{ formatXAF(total) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
