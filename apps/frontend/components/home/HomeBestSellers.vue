<script setup lang="ts">
import { formatXAF } from '@thia/shared'
import { Heart } from 'lucide-vue-next'

interface RawProductVariant {
  price: number
}

interface RawProductImage {
  url: string
  is_primary: boolean
}

interface RawCategoryName {
  name: string
}

interface RawProduct {
  id: string
  name: string
  slug: string
  categories: RawCategoryName | null
  product_variants: RawProductVariant[]
  product_images: RawProductImage[]
}

interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

const supabase = useSupabaseClient()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const { t } = useI18n()

const { data: productsRaw } = await useAsyncData('featured-products', async () => {
  const { data } = await supabase
    .from('products')
    .select('id,name,slug,categories(name),product_variants(price),product_images(url,is_primary)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(8)
  return data as RawProduct[] | null
})

const featuredProducts = computed((): ProductCardData[] => {
  return (productsRaw.value ?? []).map(p => {
    const prices = p.product_variants.map(v => v.price)
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0
    const primaryImg = p.product_images.find(i => i.is_primary) ?? p.product_images[0] ?? null
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: lowestPrice,
      categoryName: p.categories?.name ?? '',
      primaryImageUrl: primaryImg?.url ?? null,
    }
  })
})

const badgeLabels = computed(() => [
  t('home.badge_bestseller'),
  t('home.badge_expert_pick'),
  t('home.badge_new'),
  t('home.badge_limited'),
])

function productBadge(idx: number): string {
  return badgeLabels.value[idx % badgeLabels.value.length] ?? t('home.badge_bestseller')
}

const { el: sectionEl, visible: sectionVisible } = useFadeUp()
const { containerEl: staggerEl, visible: staggerVisible } = useStagger()
</script>

<template>
  <section
    v-if="featuredProducts.length > 0"
    ref="sectionEl"
    class="fade-up py-16 sm:py-20 px-4 sm:px-8 bg-cream border-t border-brand-dark/[0.07]"
    :class="{ visible: sectionVisible }"
  >
    <div class="max-w-7xl mx-auto">
      <div class="mb-10 sm:mb-14">
        <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-3 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          {{ $t('home.best_sellers') }}
        </p>
        <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark">
          {{ $t('home.bs_title') }}
        </h2>
      </div>

      <div ref="staggerEl" class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div
          v-for="(product, idx) in featuredProducts.slice(0, 4)"
          :key="product.id"
          class="group stagger-item hover-lift"
          :class="{ visible: staggerVisible }"
        >
          <!-- Image area with zoom (linked) -->
          <NuxtLink :to="`/products/${product.slug}`" class="block relative aspect-square zoom-image-host bg-sand mb-3">
            <div class="texture-diagonal absolute inset-0" />
            <NuxtImg
              v-if="product.primaryImageUrl"
              :src="product.primaryImageUrl"
              :alt="product.name"
              class="zoom-image absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              width="400"
              height="400"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <span class="font-body text-[9px] tracking-[0.3em] uppercase text-brand-dark/30">
                {{ product.name }}
              </span>
            </div>
            <!-- Badge -->
            <div class="absolute top-2 left-2">
              <span class="font-body text-[9px] tracking-[0.12em] uppercase bg-brand-dark text-white px-2 py-0.5">
                {{ productBadge(idx) }}
              </span>
            </div>
            <!-- Wishlist -->
            <button
              v-if="authStore.isAuthenticated"
              type="button"
              class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
              aria-label="Toggle wishlist"
              @click.prevent="wishlistStore.toggleWishlist(product.id)"
            >
              <Heart
                class="w-3.5 h-3.5 transition-colors"
                :class="wishlistStore.isWishlisted(product.id) ? 'fill-red-500 text-red-500' : 'text-brand-dark'"
              />
            </button>
          </NuxtLink>

          <!-- Info (linked) -->
          <NuxtLink :to="`/products/${product.slug}`" class="block mb-3">
            <div class="flex items-baseline justify-between gap-2 mb-0.5">
              <h3 class="font-heading text-base font-semibold text-brand-dark leading-snug group-hover:text-terracotta transition-colors line-clamp-1">
                {{ product.name }}
              </h3>
              <span class="font-body text-sm font-medium text-brand-dark shrink-0">
                {{ formatXAF(product.price) }}
              </span>
            </div>
            <p class="font-body text-xs text-text-muted">{{ product.categoryName }}</p>
          </NuxtLink>

          <!-- Add to cart -->
          <NuxtLink
            :to="`/products/${product.slug}`"
            class="block border border-brand-dark/25 text-brand-dark font-body text-[10px] tracking-[0.18em] uppercase py-2.5 text-center hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-colors duration-200"
          >
            + {{ $t('product.add_to_cart') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
