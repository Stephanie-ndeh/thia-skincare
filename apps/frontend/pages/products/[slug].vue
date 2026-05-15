<script setup lang="ts">
import { ShoppingBag, Loader2, Heart } from 'lucide-vue-next'
import { formatXAF } from '@thia/shared'

definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const route = useRoute()
const slug = route.params.slug as string

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawVariant {
  id: string
  sku: string
  size_label: string | null
  scent_label: string | null
  price: number
  stock_quantity: number
  display_order: number
}

interface RawImage {
  id: string
  url: string
  is_primary: boolean
  display_order: number
}

interface RawCategory {
  id: string
  name: string
  slug: string
}

interface RawProduct {
  id: string
  name: string
  slug: string
  description: string | null
  ingredients: string | null
  usage_instructions: string | null
  category_id: string
  categories: RawCategory | null
  product_variants: RawVariant[]
  product_images: RawImage[]
}

interface RelatedProduct {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

// ── Fetch product ─────────────────────────────────────────────────────────────

const { data: product } = await useAsyncData<RawProduct | null>(`product-${slug}`, async () => {
  const { data } = await supabase
    .from('products')
    .select('id,name,slug,description,ingredients,usage_instructions,category_id,categories(id,name,slug),product_variants(id,sku,size_label,scent_label,price,stock_quantity,display_order),product_images(id,url,is_primary,display_order)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return (data as RawProduct | null)
})

if (!product.value) {
  throw createError({ statusCode: 404, message: 'Product not found', fatal: true })
}

// ── Sorted variants and images ────────────────────────────────────────────────

const sortedVariants = computed(() =>
  [...(product.value?.product_variants ?? [])].sort((a, b) => a.display_order - b.display_order)
)

const sortedImages = computed(() =>
  [...(product.value?.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)
)

// ── Variant selection ─────────────────────────────────────────────────────────

const selectedVariantId = ref<string | null>(sortedVariants.value[0]?.id ?? null)

const selectedVariant = computed(() =>
  sortedVariants.value.find(v => v.id === selectedVariantId.value) ?? sortedVariants.value[0] ?? null
)

// ── Quantity ──────────────────────────────────────────────────────────────────

const quantity = ref(1)

watch(selectedVariant, () => { quantity.value = 1 })

// ── Add to cart ───────────────────────────────────────────────────────────────

const cartStore = useCartStore()
const uiStore = useUiStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

const reviewListRef = useTemplateRef<{ refresh: () => Promise<void> }>('reviewList')
const isAddingToCart = ref(false)

async function addToCart() {
  const variant = selectedVariant.value
  const prod = product.value
  if (!variant || !prod || variant.stock_quantity === 0) return

  isAddingToCart.value = true
  try {
    const primaryImg = sortedImages.value.find(i => i.is_primary) ?? sortedImages.value[0] ?? null
    cartStore.addItem({
      productId: prod.id,
      productName: prod.name,
      productSlug: prod.slug,
      variantId: variant.id,
      variantSku: variant.sku,
      variantSizeLabel: variant.size_label,
      variantScentLabel: variant.scent_label,
      variantPrice: variant.price,
      variantStock: variant.stock_quantity,
      primaryImageUrl: primaryImg?.url ?? null,
      quantity: quantity.value,
    })
    uiStore.addToast(`${prod.name} added to cart`, 'success')
  } finally {
    isAddingToCart.value = false
  }
}

// ── Related products ──────────────────────────────────────────────────────────

interface RawRelated {
  id: string
  name: string
  slug: string
  categories: { name: string } | null
  product_variants: { price: number }[]
  product_images: { url: string; is_primary: boolean }[]
}

const { data: relatedRaw } = await useAsyncData<RawRelated[]>(`related-${slug}`, async () => {
  if (!product.value) return []
  const { data } = await supabase
    .from('products')
    .select('id,name,slug,categories(name),product_variants(price),product_images(url,is_primary)')
    .eq('category_id', product.value.category_id)
    .eq('is_published', true)
    .neq('id', product.value.id)
    .limit(4)
  return (data as RawRelated[] | null) ?? []
})

const relatedProducts = computed((): RelatedProduct[] => {
  return (relatedRaw.value ?? []).map(p => {
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

// ── Breadcrumb ────────────────────────────────────────────────────────────────

const breadcrumb = computed(() => [
  { label: 'Home', href: '/' },
  ...(product.value?.categories
    ? [{ label: product.value.categories.name, href: `/categories/${product.value.categories.slug}` }]
    : []),
  { label: product.value!.name },
])

// ── SEO + JSON-LD ─────────────────────────────────────────────────────────────

const primaryImage = computed(() =>
  sortedImages.value.find(i => i.is_primary) ?? sortedImages.value[0] ?? null
)

const config = useRuntimeConfig()
const siteUrl = computed(() => config.public.siteUrl || 'https://thia.cm')

useSeoMeta({
  title: () => `${product.value!.name} — Thia Skincare`,
  description: () => (product.value!.description ?? `Shop ${product.value!.name} from Thia — natural skincare from Cameroon.`).slice(0, 160),
  ogTitle: () => `${product.value!.name} — Thia Skincare`,
  ogDescription: () => (product.value!.description ?? `Shop ${product.value!.name} from Thia.`).slice(0, 160),
  ogImage: () => primaryImage.value?.url,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: () => `${siteUrl.value}/products/${slug}` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.value!.name,
        description: product.value!.description ?? undefined,
        image: primaryImage.value?.url,
        offers: {
          '@type': 'Offer',
          price: selectedVariant.value?.price ?? 0,
          priceCurrency: 'XAF',
          availability: (selectedVariant.value?.stock_quantity ?? 0) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <div class="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <Breadcrumb :items="breadcrumb" />
      </div>

      <!-- Main product layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
        <!-- Image gallery -->
        <ProductImageGallery :images="sortedImages" />

        <!-- Product info -->
        <div class="space-y-5">
          <!-- Category link -->
          <NuxtLink
            v-if="product!.categories"
            :to="`/categories/${product!.categories.slug}`"
            class="font-body text-xs text-text-muted hover:text-brand-accent transition-colors uppercase tracking-wider"
          >
            {{ product!.categories.name }}
          </NuxtLink>

          <!-- Name -->
          <h1 class="font-heading text-3xl sm:text-4xl font-semibold text-brand-dark leading-tight">
            {{ product!.name }}
          </h1>

          <!-- Price -->
          <div class="flex items-baseline gap-3">
            <span class="font-body text-2xl font-semibold text-brand-dark">
              {{ selectedVariant ? formatXAF(selectedVariant.price) : '—' }}
            </span>
          </div>

          <!-- Variant selector -->
          <VariantSelector
            v-if="sortedVariants.length > 1"
            :variants="sortedVariants"
            :model-value="selectedVariantId"
            @update:model-value="selectedVariantId = $event"
          />

          <!-- Stock -->
          <StockIndicator
            v-if="selectedVariant"
            :stock="selectedVariant.stock_quantity"
          />

          <!-- Quantity + Add to cart -->
          <div class="flex items-center gap-3 flex-wrap">
            <QuantitySelector
              v-model="quantity"
              :max="selectedVariant?.stock_quantity ?? 1"
              :disabled="!selectedVariant || selectedVariant.stock_quantity === 0"
            />

            <button
              type="button"
              class="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-body text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="selectedVariant && selectedVariant.stock_quantity > 0
                ? 'bg-brand-dark text-white hover:bg-brand-accent'
                : 'bg-brand-dark/10 text-text-muted cursor-not-allowed'"
              :disabled="!selectedVariant || selectedVariant.stock_quantity === 0 || isAddingToCart"
              @click="addToCart"
            >
              <Loader2 v-if="isAddingToCart" class="w-4 h-4 animate-spin" />
              <ShoppingBag v-else class="w-4 h-4" />
              {{ selectedVariant && selectedVariant.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>

            <!-- Wishlist toggle (authenticated users only) -->
            <button
              v-if="authStore.isAuthenticated"
              type="button"
              class="flex items-center justify-center w-12 h-12 rounded-lg border border-brand-dark/20 hover:border-brand-accent transition-colors shrink-0"
              :aria-label="wishlistStore.isWishlisted(product!.id) ? 'Remove from wishlist' : 'Add to wishlist'"
              @click="wishlistStore.toggleWishlist(product!.id)"
            >
              <Heart
                class="w-5 h-5 transition-colors"
                :class="wishlistStore.isWishlisted(product!.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-brand-dark'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs: Description, Ingredients, How to Use -->
      <div class="bg-white rounded-xl p-6 sm:p-8 mb-12">
        <ProductTabs
          :description="product!.description"
          :ingredients="product!.ingredients"
          :usage="product!.usage_instructions"
        />
      </div>

      <!-- Reviews -->
      <div class="bg-white rounded-xl p-6 sm:p-8 mb-12">
        <ReviewList ref="reviewList" :product-id="product!.id" />

        <div class="mt-8 border-t border-brand-dark/10 pt-8">
          <WriteReviewForm
            v-if="authStore.isAuthenticated"
            :product-id="product!.id"
            @submitted="reviewListRef?.refresh()"
          />
          <p v-else class="text-sm text-text-muted">
            <NuxtLink
              to="/auth/login"
              class="font-medium text-brand-dark hover:underline"
            >
              Login
            </NuxtLink>
            to write a review
          </p>
        </div>
      </div>

      <!-- Related products -->
      <div v-if="relatedProducts.length > 0">
        <h2 class="font-heading text-2xl font-semibold text-brand-dark mb-6">
          You might also like
        </h2>
        <ProductGrid :products="relatedProducts" :columns="4" />
      </div>
    </div>
  </div>
</template>
