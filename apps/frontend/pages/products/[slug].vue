<script setup lang="ts">
import { ShoppingBag, Loader2, Heart } from 'lucide-vue-next'
import { formatXAF } from '@thia/shared'

definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const route = useRoute()
const { t } = useI18n()
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
  is_featured: boolean
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
    .select('id,name,slug,description,ingredients,usage_instructions,category_id,is_featured,categories(id,name,slug),product_variants(id,sku,size_label,scent_label,price,stock_quantity,display_order),product_images(id,url,is_primary,display_order)')
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

// Unique size variants (one per unique size_label)
const sizeVariants = computed(() => {
  const seen = new Set<string>()
  return sortedVariants.value.filter(v => {
    if (v.size_label && !seen.has(v.size_label)) {
      seen.add(v.size_label)
      return true
    }
    return false
  })
})

// Unique scent variants (one per unique scent_label)
const scentVariants = computed(() => {
  const seen = new Set<string>()
  return sortedVariants.value.filter(v => {
    if (v.scent_label && !seen.has(v.scent_label)) {
      seen.add(v.scent_label)
      return true
    }
    return false
  })
})

function selectBySize(size: string) {
  const current = selectedVariant.value
  const match =
    sortedVariants.value.find(v =>
      v.size_label === size && (current?.scent_label === null || v.scent_label === current?.scent_label)
    ) ?? sortedVariants.value.find(v => v.size_label === size)
  if (match) selectedVariantId.value = match.id
}

function selectByScent(scent: string) {
  const current = selectedVariant.value
  const match =
    sortedVariants.value.find(v =>
      v.scent_label === scent && (current?.size_label === null || v.size_label === current?.size_label)
    ) ?? sortedVariants.value.find(v => v.scent_label === scent)
  if (match) selectedVariantId.value = match.id
}

function variantLabel(v: RawVariant): string {
  if (v.size_label === '15ml') return t('product.travel')
  if (v.size_label === '30ml') return t('product.daily')
  if (v.size_label === '50ml') return t('product.refill')
  return ''
}

// ── Quantity ──────────────────────────────────────────────────────────────────

const quantity = ref(1)

watch(selectedVariant, () => { quantity.value = 1 })

function decreaseQty() {
  if (quantity.value > 1) quantity.value--
}

function increaseQty() {
  const max = selectedVariant.value?.stock_quantity ?? 1
  if (quantity.value < max) quantity.value++
}

// ── Derived product state ─────────────────────────────────────────────────────

const inStock = computed(() => (selectedVariant.value?.stock_quantity ?? 0) > 0)

const lineTotal = computed(() => (selectedVariant.value?.price ?? 0) * quantity.value)

const pricePerMl = computed((): number | null => {
  const v = selectedVariant.value
  if (!v?.size_label) return null
  const num = parseFloat(v.size_label.replace(/[^0-9.]/g, ''))
  if (!num || isNaN(num)) return null
  return Math.round(v.price / num)
})

const productTagline = computed((): string => {
  if (!product.value?.description) return ''
  const first = product.value.description.split('.')[0] ?? ''
  return first.length > 70 ? first.substring(0, 70) + '...' : first
})

const isFeatured = computed(() => product.value?.is_featured ?? false)

// ── Add to cart ───────────────────────────────────────────────────────────────

const cartStore = useCartStore()
const uiStore = useUiStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

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

// ── Review summary ────────────────────────────────────────────────────────────

interface ReviewRating {
  rating: number
}

const { data: reviewSummary } = await useAsyncData(`review-summary-${slug}`, async () => {
  if (!product.value) return { avg: 0, count: 0 }
  const { data, count } = await supabase
    .from('reviews')
    .select('rating', { count: 'exact' })
    .eq('product_id', product.value.id)
    .eq('status', 'approved')
    .limit(1000)
  const ratings = (data as ReviewRating[] | null) ?? []
  const avg = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : 0
  return { avg: Math.round(avg * 10) / 10, count: count ?? 0 }
})

