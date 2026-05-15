<script setup lang="ts">
import { LayoutGrid, List } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const route = useRoute()
const slug = route.params.slug as string

const { sortBy, minPrice, maxPrice, page, viewMode, updateFilters, clearFilters, activeFilters } =
  useProductFilters()

// ── Types ────────────────────────────────────────────────────────────────────

interface RawCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

interface RawAllCategory {
  id: string
  name: string
  slug: string
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

interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

interface PageData {
  category: RawCategory
  products: ProductCardData[]
  allCategories: RawAllCategory[]
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

const { data: pageData } = await useAsyncData<PageData | null>(`category-${slug}`, async () => {
  const { data: cat } = await supabase
    .from('categories')
    .select('id,name,slug,description,image_url')
    .eq('slug', slug)
    .single()

  if (!cat) return null
  const category = cat as RawCategory

  const [{ data: prods }, { data: allCats }] = await Promise.all([
    supabase
      .from('products')
      .select('id,name,slug,categories(name),product_variants(price),product_images(url,is_primary)')
      .eq('category_id', category.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),

    supabase
      .from('categories')
      .select('id,name,slug')
      .order('display_order'),
  ])

  const rawProducts = (prods as RawProduct[] | null) ?? []
  const products: ProductCardData[] = rawProducts.map(p => {
    const prices = p.product_variants.map(v => v.price)
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0
    const primaryImg = p.product_images.find(i => i.is_primary) ?? p.product_images[0] ?? null
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: lowestPrice,
      categoryName: p.categories?.name ?? category.name,
      primaryImageUrl: primaryImg?.url ?? null,
    }
  })

  return {
    category,
    products,
    allCategories: (allCats as RawAllCategory[] | null) ?? [],
  }
})

// ── 404 guard ────────────────────────────────────────────────────────────────

if (!pageData.value) {
  throw createError({ statusCode: 404, message: 'Category not found', fatal: true })
}

// ── Client-side filter + sort + paginate ──────────────────────────────────────

const PAGE_SIZE = 12

const filteredProducts = computed((): ProductCardData[] => {
  let result = [...(pageData.value?.products ?? [])]

  if (minPrice.value !== null) {
    result = result.filter(p => p.price >= minPrice.value!)
  }
  if (maxPrice.value !== null) {
    result = result.filter(p => p.price <= maxPrice.value!)
  }

  switch (sortBy.value) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      break
  }

  return result
})

const totalCount = computed(() => filteredProducts.value.length)
const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredProducts.value.slice(start, start + PAGE_SIZE)
})

const showingFrom = computed(() => (page.value - 1) * PAGE_SIZE + 1)
const showingTo = computed(() => Math.min(page.value * PAGE_SIZE, totalCount.value))

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

// ── Derived ───────────────────────────────────────────────────────────────────

const category = computed(() => pageData.value!.category)
const allCategories = computed(() => pageData.value!.allCategories)

const breadcrumb = computed(() => [
  { label: 'Home', href: '/' },
  { label: category.value.name },
])

const filterState = computed(() => ({
  sortBy: sortBy.value,
  minPrice: minPrice.value,
  maxPrice: maxPrice.value,
}))

// ── SEO ──────────────────────────────────────────────────────────────────────

const config = useRuntimeConfig()
const siteUrl = computed(() => config.public.siteUrl || 'https://thia.cm')

