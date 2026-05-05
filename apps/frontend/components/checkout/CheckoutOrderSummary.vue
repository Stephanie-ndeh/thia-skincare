<script setup lang="ts">
import { formatXAF } from '@thia/shared'
import type { CartItemWithProduct } from '@thia/shared'

defineProps<{
  items: CartItemWithProduct[]
  subtotal: number
  shippingRate: number
  discountAmount: number
  discountCode: string | null
  total: number
}>()
</script>

<template>
  <div class="rounded-xl border border-border bg-white p-5 space-y-4">
    <h2 class="font-heading text-base font-semibold text-text-dark">Order Summary</h2>

    <!-- Items list -->
    <ul class="divide-y divide-border text-sm">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between gap-3 py-2.5"
      >
        <div class="min-w-0">
          <p class="truncate font-medium text-text-dark">{{ item.productName }}</p>
          <p class="text-xs text-text-muted">
            {{ [item.variantSizeLabel, item.variantScentLabel].filter(Boolean).join(' / ') }}
            &times; {{ item.quantity }}
          </p>
        </div>
        <span class="shrink-0 text-text-dark">
          {{ formatXAF(item.variantPrice * item.quantity) }}
        </span>
      </li>
    </ul>

    <!-- Totals -->
    <div class="space-y-1.5 border-t border-border pt-3 text-sm">
      <div class="flex justify-between text-text-muted">
        <span>Subtotal</span>
        <span>{{ formatXAF(subtotal) }}</span>
      </div>

      <div class="flex justify-between text-text-muted">
        <span>Shipping</span>
        <span v-if="shippingRate === 0" class="text-green-600 font-medium">Free</span>
        <span v-else>{{ formatXAF(shippingRate) }}</span>
      </div>

      <div v-if="discountAmount > 0" class="flex justify-between text-green-600">
        <span>Discount <span v-if="discountCode" class="font-mono text-xs">({{ discountCode }})</span></span>
        <span>- {{ formatXAF(discountAmount) }}</span>
      </div>

      <div class="flex justify-between border-t border-border pt-2 font-semibold text-text-dark">
        <span>Total</span>
        <span>{{ formatXAF(total) }}</span>
      </div>
    </div>
  </div>
</template>
