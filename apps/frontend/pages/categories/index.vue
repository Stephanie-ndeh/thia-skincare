<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const { t } = useI18n()

// ── Types ────────────────────────────────────────────────────────────────────

interface RawCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  display_order: number
}

interface RawProductCategoryId {
  category_id: string
}

interface CategoryWithCount extends RawCategory {
  productCount: number
}

// ── Data fetching (unchanged) ─────────────────────────────────────────────────

const { data: categories } = await useAsyncData('categories-with-count', async () => {
  const [{ data: cats }, { data: counts }] = await Promise.all([
    supabase
      .from('categories')
      .select('id,name,slug,description,image_url,display_order')
      .order('display_order'),
    supabase
      .from('products')
      .select('category_id')
      .eq('is_published', true),
  ])

  const rawCats = (cats as RawCategory[] | null) ?? []
  const rawCounts = (counts as RawProductCategoryId[] | null) ?? []

  return rawCats.map((cat): CategoryWithCount => ({
    ...cat,
    productCount: rawCounts.filter(p => p.category_id === cat.id).length,
  }))
})

const categoryList = computed((): CategoryWithCount[] => categories.value ?? [])

// ── Sort ──────────────────────────────────────────────────────────────────────

type SortOption = 'popular' | 'new' | 'az'
const activeSort = ref<SortOption>('popular')

const sortOptions: Array<{ value: SortOption; labelKey: string }> = [
  { value: 'popular', labelKey: 'categories.popular' },
  { value: 'new', labelKey: 'categories.new' },
  { value: 'az', labelKey: 'categories.az' },
]

const sortedCategories = computed((): CategoryWithCount[] => {
  const list = [...categoryList.value]
  switch (activeSort.value) {
    case 'az':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case 'new':
      return list.reverse()
    default:
      return list
  }
})

const totalProductCount = computed(() =>
  categoryList.value.reduce((sum, c) => sum + c.productCount, 0),
)

// ── Badge assignment (stable per category, not per sorted index) ──────────────

const badgeMap = computed((): Map<string, string | null> => {
  const map = new Map<string, string | null>()
  categoryList.value.forEach((cat, idx) => {
    if (idx === 0) map.set(cat.id, 'POPULAR')
    else if (idx === 2) map.set(cat.id, 'BESTSELLER')
    else if (idx === categoryList.value.length - 1) map.set(cat.id, 'NEW')
    else map.set(cat.id, null)
  })
  return map
})

function categoryBadge(cat: CategoryWithCount): string | null {
  return badgeMap.value.get(cat.id) ?? null
}

// ── Tonal card colors ─────────────────────────────────────────────────────────

const cardColors = [
  '#D8C9B0',
  '#C9A870',
  '#B88A58',
  '#C4A070',
  '#D4BFA0',
  '#C0A880',
  '#B07850',
  '#A06840',
  '#2C1810',
]

function cardColor(idx: number): string {
  return cardColors[idx] ?? cardColors[idx % cardColors.length] ?? '#D8C9B0'
}

function cardNumberLabel(idx: number): string {
  return `n°${String(idx + 1).padStart(2, '0')}`
}

// ── SEO ──────────────────────────────────────────────────────────────────────

