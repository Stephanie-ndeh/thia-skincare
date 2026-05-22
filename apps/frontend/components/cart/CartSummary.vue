<script setup lang="ts">
import { formatXAF } from '@thia/shared'

interface Props {
  subtotal: number
  discountAmount: number
  total: number
  isEmpty: boolean
  discountCode: string | null
}
const props = defineProps<Props>()
</script>

<template>
  <div class="space-y-2 py-4">
    <div class="flex justify-between font-body text-sm text-text-muted">
      <span>Subtotal</span>
      <span>{{ formatXAF(props.subtotal) }}</span>
    </div>

    <div v-if="props.discountAmount > 0" class="flex justify-between font-body text-sm text-green-700">
      <span>Discount ({{ props.discountCode }})</span>
      <span>−{{ formatXAF(props.discountAmount) }}</span>
    </div>

    <div class="flex justify-between font-body text-sm text-text-muted">
      <span>Shipping</span>
      <span class="italic">Calculated at checkout</span>
    </div>

    <div class="flex justify-between font-body text-base font-semibold text-brand-dark border-t border-brand-dark/10 pt-2 mt-2">
      <span>Total</span>
      <span>{{ formatXAF(props.total) }}</span>
    </div>

    <div class="flex flex-col gap-2 mt-4">
      <button
        class="w-full py-3 text-xs tracking-widest uppercase bg-foreground text-background disabled:opacity-50"
        :disabled="props.isEmpty"
        @click="navigateTo('/checkout')"
      >
        Proceed to Checkout
      </button>
      <button
        class="w-full py-2 text-xs tracking-widest uppercase border border-border"
        @click="navigateTo('/categories')"
      >
        Continue Shopping
      </button>
    </div>
  </div>
</template>
