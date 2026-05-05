<script setup lang="ts">
import { isValidCameroonPhone, formatXAF } from '@thia/shared'
import type { DeliveryData } from '~/components/checkout/DeliveryForm.vue'

definePageMeta({ layout: 'checkout', ssr: false, middleware: 'auth' })

const config = useRuntimeConfig()
const cartStore = useCartStore()
const supabaseUser = useSupabaseUser()
const apiBase = config.public.apiBaseUrl as string

// ── State ──────────────────────────────────────────────────────────────────

const delivery = ref<DeliveryData>({
  fullName: '',
  phone: '',
  city: '',
  address: '',
  region: '',
})

const selectedChannel = ref<'cm.mtn' | 'cm.orange'>('cm.mtn')
const shippingRate = ref(0)
const shippingZoneName = ref('Standard')
const isLoadingShipping = ref(false)
const isPlacingOrder = ref(false)
const orderError = ref<string | null>(null)

// ── Derived ────────────────────────────────────────────────────────────────

const total = computed(() =>
  Math.max(0, cartStore.subtotal - cartStore.discountAmount + shippingRate.value),
)

const isFormValid = computed(() => {
  const d = delivery.value
  return (
    d.fullName.trim() !== '' &&
    d.phone.trim() !== '' &&
    d.city.trim() !== '' &&
    d.address.trim() !== '' &&
    d.region.trim() !== '' &&
    isValidCameroonPhone(d.phone)
  )
})

// ── Shipping calculation ──────────────────────────────────────────────────

async function calculateShipping(city: string) {
  if (!city.trim()) return
  isLoadingShipping.value = true
  try {
    const result = await $fetch<{ data: { rate: number; zoneName: string; isFree: boolean } }>(
      `${apiBase}/shipping/calculate`,
      { method: 'POST', body: { city, subtotal: cartStore.subtotal } },
    )
    shippingRate.value = result.data.rate
    shippingZoneName.value = result.data.zoneName
  } catch {
    // Keep previous shipping rate on error
  } finally {
    isLoadingShipping.value = false
  }
}

// ── Place Order ───────────────────────────────────────────────────────────

async function placeOrder() {
  if (!isFormValid.value || isPlacingOrder.value) return
  orderError.value = null
  isPlacingOrder.value = true

  try {
    const orderPayload = {
      items: cartStore.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.variantPrice,
      })),
      shippingAmount: shippingRate.value,
      discountCode: cartStore.discountCode ?? undefined,
      discountAmount: cartStore.discountAmount > 0 ? cartStore.discountAmount : undefined,
      deliveryAddress: {
        fullName: delivery.value.fullName,
        phone: delivery.value.phone,
        city: delivery.value.city,
        address: delivery.value.address,
        region: delivery.value.region,
      },
    }

    const orderRes = await $fetch<{ data: { id: string } }>(
      `${apiBase}/orders`,
      {
        method: 'POST',
        body: orderPayload,
        headers: { Authorization: `Bearer ${(await useSupabaseClient().auth.getSession()).data.session?.access_token}` },
      },
    )

    const callbackUrl = `${window.location.origin}/order-confirmation`

    const paymentRes = await $fetch<{ data: { payment_url: string } }>(
      `${apiBase}/payments/initialize`,
      {
        method: 'POST',
        body: {
          orderId: orderRes.data.id,
          channel: selectedChannel.value,
          email: supabaseUser.value?.email ?? '',
          phone: delivery.value.phone,
          callbackUrl,
        },
        headers: { Authorization: `Bearer ${(await useSupabaseClient().auth.getSession()).data.session?.access_token}` },
      },
    )

    await navigateTo(paymentRes.data.payment_url, { external: true })
  } catch (err) {
    orderError.value = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
  } finally {
    isPlacingOrder.value = false
  }
}
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
          <p v-if="isLoadingShipping" class="mt-2 text-xs text-text-muted">
            Calculating shipping…
          </p>
        </section>

        <!-- Payment method -->
        <section class="rounded-xl border border-border bg-white p-5">
          <h2 class="mb-4 font-heading text-base font-semibold text-text-dark">Payment Method</h2>
          <PaymentMethodSelector v-model="selectedChannel" />
        </section>
      </div>

      <!-- Right column: order summary + CTA -->
      <div class="space-y-4">
        <CheckoutOrderSummary
          :items="cartStore.items"
          :subtotal="cartStore.subtotal"
          :shipping-rate="shippingRate"
          :discount-amount="cartStore.discountAmount"
          :discount-code="cartStore.discountCode"
          :total="total"
        />


        <p v-if="orderError" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ orderError }}
        </p>

        <button
          type="button"
          :disabled="!isFormValid || isPlacingOrder"
          @click="placeOrder"
          class="w-full rounded-full bg-brand-dark py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          <span v-if="isPlacingOrder">Processing…</span>
          <span v-else>Place Order · {{ formatXAF(total) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