useSeoMeta({
  title: () => `${category.value.name} — Thia Skincare`,
  description: () => category.value.description ?? `Shop ${category.value.name} products from Thia — natural skincare from Cameroon.`,
  ogTitle: () => `${category.value.name} — Thia Skincare`,
  ogDescription: () => category.value.description ?? `Shop ${category.value.name} products from Thia.`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: () => `${siteUrl.value}/categories/${slug}` }],
})
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <!-- Category hero -->
    <div
      class="relative bg-brand-dark overflow-hidden"
      :class="category.image_url ? 'min-h-[240px] sm:min-h-[300px]' : 'py-12 sm:py-16'"
    >
      <NuxtImg
        v-if="category.image_url"
        :src="category.image_url"
        :alt="category.name"
        class="absolute inset-0 w-full h-full object-cover opacity-30"
        loading="eager"
        fetchpriority="high"
        width="1440"
        height="300"
      />
      <div v-if="category.image_url" class="absolute inset-0 bg-brand-dark/60" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div class="mb-4">
          <Breadcrumb
            :items="breadcrumb"
            class="[&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-white/50"
          />
        </div>
        <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-3">
          {{ category.name }}
        </h1>
        <p v-if="category.description" class="font-body text-sm sm:text-base text-white/75 max-w-xl">
          {{ category.description }}
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <!-- Sort + view toggle toolbar -->
      <div class="flex items-center justify-between gap-3 mb-6">
        <span class="font-body text-sm text-text-muted">
          <template v-if="totalCount > 0">
            Showing {{ showingFrom }}–{{ showingTo }} of {{ totalCount }}
            {{ totalCount === 1 ? 'product' : 'products' }}
          </template>
        </span>

        <div class="flex items-center gap-3">
          <ProductSortSelect
            :model-value="sortBy"
            @update:model-value="updateFilters({ sort: $event })"
          />

          <div class="flex items-center border border-brand-dark/20 rounded-lg overflow-hidden">
            <button
              type="button"
              class="p-2 transition-colors"
              :class="viewMode === 'grid' ? 'bg-brand-dark text-white' : 'text-text-muted hover:text-brand-dark'"
              @click="viewMode = 'grid'"
              aria-label="Grid view"
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="p-2 transition-colors"
              :class="viewMode === 'list' ? 'bg-brand-dark text-white' : 'text-text-muted hover:text-brand-dark'"
              @click="viewMode = 'list'"
              aria-label="List view"
            >
              <List class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Main layout: sidebar + product area -->
      <div class="flex gap-8">
        <!-- ProductFilters: mobile trigger + sheet + desktop sidebar -->
        <ProductFilters
          :categories="allCategories"
          :current-category-slug="slug"
          :model-value="filterState"
          @update:model-value="updateFilters($event as Record<string, string | number | null | undefined>)"
        />

        <!-- Product column -->
        <div class="flex-1 min-w-0">
          <!-- Active filter tags -->
          <ActiveFilterTags
            :filters="activeFilters"
            class="mb-4"
            @remove="updateFilters({ [$event]: null })"
          />

          <!-- Grid view -->
          <ProductGrid
            v-if="viewMode === 'grid' && paginatedProducts.length > 0"
            :products="paginatedProducts"
            :columns="3"
          />

          <!-- List view -->
          <div
            v-else-if="viewMode === 'list' && paginatedProducts.length > 0"
            class="space-y-3"
          >
            <ProductListItem
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-20">
            <p class="font-body text-text-muted mb-4">
              {{ activeFilters.length > 0 ? 'No products match your filters.' : 'No products in this category yet.' }}
            </p>
            <button
              v-if="activeFilters.length > 0"
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-brand-dark text-brand-dark font-body text-sm px-6 py-2.5 hover:bg-brand-dark hover:text-white transition-colors"
              @click="clearFilters"
            >
              Clear filters
            </button>
            <NuxtLink
              v-else
              to="/categories"
              class="inline-flex items-center justify-center rounded-md border border-brand-dark text-brand-dark font-body text-sm px-6 py-2.5 hover:bg-brand-dark hover:text-white transition-colors"
            >
              Browse all categories →
            </NuxtLink>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-10">
            <button
              type="button"
              class="w-9 h-9 flex items-center justify-center rounded-lg border border-brand-dark/20 text-brand-dark hover:bg-brand-dark hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="page <= 1"
              @click="updateFilters({ page: page - 1 })"
              aria-label="Previous page"
            >
              ‹
            </button>

            <template v-for="(p, i) in pageNumbers" :key="i">
              <span v-if="p === '...'" class="w-9 h-9 flex items-center justify-center text-text-muted text-sm">…</span>
              <button
                v-else
                type="button"
                class="w-9 h-9 flex items-center justify-center rounded-lg border font-body text-sm transition-colors"
                :class="p === page
                  ? 'bg-brand-dark text-white border-brand-dark'
                  : 'border-brand-dark/20 text-brand-dark hover:bg-brand-dark hover:text-white'"
                @click="updateFilters({ page: p })"
              >
                {{ p }}
              </button>
            </template>

            <button
              type="button"
              class="w-9 h-9 flex items-center justify-center rounded-lg border border-brand-dark/20 text-brand-dark hover:bg-brand-dark hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="page >= totalPages"
              @click="updateFilters({ page: page + 1 })"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
