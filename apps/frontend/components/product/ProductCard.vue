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

const props = defineProps<{
  product?: ProductCardData
  loading?: boolean
}>()
</script>

<template>
  <!-- Skeleton state -->
  <div
    v-if="loading || !product"
    class="flex flex-col rounded-lg overflow-hidden bg-white animate-pulse"
  >
    <div class="aspect-[4/5] bg-gray-200 w-full" />
    <div class="p-3 space-y-2">
      <div class="h-3 bg-gray-200 rounded w-1/3" />
      <div class="h-4 bg-gray-200 rounded w-3/4" />
      <div class="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>

  <!-- Card state -->
  <NuxtLink
    v-else
    :to="`/products/${product.slug}`"
    class="group flex flex-col rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-200"
  >
    <div class="aspect-[4/5] overflow-hidden bg-brand-secondary relative">
      <NuxtImg
        v-if="product.primaryImageUrl"
        :src="product.primaryImageUrl"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        width="400"
        height="500"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <span class="font-heading text-4xl font-semibold text-brand-accent/30">
          {{ product.name.charAt(0) }}
        </span>
      </div>
    </div>

    <div class="p-3 flex flex-col gap-1">
      <Badge variant="secondary" class="self-start text-xs">
        {{ product.categoryName }}
      </Badge>
      <h3 class="font-body text-sm font-medium text-brand-dark leading-snug line-clamp-2">
        {{ product.name }}
      </h3>
      <p class="font-body text-sm text-brand-accent font-semibold">
        {{ formatXAF(product.price) }}
      </p>
    </div>
  </NuxtLink>
</template>
