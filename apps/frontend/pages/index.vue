<script setup lang="ts">
import type { Category, Testimonial } from '@thia/shared'
import { formatXAF } from '@thia/shared'
import { Heart } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

// ── Types for raw Supabase rows ──────────────────────────────────────────────

type RawCategoryWithCount = Pick<Category, 'id' | 'name' | 'slug'> & {
  image_url: string | null
  products: Array<{ count: number }>
}

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

interface HeroSettings {
  image_url: string
  cta_link: string
  cta_text: string
  headline?: string
  subheadline?: string
}

// ── Fetch site settings (hero) ───────────────────────────────────────────────

const { data: settingsRows } = await useAsyncData('homepage-settings', async () => {
  const { data } = await supabase
    .from('site_settings')
    .select('key,value')
    .in('key', ['homepage_hero'])
  return data as Array<{ key: string; value: unknown }> | null
})

const heroSettings = computed((): HeroSettings => {
  const row = settingsRows.value?.find(r => r.key === 'homepage_hero')
  const val = (row?.value ?? {}) as Partial<HeroSettings>
  return {
    image_url: val.image_url ?? '',
    cta_link: val.cta_link ?? '/categories',
    cta_text: val.cta_text ?? t('home.hero_cta'),
    headline: val.headline ?? 'The botanicals of home, into your ritual.',
    subheadline: val.subheadline ?? 'Handcrafted with African botanicals for radiant, healthy skin.',
  }
})

// ── Fetch categories ─────────────────────────────────────────────────────────

const { data: categoriesRaw } = await useAsyncData('homepage-categories', async () => {
  const { data } = await supabase
    .from('categories')
    .select('id,name,slug,image_url,products(count)')
    .order('display_order')
  return data as RawCategoryWithCount[] | null
})

const categories = computed(() => categoriesRaw.value ?? [])

function getProductCount(category: RawCategoryWithCount): number {
  return category.products?.[0]?.count ?? 0
}

// ── Fetch featured products ──────────────────────────────────────────────────