const averageRating = computed(() => reviewSummary.value?.avg ?? 0)
const reviewCount = computed(() => reviewSummary.value?.count ?? 0)

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
          availability: inStock.value
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-cream">

    <!-- ── Breadcrumb (full width) ────────────────────────────────────────── -->
    <nav class="border-b border-brand-dark/[0.08] bg-cream">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.2em] text-text-muted">
        <NuxtLink to="/" class="hover:text-brand-dark transition-colors">Home</NuxtLink>
        <span class="text-text-muted/40">/</span>
        <NuxtLink
          v-if="product!.categories"
          :to="`/categories/${product!.categories.slug}`"
          class="hover:text-brand-dark transition-colors"
        >
          {{ product!.categories.name }}
        </NuxtLink>
        <span v-if="product!.categories" class="text-text-muted/40">/</span>
        <span class="text-brand-dark">{{ product!.name }}</span>
      </div>
    </nav>

    <!-- ── Main two-column layout ─────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      <div class="grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-10 lg:gap-16 mb-16 lg:mb-20">

        <!-- Left 45%: Image gallery -->
        <ProductImageGallery
          :images="sortedImages"
          :badge="isFeatured ? $t('product.bestseller') : null"
        />

        <!-- Right 55%: Product info -->
        <div>

          <!-- Eyebrow -->
          <p
            v-if="product!.categories"
            class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-3 flex items-center gap-2"
          >
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            {{ product!.categories.name }}
          </p>

          <!-- Product name -->
          <h1 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark leading-tight mb-2">
            {{ product!.name }}<span class="text-terracotta">.</span>
          </h1>

          <!-- Italic tagline from first sentence of description -->
          <p
            v-if="productTagline"
            class="font-heading italic text-terracotta text-lg mb-5"
          >
            "{{ productTagline }}"
          </p>

          <!-- Rating + stock row -->
          <div class="flex items-center gap-3 mb-5 flex-wrap">
            <StarRating :rating="averageRating" size="sm" />
            <span class="font-body text-xs text-text-muted">
              {{ averageRating > 0 ? averageRating.toFixed(1) : '—' }}
              <template v-if="reviewCount > 0">· {{ reviewCount }} {{ reviewCount === 1 ? 'review' : 'reviews' }}</template>
            </span>
            <span class="text-text-muted/40">·</span>
            <span class="flex items-center gap-1.5 font-body text-xs">
              <span
                class="w-2 h-2 rounded-full inline-block shrink-0"
                :class="inStock ? 'bg-green-500' : 'bg-red-400'"
              />
              <span :class="inStock ? 'text-green-700' : 'text-red-600'">
                {{ inStock ? $t('product.in_stock') : $t('product.out_of_stock') }}
              </span>
              <span class="text-text-muted">· {{ $t('product.ships_from') }}</span>
            </span>
          </div>

          <!-- Short description -->
          <p
            v-if="product!.description"
            class="font-body text-sm text-text-muted leading-relaxed mb-6 max-w-md"
          >
            {{ product!.description }}
          </p>

          <div class="border-t border-brand-dark/[0.08] pt-6 mb-6">
            <!-- Price row -->
            <div class="flex items-baseline gap-3 mb-6">
              <span class="font-heading text-4xl font-semibold text-brand-dark">
                {{ selectedVariant ? formatXAF(selectedVariant.price) : '—' }}
              </span>
              <span
                v-if="pricePerMl"
                class="font-body text-xs text-text-muted"
              >
                {{ formatXAF(pricePerMl) }} / ml
              </span>
            </div>

            <!-- Size selector -->
            <div v-if="sizeVariants.length > 1" class="mb-5">
              <p class="font-body text-[10px] tracking-[0.2em] uppercase text-brand-dark mb-3">
                {{ $t('product.size') }}<template v-if="selectedVariant?.size_label"> · {{ selectedVariant.size_label.toUpperCase() }} ·</template>
              </p>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="v in sizeVariants"
                  :key="v.id"
                  type="button"
                  class="px-4 py-3 border text-left transition-all min-w-[90px]"
                  :class="selectedVariant?.size_label === v.size_label
                    ? 'border-espresso bg-espresso text-cream'
                    : 'border-brand-dark/20 hover:border-espresso text-brand-dark'"
                  @click="selectBySize(v.size_label!)"
                >
                  <div class="font-body text-sm font-medium">{{ v.size_label }}</div>
                  <div
                    class="font-body text-[10px] mt-0.5 leading-tight"
                    :class="selectedVariant?.size_label === v.size_label ? 'text-cream/70' : 'text-text-muted'"
                  >
                    {{ variantLabel(v) }}
                  </div>
                  <div class="font-body text-xs font-medium mt-1">{{ formatXAF(v.price) }}</div>
                </button>
              </div>
            </div>

            <!-- Scent selector -->
            <div v-if="scentVariants.length > 1" class="mb-5">
              <p class="font-body text-[10px] tracking-[0.2em] uppercase text-brand-dark mb-3">
                {{ $t('product.scent') }}<template v-if="selectedVariant?.scent_label"> · {{ selectedVariant.scent_label.toUpperCase() }} ·</template>
              </p>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="v in scentVariants"
                  :key="v.id"
                  type="button"
                  class="px-4 py-2 border font-body text-sm transition-all"
                  :class="selectedVariant?.scent_label === v.scent_label
                    ? 'border-espresso bg-espresso text-cream'
                    : 'border-brand-dark/20 hover:border-espresso text-brand-dark'"
                  @click="selectByScent(v.scent_label!)"
                >
                  {{ v.scent_label }}
                </button>
              </div>
            </div>

            <!-- Quantity + Add to cart -->
            <div class="flex gap-3 mb-3">
              <!-- Qty stepper -->
              <div class="flex items-center border border-brand-dark/20 shrink-0">
                <button
                  type="button"
                  class="w-11 h-11 flex items-center justify-center hover:bg-brand-dark/5 transition-colors text-brand-dark disabled:opacity-40"
                  :disabled="quantity <= 1"
                  aria-label="Decrease quantity"
                  @click="decreaseQty"
                >
                  <span class="text-lg leading-none">−</span>
                </button>
                <span class="w-10 text-center font-body text-sm font-medium text-brand-dark select-none">
                  {{ quantity }}
                </span>
                <button
                  type="button"
                  class="w-11 h-11 flex items-center justify-center hover:bg-brand-dark/5 transition-colors text-brand-dark disabled:opacity-40"
                  :disabled="quantity >= (selectedVariant?.stock_quantity ?? 1)"
                  aria-label="Increase quantity"
                  @click="increaseQty"
                >
                  <span class="text-lg leading-none">+</span>
                </button>
              </div>

              <!-- Add to cart -->
              <button
                type="button"
                class="flex-1 h-11 bg-espresso text-cream font-body text-[10px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!inStock || isAddingToCart"
                @click="addToCart"
              >
                <Loader2 v-if="isAddingToCart" class="w-4 h-4 animate-spin" />
                <ShoppingBag v-else class="w-4 h-4" />
                <span v-if="inStock">{{ $t('product.add_to_cart') }} · {{ formatXAF(lineTotal) }}</span>
                <span v-else>{{ $t('product.out_of_stock') }}</span>
              </button>
            </div>

            <!-- Add to wishlist -->
            <button
              type="button"
              class="w-full h-10 border border-brand-dark/20 text-brand-dark font-body text-[10px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 hover:border-espresso transition-colors mb-6"
              @click="wishlistStore.toggleWishlist(product!.id)"
            >
              <Heart
                class="w-4 h-4 transition-colors"
                :class="wishlistStore.isWishlisted(product!.id)
                  ? 'fill-terracotta text-terracotta'
                  : 'text-brand-dark'"
              />
              {{ wishlistStore.isWishlisted(product!.id)
                ? $t('product.remove_from_wishlist')
                : $t('product.add_to_wishlist') }}
            </button>
          </div>

          <!-- Delivery + payment row -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-brand-dark/[0.08] mb-6">
            <div>
              <p class="font-body text-[9px] tracking-[0.2em] uppercase text-brand-dark mb-1.5">
                {{ $t('product.delivery') }}
              </p>
              <p class="font-body text-xs text-text-muted leading-relaxed">
                {{ $t('product.free_delivery') }}
              </p>
            </div>
            <div>
              <p class="font-body text-[9px] tracking-[0.2em] uppercase text-brand-dark mb-1.5">
                {{ $t('product.we_accept') }}
              </p>
              <div class="flex gap-1.5 flex-wrap">
                <span class="inline-flex items-center bg-[#FFCB05] text-[#1a1a1a] font-body text-[9px] font-bold px-2 py-1">MTN</span>
                <span class="inline-flex items-center bg-[#F05A28] text-white font-body text-[9px] font-bold px-2 py-1">Orange</span>
                <span class="inline-flex items-center bg-brand-dark/8 text-text-muted font-body text-[9px] px-2 py-1">COD</span>
              </div>
            </div>
          </div>

          <!-- Trust badges -->
          <div class="grid grid-cols-3 gap-3 pt-4 border-t border-brand-dark/[0.08]">
            <div class="text-center">
              <p class="font-body text-[10px] font-medium text-brand-dark mb-1">
                01 {{ $t('product.trust_1_title') }}
              </p>
              <p class="font-body text-[10px] text-text-muted leading-tight">
                {{ $t('product.trust_1_body') }}
              </p>
            </div>
            <div class="text-center">
              <p class="font-body text-[10px] font-medium text-brand-dark mb-1">
                02 {{ $t('product.trust_2_title') }}
              </p>
              <p class="font-body text-[10px] text-text-muted leading-tight">
                {{ $t('product.trust_2_body') }}
              </p>
            </div>
            <div class="text-center">
              <p class="font-body text-[10px] font-medium text-brand-dark mb-1">
                03 {{ $t('product.trust_3_title') }}
              </p>
              <p class="font-body text-[10px] text-text-muted leading-tight">
                {{ $t('product.trust_3_body') }}
              </p>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Tabs: Description | Ingredients | How to Use | Reviews ──────── -->
      <div class="border-t border-brand-dark/[0.07] pt-10 sm:pt-14 mb-16 sm:mb-20">
        <ProductTabs
          :description="product!.description"
          :ingredients="product!.ingredients"
          :usage="product!.usage_instructions"
          :product-id="product!.id"
          :is-authenticated="authStore.isAuthenticated"
        />
      </div>

      <!-- ── You might also like ─────────────────────────────────────────── -->
      <div v-if="relatedProducts.length > 0">
        <div class="flex items-center gap-3 mb-8">
          <span class="font-heading text-3xl text-terracotta leading-none">§</span>
          <h2 class="font-heading text-3xl font-semibold text-brand-dark">
            {{ $t('product.you_might_like') }}
          </h2>
        </div>
        <ProductGrid :products="relatedProducts" :columns="4" />
      </div>

    </div>
  </div>
</template>
