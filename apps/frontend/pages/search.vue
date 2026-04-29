<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const route = useRoute()

const q = computed(() => (route.query.q as string) ?? '')

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawSearchProduct {
  id: string
  name: string
  slug: string
  categories: { name: string } | null
  product_variants: { price: number }[]
  product_images: { url: string; is_primary: boolean }[]
}

interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string
  primaryImageUrl: string | null
}

// ── SSR fetch ─────────────────────────────────────────────────────────────────

const { data: rawResults, refresh } = await useAsyncData<ProductCardData[]>(
  `search-${q.value}`,
  async () => {
    if (!q.value || q.value.trim().length < 2) return []

    const { data } = await supabase
      .from('products')
      .select('id,name,slug,categories(name),product_variants(price),product_images(url,is_primary)')
      .textSearch('search_vector', q.value.trim(), { type: 'websearch', config: 'english' })
      .eq('is_published', true)

    const raw = (data as RawSearchProduct[] | null) ?? []
    return raw.map(p => {
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
  },
)

// Re-run when query param changes (user searches again from header while on this page)
watch(q, () => refresh())

// ── Client-side sort ──────────────────────────────────────────────────────────

const { sortBy, updateFilters } = useProductFilters()

const sortedResults = computed((): ProductCardData[] => {
  const list = [...(rawResults.value ?? [])]
  switch (sortBy.value) {
    case 'price_asc': return list.sort((a, b) => a.price - b.price)
    case 'price_desc': return list.sort((a, b) => b.price - a.price)
    default: return list
  }
})

// ── SEO ───────────────────────────────────────────────────────────────────────

useHead({
  title: q.value ? `Search: "${q.value}" — Thia` : 'Search — Thia',
  meta: [
    { name: 'description', content: `Search results for "${q.value}" on Thia — natural skincare from Cameroon.` },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <!-- Page header -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <h1 class="font-heading text-2xl sm:text-3xl font-semibold text-brand-dark mb-1">
          <template v-if="q">Search results for "{{ q }}"</template>
          <template v-else>Search</template>
        </h1>
        <p v-if="q && sortedResults.length > 0" class="font-body text-sm text-text-muted">
          {{ sortedResults.length }} {{ sortedResults.length === 1 ? 'product' : 'products' }} found
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10 sm:py-12">
      <!-- No query state -->
      <div v-if="!q || q.trim().length < 2" class="text-center py-20">
        <p class="font-body text-text-muted">Enter a search term to get started.</p>
      </div>

      <template v-else>
        <!-- Sort toolbar -->
        <div v-if="sortedResults.length > 0" class="flex items-center justify-end mb-6">
          <ProductSortSelect
            :model-value="sortBy"
            @update:model-value="updateFilters({ sort: $event })"
          />
        </div>

        <!-- Product grid -->
        <ProductGrid v-if="sortedResults.length > 0" :products="sortedResults" :columns="4" />

        <!-- No results -->
        <div v-else class="text-center py-20">
          <p class="font-body text-text-muted mb-2">No products found for "{{ q }}".</p>
          <NuxtLink
            to="/categories"
            class="inline-flex items-center justify-center rounded-md border border-brand-dark text-brand-dark font-body text-sm px-6 py-2.5 hover:bg-brand-dark hover:text-white transition-colors mt-4"
          >
            Browse all products →
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>
