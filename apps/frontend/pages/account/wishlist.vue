<script setup lang="ts">
import { Heart } from 'lucide-vue-next'

definePageMeta({ layout: 'default', ssr: false, middleware: 'auth' })

const wishlistStore = useWishlistStore()

interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

const wishlistProducts = computed((): ProductCardData[] =>
  wishlistStore.items
    .filter((item) => item.product !== null)
    .map((item) => ({
      id: item.product!.id,
      name: item.product!.name,
      slug: item.product!.slug,
      price: item.product!.lowestPrice,
      categoryName: item.product!.categoryName,
      primaryImageUrl: item.product!.primaryImageUrl,
    })),
)

onMounted(() => {
  wishlistStore.fetchWishlist()
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="lg:flex lg:items-start lg:gap-8">
      <AccountSidebar />

      <div class="min-w-0 flex-1">
        <h1 class="mb-6 font-heading text-2xl font-semibold text-brand-dark">
          My Wishlist
        </h1>

        <!-- Loading skeleton -->
        <div v-if="wishlistStore.isLoading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <ProductCard v-for="n in 4" :key="n" loading />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="wishlistProducts.length === 0"
          class="flex flex-col items-center gap-4 rounded-xl bg-white py-16 text-center"
        >
          <Heart class="h-12 w-12 text-brand-dark/20" />
          <p class="font-body text-text-muted">Your wishlist is empty</p>
          <NuxtLink
            to="/products"
            class="rounded-lg bg-brand-dark px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-brand-accent transition-colors"
          >
            Browse Products
          </NuxtLink>
        </div>

        <!-- Product grid -->
        <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <ProductCard
            v-for="product in wishlistProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </div>
  </div>
</template>
