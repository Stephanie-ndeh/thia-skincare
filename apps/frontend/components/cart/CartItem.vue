<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { formatXAF } from '@thia/shared'
import type { CartItemWithProduct } from '@thia/shared'

defineProps<{
  item: CartItemWithProduct
}>()

const cartStore = useCartStore()

function variantLabel(item: CartItemWithProduct): string {
  const parts = [item.variantSizeLabel, item.variantScentLabel].filter(Boolean)
  return parts.join(' / ')
}
</script>

<template>
  <div class="flex gap-3 py-4 border-b border-brand-dark/10 last:border-0">
    <!-- Image -->
    <NuxtLink :to="`/products/${item.productSlug}`" class="shrink-0">
      <div class="w-15 h-15 rounded-lg overflow-hidden bg-brand-secondary">
        <NuxtImg
          v-if="item.primaryImageUrl"
          :src="item.primaryImageUrl"
          :alt="item.productName"
          class="w-full h-full object-cover"
          loading="lazy"
          width="60"
          height="60"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <span class="font-heading text-xl text-brand-accent/40 font-semibold">
            {{ item.productName.charAt(0) }}
          </span>
        </div>
      </div>
    </NuxtLink>

    <!-- Details -->
    <div class="flex-1 min-w-0">
      <NuxtLink :to="`/products/${item.productSlug}`">
        <p class="font-body text-sm font-semibold text-brand-dark truncate hover:text-brand-accent transition-colors">
          {{ item.productName }}
        </p>
      </NuxtLink>
      <p v-if="variantLabel(item)" class="font-body text-xs text-text-muted mt-0.5">
        {{ variantLabel(item) }}
      </p>
      <p class="font-body text-xs text-text-muted mt-0.5">{{ formatXAF(item.variantPrice) }} each</p>

      <!-- Quantity + remove -->
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-center border border-brand-dark/20 rounded-lg overflow-hidden">
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="item.quantity <= 1"
            @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
            aria-label="Decrease quantity"
          >
            <span class="text-base leading-none">−</span>
          </button>
          <span class="w-7 text-center font-body text-xs font-medium text-brand-dark select-none">
            {{ item.quantity }}
          </span>
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center text-brand-dark hover:bg-brand-light transition-colors"
            @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
            aria-label="Increase quantity"
          >
            <span class="text-base leading-none">+</span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <span class="font-body text-sm font-semibold text-brand-dark">
            {{ formatXAF(item.variantPrice * item.quantity) }}
          </span>
          <button
            type="button"
            class="text-text-muted hover:text-red-500 transition-colors"
            @click="cartStore.removeItem(item.id)"
            aria-label="Remove item"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
