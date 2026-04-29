<script setup lang="ts">
import { formatXAF } from '@thia/shared'

const cartStore = useCartStore()
</script>

<template>
  <div class="space-y-2 py-4">
    <div class="flex justify-between font-body text-sm text-text-muted">
      <span>Subtotal</span>
      <span>{{ formatXAF(cartStore.subtotal) }}</span>
    </div>

    <div v-if="cartStore.discountAmount > 0" class="flex justify-between font-body text-sm text-green-700">
      <span>Discount ({{ cartStore.discountCode }})</span>
      <span>−{{ formatXAF(cartStore.discountAmount) }}</span>
    </div>

    <div class="flex justify-between font-body text-sm text-text-muted">
      <span>Shipping</span>
      <span class="italic">Calculated at checkout</span>
    </div>

    <div class="flex justify-between font-body text-base font-semibold text-brand-dark border-t border-brand-dark/10 pt-2 mt-2">
      <span>Total</span>
      <span>{{ formatXAF(cartStore.total) }}</span>
    </div>
  </div>
</template>
