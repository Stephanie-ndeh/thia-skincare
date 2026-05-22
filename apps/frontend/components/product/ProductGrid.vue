<script setup lang="ts">
interface ProductItem {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

const props = defineProps<{
  products?: ProductItem[]
  loading?: boolean
  columns?: 2 | 3 | 4
}>()

const skeletonCount = 8
</script>

<template>
  <div
    class="grid gap-4 sm:gap-5"
    :class="{
      'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4': !props.columns || props.columns === 4,
      'grid-cols-2 sm:grid-cols-3': props.columns === 3,
      'grid-cols-2': props.columns === 2,
    }"
  >
    <!-- Skeleton placeholders -->
    <template v-if="loading">
      <ProductCard
        v-for="n in skeletonCount"
        :key="`skeleton-${n}`"
        :loading="true"
      />
    </template>

    <!-- Product cards -->
    <template v-else>
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </template>
  </div>
</template>
