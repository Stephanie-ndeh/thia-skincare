<script setup lang="ts">
import { formatXAF } from '@thia/shared'

defineProps<{
  product: {
    name: string
    slug: string
    price: number
    primaryImageUrl: string | null
  }
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-light transition-colors"
  >
    <div class="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-brand-secondary">
      <NuxtImg
        v-if="product.primaryImageUrl"
        :src="product.primaryImageUrl"
        :alt="product.name"
        class="w-full h-full object-cover"
        loading="lazy"
        width="40"
        height="40"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="font-heading text-sm text-brand-accent/40 font-semibold">
          {{ product.name.charAt(0) }}
        </span>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <p class="font-body text-sm text-brand-dark truncate">{{ product.name }}</p>
      <p class="font-body text-xs text-text-muted">{{ formatXAF(product.price) }}</p>
    </div>
  </NuxtLink>
</template>
