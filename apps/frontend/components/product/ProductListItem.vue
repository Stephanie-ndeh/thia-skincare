<script setup lang="ts">
import { formatXAF } from '@thia/shared'

interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

defineProps<{
  product: ProductCardData
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="group flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
  >
    <!-- Image -->
    <div class="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-brand-secondary">
      <NuxtImg
        v-if="product.primaryImageUrl"
        :src="product.primaryImageUrl"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        width="128"
        height="128"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="font-heading text-3xl text-brand-accent/40 font-semibold">
          {{ product.name.charAt(0) }}
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <p class="font-body text-xs text-text-muted mb-1">{{ product.categoryName }}</p>
      <h3 class="font-body text-base font-semibold text-brand-dark group-hover:text-brand-accent transition-colors truncate">
        {{ product.name }}
      </h3>
      <p class="font-body text-sm font-medium text-brand-dark mt-2">
        {{ formatXAF(product.price) }}
      </p>
    </div>

    <!-- Arrow -->
    <svg class="shrink-0 w-5 h-5 text-text-muted group-hover:text-brand-accent transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </NuxtLink>
</template>