useHead({
  title: 'All our skincare — Thia',
  meta: [
    {
      name: 'description',
      content: 'Browse all Thia skincare categories — cleansers, moisturizers, serums, sunscreens, body care, and more. Natural skincare from Cameroon.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-cream">

    <!-- ── Page header ────────────────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.2em] text-text-muted py-4 border-b border-brand-dark/[0.07]">
        <NuxtLink to="/" class="hover:text-brand-dark transition-colors">Home</NuxtLink>
        <span class="text-text-muted/50">/</span>
        <span class="text-brand-dark">Categories</span>
      </nav>

      <!-- Eyebrow + headline + subtitle -->
      <div class="pt-10 pb-8">
        <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-5 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          {{ $t('categories.eyebrow') }}
        </p>
        <h1 class="font-heading text-[3.25rem] sm:text-6xl font-semibold text-brand-dark leading-tight mb-4">
          {{ $t('categories.page_title') }}&nbsp;<em class="text-terracotta">{{ $t('categories.page_title_italic') }}</em>.
        </h1>
        <p class="font-body text-sm text-text-muted">
          {{ $t('categories.page_subtitle') }}
        </p>
      </div>
    </div>

    <!-- ── Filter / sort bar ──────────────────────────────────────────────── -->
    <div class="border-y border-brand-dark/[0.08] bg-cream sticky top-[60px] sm:top-[96px] md:top-[140px] z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <!-- Left: active filter + count -->
        <div class="flex items-center gap-3">
          <span class="font-body text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 bg-brand-dark text-cream">
            {{ $t('categories.all') }}
          </span>
          <span class="font-body text-xs text-text-muted hidden sm:block">
            {{ totalProductCount }} products
          </span>
        </div>

        <!-- Right: sort options -->
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="font-body text-[10px] tracking-[0.2em] uppercase text-text-muted hidden sm:block">
            {{ $t('categories.sort') }}
          </span>
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            type="button"
            class="font-body text-xs px-3 py-1.5 transition-colors duration-150"
            :class="activeSort === opt.value
              ? 'bg-brand-dark text-cream'
              : 'border border-brand-dark/20 text-brand-dark hover:border-brand-dark/50'"
            @click="activeSort = opt.value"
          >
            {{ $t(opt.labelKey) }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Category grid ──────────────────────────────────────────────────── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      <div
        v-if="sortedCategories.length > 0"
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div
          v-for="(category, idx) in sortedCategories"
          :key="category.id"
          class="group cursor-pointer"
          @click="navigateTo(`/categories/${category.slug}`)"
        >
          <!-- Card image area -->
          <div
            class="aspect-[3/4] relative overflow-hidden mb-3 sm:mb-4"
            :style="{ backgroundColor: cardColor(idx) }"
          >
            <!-- Diagonal texture overlay -->
            <div class="texture-diagonal absolute inset-0" />

            <!-- Category image (if available) -->
            <NuxtImg
              v-if="category.image_url"
              :src="category.image_url"
              :alt="category.name"
              class="absolute inset-0 w-full h-full object-cover opacity-70"
              loading="lazy"
              width="400"
              height="533"
            />

            <!-- Card number top left -->
            <span class="absolute top-3 left-3 font-body text-[10px] text-white/60 tracking-wider z-10">
              {{ cardNumberLabel(idx) }}
            </span>

            <!-- Badge top right -->
            <span
              v-if="categoryBadge(category)"
              class="absolute top-3 right-3 font-body text-[9px] tracking-[0.15em] uppercase bg-espresso text-cream px-2 py-0.5 z-10"
            >
              {{ categoryBadge(category) }}
            </span>

            <!-- Watermark letter -->
            <span
              class="absolute right-4 bottom-16 font-heading font-semibold text-white/[0.14] leading-none pointer-events-none select-none transition-transform duration-300 group-hover:scale-110"
              style="font-size: clamp(5rem, 12vw, 9rem);"
            >
              {{ category.name.charAt(0).toLowerCase() }}
            </span>

            <!-- Category name on card -->
            <div class="absolute bottom-10 inset-x-0 text-center px-4">
              <span
                class="font-heading text-2xl sm:text-3xl font-semibold text-white"
                style="text-shadow: 0 2px 10px rgba(0,0,0,0.25)"
              >
                {{ category.name }}
              </span>
            </div>

            <!-- Bottom strip: product count + SHOP -->
            <div class="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2 bg-black/[0.18]">
              <span class="font-body text-[11px] text-white/70">
                {{ category.productCount > 0 ? `${category.productCount} products` : 'Coming soon' }}
              </span>
              <span class="font-body text-[10px] tracking-[0.15em] uppercase text-white transition-transform duration-200 group-hover:translate-x-0.5">
                {{ $t('categories.shop') }}
              </span>
            </div>
          </div>

          <!-- Below card: name + description -->
          <div class="px-0.5">
            <p class="font-body text-sm font-medium text-brand-dark mb-1 group-hover:text-terracotta transition-colors">
              {{ category.name }}
            </p>
            <p v-if="category.description" class="font-body text-xs text-text-muted line-clamp-2 leading-relaxed">
              {{ category.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <p class="font-body text-text-muted">No categories available yet. Check back soon.</p>
      </div>
    </div>

    <!-- ── Bottom CTA ─────────────────────────────────────────────────────── -->
    <div class="border-t border-brand-dark/[0.08] py-20 px-4 text-center bg-cream">
      <p class="font-heading text-3xl sm:text-4xl italic text-brand-dark mb-8">
        {{ $t('categories.cta_title') }}
      </p>
      <NuxtLink
        to="/categories"
        class="inline-flex items-center justify-center bg-espresso text-cream font-body text-[11px] tracking-[0.18em] uppercase px-8 py-4 hover:opacity-90 transition-opacity"
      >
        {{ $t('categories.cta_button') }}
      </NuxtLink>
    </div>

  </div>
</template>