const { data: productsRaw } = await useAsyncData('featured-products', async () => {
  const { data } = await supabase
    .from('products')
    .select('id,name,slug,categories(name),product_variants(price),product_images(url,is_primary)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(8)
  return data as RawProduct[] | null
})

interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

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

// ── Hero image — featured product → first published → site settings ─────────

const { data: firstPublishedRaw } = await useAsyncData('hero-fallback', async () => {
  const { data } = await supabase
    .from('products')
    .select('id, product_images(url, is_primary)')
    .eq('is_published', true)
    .limit(1)
  return data as Array<{ id: string; product_images: RawProductImage[] }> | null
})

const heroImageUrl = computed((): string | null => {
  const featuredImg = featuredProducts.value[0]?.primaryImageUrl
  if (featuredImg) return featuredImg
  const fallback = firstPublishedRaw.value?.[0]
  const fallbackImg = fallback?.product_images?.find(i => i.is_primary)?.url
    ?? fallback?.product_images?.[0]?.url
    ?? null
  if (fallbackImg) return fallbackImg
  return heroSettings.value.image_url || null
})

// ── Fetch featured testimonials ──────────────────────────────────────────────

const { data: testimonialsRaw } = await useAsyncData('featured-testimonials', async () => {
  const { data } = await supabase
    .from('testimonials')
    .select('id,customer_name,text,photo_url,is_featured,display_order,storage_path,created_at,updated_at')
    .eq('is_featured', true)
    .order('display_order')
    .limit(6)
  return data as Testimonial[] | null
})

const testimonials = computed((): Testimonial[] => testimonialsRaw.value ?? [])

// ── Category card tonal backgrounds ─────────────────────────────────────────

const categoryBgClasses = ['bg-[#EEE8DF]', 'bg-[#DECCBA]', 'bg-[#CAAD96]', 'bg-[#B09070]']

function categoryBgClass(idx: number): string {
  return categoryBgClasses[idx % categoryBgClasses.length] ?? 'bg-sand'
}

// ── Product badge labels ──────────────────────────────────────────────────────

const badgeLabels = computed(() => [
  t('home.badge_bestseller'),
  t('home.badge_expert_pick'),
  t('home.badge_new'),
  t('home.badge_limited'),
])

function productBadge(idx: number): string {
  return badgeLabels.value[idx % badgeLabels.value.length] ?? t('home.badge_bestseller')
}

// ── SEO ──────────────────────────────────────────────────────────────────────

const { t } = useI18n()
const config = useRuntimeConfig()

const siteUrl = computed(() => config.public.siteUrl || 'https://thia.cm')

useSeoMeta({
  title: () => t('seo.home_title'),
  description: () => t('seo.home_desc'),
  ogTitle: () => t('seo.home_title'),
  ogDescription: () => t('seo.home_desc'),
  ogType: 'website',
  ogUrl: () => siteUrl.value,
  ogImage: () => heroSettings.value.image_url || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.home_title'),
  twitterDescription: () => t('seo.home_desc'),
})

useHead({
  link: [{ rel: 'canonical', href: () => siteUrl.value }],
})

// ── Animation 7 — Hero entrance ──────────────────────────────────────────────

const mounted = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

// ── Animation 1 — FadeUp (section reveals) ───────────────────────────────────

const { el: catsSectionEl, visible: catsSectionVisible } = useFadeUp()
const { el: bsSectionEl, visible: bsSectionVisible } = useFadeUp()
const { el: brandStorySectionEl, visible: brandStorySectionVisible } = useFadeUp()
const { el: ingredientSectionEl, visible: ingredientSectionVisible } = useFadeUp()
const { el: whyThiaSectionEl, visible: whyThiaSectionVisible } = useFadeUp()
const { el: testimonialsSectionEl, visible: testimonialsSectionVisible } = useFadeUp()
const { el: paymentSectionEl, visible: paymentSectionVisible } = useFadeUp()

// ── Animation 2 — Stagger (grid children) ────────────────────────────────────

const { containerEl: catsStaggerEl, visible: catsStaggerVisible } = useStagger()
const { containerEl: bsStaggerEl, visible: bsStaggerVisible } = useStagger()
const { containerEl: whyStaggerEl, visible: whyStaggerVisible } = useStagger()

// ── Animation 6 — CountUp (stats) ────────────────────────────────────────────

const { el: stat9El, current: stat9Count } = useCountUp(9)
const { el: stat100El, current: stat100Count } = useCountUp(100)

// ── Animation 11 — Rotating ingredient card ──────────────────────────────────

interface Ingredient {
  name: string
  number: string
  region: string
}

const ingredients = computed((): Ingredient[] => [
  { name: 'Shea', number: 'n°01', region: t('home.ingredient_region_1') },
  { name: 'Marula', number: 'n°02', region: t('home.ingredient_region_2') },
  { name: 'Baobab', number: 'n°03', region: t('home.ingredient_region_3') },
  { name: 'Hibiscus', number: 'n°04', region: t('home.ingredient_region_4') },
])

const ingredientIndex = ref(0)
let ingredientInterval: ReturnType<typeof setInterval>

function selectIngredient(i: number) {
  ingredientIndex.value = i
  clearInterval(ingredientInterval)
  ingredientInterval = setInterval(() => {
    ingredientIndex.value = (ingredientIndex.value + 1) % ingredients.value.length
  }, 4500)
}

onMounted(() => {
  ingredientInterval = setInterval(() => {
    ingredientIndex.value = (ingredientIndex.value + 1) % ingredients.value.length
  }, 4500)
})

onUnmounted(() => clearInterval(ingredientInterval))
</script>

<template>
  <div>

    <!-- ── 1. Hero ─────────────────────────────────────────────────────────── -->
    <section class="grid md:grid-cols-2" style="min-height: min(88vh, 720px)">
      <!-- Left: editorial content -->
      <div class="bg-cream flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 py-20 md:py-0">
        <p
          class="hero-text font-body text-[10px] tracking-[0.28em] uppercase text-terracotta mb-8"
          :class="{ mounted }"
          :style="{ '--delay': '0ms' }"
        >
          — {{ $t('home.strip_1').toUpperCase() }} —
        </p>
        <h1 class="font-heading text-[3.25rem] sm:text-6xl lg:text-[4.5rem] font-semibold text-brand-dark leading-[1.05] mb-6">
          <span
            class="hero-text block"
            :class="{ mounted }"
            :style="{ '--delay': '120ms' }"
          >{{ $t('home.hero_l1') }}</span>
          <span
            class="hero-text block"
            :class="{ mounted }"
            :style="{ '--delay': '200ms' }"
          ><em>{{ $t('home.hero_l2') }}</em></span>
          <span
            class="hero-text block"
            :class="{ mounted }"
            :style="{ '--delay': '280ms' }"
          >{{ $t('home.hero_l3') }}</span>
        </h1>
        <p
          class="hero-text font-body text-sm text-text-muted leading-relaxed mb-10 max-w-xs"
          :class="{ mounted }"
          :style="{ '--delay': '240ms' }"
        >
          {{ $t('home.tagline') }}
        </p>
        <div
          class="hero-text flex flex-wrap items-center gap-5"
          :class="{ mounted }"
          :style="{ '--delay': '360ms' }"
        >
          <NuxtLink
            :to="heroSettings.cta_link"
            class="inline-flex items-center justify-center bg-brand-dark text-cream font-body text-xs tracking-[0.18em] uppercase px-8 py-4 hover:bg-espresso transition-colors duration-200"
          >
            {{ heroSettings.cta_text }}
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="animated-link font-body text-sm text-brand-dark hover:text-terracotta transition-colors"
          >
            {{ $t('home.meet_expert') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Right: product image -->
      <div
        class="hero-image hidden md:block relative bg-sand overflow-hidden"
        :class="{ mounted }"
      >
        <NuxtImg
          v-if="heroImageUrl"
          :src="heroImageUrl"
          alt="Thia featured product"
          class="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          fetchpriority="high"
          width="600"
          height="700"
        />
        <div v-else class="absolute inset-0 flex items-center justify-center">
          <span
            class="font-heading font-semibold text-brand-dark/[0.07] leading-none pointer-events-none select-none"
            style="font-size: clamp(8rem, 18vw, 14rem);"
          >n°01</span>
        </div>
        <div class="absolute bottom-12 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 font-body text-xs tracking-widest uppercase">
          recipe n°01
        </div>
      </div>
    </section>

    <!-- ── 2. Announcement strip ──────────────────────────────────────────── -->
    <AnnouncementStrip />

    <!-- ── 3. Categories — Shop by ritual ────────────────────────────────── -->
    <section
      v-if="categories.length > 0"
      ref="catsSectionEl"
      class="fade-up py-16 sm:py-20 px-4 sm:px-8 bg-cream"
      :class="{ visible: catsSectionVisible }"
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex items-start justify-between mb-10 sm:mb-14">
          <div>
            <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-3 flex items-center gap-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              {{ $t('home.cats_eyebrow') }}
            </p>
            <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark">
              {{ $t('home.cats_title') }}
            </h2>
          </div>
          <NuxtLink
            to="/categories"
            class="animated-link hidden sm:flex items-center gap-1 font-body text-sm text-brand-dark hover:text-terracotta transition-colors mt-3 shrink-0"
          >
            {{ $t('home.cats_view_all') }} <span class="ml-1">→</span>
          </NuxtLink>
        </div>

        <div ref="catsStaggerEl" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <NuxtLink
            v-for="(category, idx) in categories.slice(0, 4)"
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="group stagger-item hover-lift"
            :class="{ visible: catsStaggerVisible }"
          >
            <!-- Portrait card with zoom -->
            <div
              class="aspect-3/4 relative zoom-image-host mb-4"
              :class="categoryBgClass(idx)"
            >
              <div class="texture-diagonal absolute inset-0" />
              <NuxtImg
                v-if="category.image_url"
                :src="category.image_url"
                :alt="category.name"
                class="zoom-image absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                width="300"
                height="400"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="font-body text-[10px] tracking-[0.35em] uppercase text-brand-dark/50">
                  {{ category.name }}
                </span>
              </div>
            </div>
            <h3 class="font-heading text-xl font-semibold text-brand-dark group-hover:text-terracotta transition-colors mb-1">
              {{ category.name }}
            </h3>
            <p class="font-body text-xs text-text-muted">
              {{ getProductCount(category) > 0
                ? `${getProductCount(category)} ${$t('common.products')}`
                : $t('common.coming_soon') }}
            </p>
          </NuxtLink>
        </div>

        <div class="sm:hidden mt-8 text-center">
          <NuxtLink
            to="/categories"
            class="animated-link font-body text-sm text-brand-dark underline underline-offset-4 hover:text-terracotta transition-colors"
          >
            {{ $t('home.cats_view_all') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── 4. Best sellers — Loved across the regions ─────────────────────── -->
    <section
      v-if="featuredProducts.length > 0"
      ref="bsSectionEl"
      class="fade-up py-16 sm:py-20 px-4 sm:px-8 bg-cream border-t border-brand-dark/[0.07]"
      :class="{ visible: bsSectionVisible }"
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

        <div ref="bsStaggerEl" class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div
            v-for="(product, idx) in featuredProducts.slice(0, 4)"
            :key="product.id"
            class="group stagger-item hover-lift"
            :class="{ visible: bsStaggerVisible }"
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

    <!-- ── 5. Brand story ─────────────────────────────────────────────────── -->
    <section
      ref="brandStorySectionEl"
      class="fade-up py-20 sm:py-24 px-4 sm:px-8 bg-espresso"
      :class="{ visible: brandStorySectionVisible }"
    >
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-end">
        <div>
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-6 flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            {{ $t('about.hero_label') }}
          </p>
          <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-white leading-[1.1] mb-8">
            {{ $t('about.brand_title') }}
          </h2>
          <p class="font-body text-sm text-white/60 leading-relaxed mb-12 max-w-md">
            {{ $t('about.brand_p1') }}
          </p>
          <!-- Stats with CountUp -->
          <div class="grid grid-cols-3 gap-6 mb-12">
            <!-- 2023 — fades with section, no countup -->
            <div>
              <p class="font-heading text-4xl sm:text-5xl font-semibold text-white">
                {{ $t('about.stats_cooperatives_num') }}
              </p>
              <p class="font-body text-[11px] text-white/45 mt-1.5 leading-tight">
                {{ $t('about.stats_cooperatives_label') }}
              </p>
            </div>
            <!-- 100% — count up -->
            <div>
              <p class="font-heading text-4xl sm:text-5xl font-semibold text-white">
                <span ref="stat100El">{{ stat100Count }}</span>%
              </p>
              <p class="font-body text-[11px] text-white/45 mt-1.5 leading-tight">
                {{ $t('about.stats_ingredients_label') }}
              </p>
            </div>
            <!-- 9 — count up -->
            <div>
              <p class="font-heading text-4xl sm:text-5xl font-semibold text-white">
                <span ref="stat9El">{{ stat9Count }}</span>
              </p>
              <p class="font-body text-[11px] text-white/45 mt-1.5 leading-tight">
                {{ $t('about.stats_founded_label') }}
              </p>
            </div>
          </div>
          <NuxtLink
            to="/about"
            class="animated-link font-body text-sm text-white/70 hover:text-white transition-colors"
          >
            {{ $t('home.meet_expert') }}
          </NuxtLink>
        </div>

        <!-- Tagline block -->
        <div class="flex items-end md:justify-end">
          <div class="bg-terracotta px-8 py-7">
            <p class="font-heading text-xl sm:text-2xl italic text-white">
              "{{ $t('home.tagline') }}"
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 6. Ingredient feature ──────────────────────────────────────────── -->
    <section
      ref="ingredientSectionEl"
      class="fade-up py-16 sm:py-24 px-4 sm:px-8 bg-cream border-t border-brand-dark/[0.07]"
      :class="{ visible: ingredientSectionVisible }"
    >
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <!-- Left: photo placeholder — keyed so it remounts on change -->
        <div
          :key="ingredientIndex"
          class="relative aspect-square bg-sand overflow-hidden flex items-center justify-center"
          style="animation: thia-fade-swap 0.5s ease-out;"
        >
          <div class="texture-diagonal absolute inset-0" />
          <span class="absolute top-4 left-4 font-body text-[10px] text-brand-dark/40 tracking-wider z-10">
            {{ ingredients[ingredientIndex].number }}
          </span>
          <span
            class="font-heading font-semibold text-brand-dark/[0.07] leading-none pointer-events-none select-none"
            style="font-size: clamp(8rem, 18vw, 14rem);"
          >
            {{ ingredients[ingredientIndex].name.charAt(0) }}
          </span>
        </div>

        <!-- Right: ingredient info -->
        <div>
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-5 flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            {{ $t('home.ingredient_eyebrow') }}
          </p>
          <h2
            :key="ingredientIndex"
            class="font-heading text-5xl sm:text-6xl font-semibold text-brand-dark mb-3"
            style="animation: thia-fade-swap 0.5s ease-out;"
          >
            {{ ingredients[ingredientIndex].name }}
          </h2>
          <p class="font-body text-xs uppercase tracking-[0.2em] text-terracotta mb-3">
            {{ ingredients[ingredientIndex].region }}
          </p>
          <p class="font-body text-sm text-text-muted leading-relaxed mb-10 max-w-sm">
            {{ $t('home.ingredient_body') }}
          </p>
          <!-- Indicator pills -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(ing, i) in ingredients"
              :key="ing.number"
              type="button"
              class="font-body text-[10px] tracking-wider uppercase px-3 py-1.5 transition-colors duration-200"
              :class="ingredientIndex === i
                ? 'bg-brand-dark text-cream'
                : 'border border-brand-dark/20 text-brand-dark hover:border-brand-dark/50'"
              @click="selectIngredient(i)"
            >
              {{ ing.number }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 7. Why Thia — 3 cards ──────────────────────────────────────────── -->
    <section
      ref="whyThiaSectionEl"
      class="fade-up py-16 sm:py-24 px-4 sm:px-8 bg-cream border-t border-brand-dark/[0.07]"
      :class="{ visible: whyThiaSectionVisible }"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14 sm:mb-20">
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center justify-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            {{ $t('home.why_thia_eyebrow') }}
          </p>
          <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark">
            {{ $t('home.why_thia_title') }}
          </h2>
        </div>

        <div ref="whyStaggerEl" class="grid sm:grid-cols-3 gap-8 sm:gap-12">
          <div
            class="stagger-item hover-lift-sm text-center"
            :class="{ visible: whyStaggerVisible }"
          >
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-brand-dark/15">
              <span class="font-body text-lg">✦</span>
            </div>
            <h3 class="font-heading text-xl font-semibold text-brand-dark mb-3">
              {{ $t('home.card_1_title') }}
            </h3>
            <p class="font-body text-sm text-text-muted leading-relaxed">
              {{ $t('home.card_1_body') }}
            </p>
          </div>
          <div
            class="stagger-item hover-lift-sm text-center"
            :class="{ visible: whyStaggerVisible }"
          >
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-brand-dark/15">
              <span class="font-body text-lg">◈</span>
            </div>
            <h3 class="font-heading text-xl font-semibold text-brand-dark mb-3">
              {{ $t('home.card_2_title') }}
            </h3>
            <p class="font-body text-sm text-text-muted leading-relaxed">
              {{ $t('home.card_2_body') }}
            </p>
          </div>
          <div
            class="stagger-item hover-lift-sm text-center"
            :class="{ visible: whyStaggerVisible }"
          >
            <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-brand-dark/15">
              <span class="font-body text-lg">◉</span>
            </div>
            <h3 class="font-heading text-xl font-semibold text-brand-dark mb-3">
              {{ $t('home.card_3_title') }}
            </h3>
            <p class="font-body text-sm text-text-muted leading-relaxed">
              {{ $t('home.card_3_body') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 8. Testimonials — What our customers say ───────────────────────── -->
    <section
      v-if="testimonials.length > 0"
      ref="testimonialsSectionEl"
      class="fade-up py-16 sm:py-20 px-4 sm:px-8 bg-brand-light"
      :class="{ visible: testimonialsSectionVisible }"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center justify-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            {{ $t('home.strip_2') }}
          </p>
          <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark">
            {{ $t('home.customers_say') }}
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestimonialCard
            v-for="testimonial in testimonials.slice(0, 3)"
            :key="testimonial.id"
            :testimonial="testimonial"
            class="hover-lift-sm"
          />
        </div>
      </div>
    </section>

    <!-- ── 9. Payment ─────────────────────────────────────────────────────── -->
    <section
      ref="paymentSectionEl"
      class="fade-up py-16 px-4 sm:px-8 bg-cream"
      :class="{ visible: paymentSectionVisible }"
    >
      <div class="max-w-4xl mx-auto border border-brand-dark/11 rounded-xl p-8 sm:p-12">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
          <div class="flex-1">
            <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center gap-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              {{ $t('home.payment_eyebrow') }}
            </p>
            <h2 class="font-heading text-2xl sm:text-3xl font-semibold text-brand-dark mb-3 leading-tight">
              {{ $t('home.mobile_money') }}
            </h2>
            <p class="font-body text-sm text-text-muted leading-relaxed max-w-sm">
              {{ $t('home.payment_body') }}
            </p>
          </div>
          <div class="flex lg:flex-col gap-2 shrink-0">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#FFCB05] text-brand-primary rounded-lg">
              <span class="font-body text-xs font-bold tracking-wider">MTN</span>
              <span class="font-body text-xs">MoMo</span>
            </div>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#F05A28] text-white rounded-lg">
              <span class="font-body text-xs font-bold tracking-wider">Orange</span>
              <span class="font-body text-xs">Money</span>
            </div>
            <div class="inline-flex items-center gap-2 px-4 py-2 border border-brand-dark/20 text-brand-dark rounded-lg">
              <span class="font-body text-[10px] text-text-muted">✕</span>
              <span class="font-body text-xs">COD</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 10. Newsletter ──────────────────────────────────────────────────── -->
    <NewsletterSection />

  </div>
</template>
