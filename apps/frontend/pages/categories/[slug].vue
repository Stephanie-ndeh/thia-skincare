<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const route = useRoute()
const slug = route.params.slug as string

// ── Types ────────────────────────────────────────────────────────────────────

interface RawCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
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
}

// ── Fetch category + products together (SSR) ─────────────────────────────────

const { data: pageData } = await useAsyncData<PageData | null>(`category-${slug}`, async () => {
  const { data: cat } = await supabase
    .from('categories')
    .select('id,name,slug,description,image_url')
    .eq('slug', slug)
    .single()

  if (!cat) return null

  const category = cat as RawCategory

  const { data: prods } = await supabase
    .from('products')
    .select('id,name,slug,categories(name),product_variants(price),product_images(url,is_primary)')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

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

  return { category, products }
})

// ── 404 guard ────────────────────────────────────────────────────────────────

if (!pageData.value) {
  throw createError({ statusCode: 404, message: 'Category not found', fatal: true })
}

const category = computed(() => pageData.value!.category)
const products = computed(() => pageData.value!.products)

// ── Breadcrumb ───────────────────────────────────────────────────────────────

const breadcrumb = computed(() => [
  { label: 'Home', href: '/' },
  { label: category.value.name },
])

// ── SEO ──────────────────────────────────────────────────────────────────────

useHead({
  title: `${category.value.name} — Thia`,
  meta: [
    {
      name: 'description',
      content: category.value.description ?? `Shop ${category.value.name} products from Thia — natural skincare from Cameroon.`,
    },
    { property: 'og:title', content: `${category.value.name} — Thia` },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <!-- Category hero -->
    <div
      class="relative bg-brand-dark overflow-hidden"
      :class="category.image_url ? 'min-h-[240px] sm:min-h-[300px]' : 'py-12 sm:py-16'"
    >
      <!-- Background image (subtle) -->
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
        <!-- Breadcrumb -->
        <div class="mb-4">
          <Breadcrumb :items="breadcrumb" class="[&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-white/50" />
        </div>

        <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-3">
          {{ category.name }}
        </h1>
        <p v-if="category.description" class="font-body text-sm sm:text-base text-white/75 max-w-xl">
          {{ category.description }}
        </p>
      </div>
    </div>

    <!-- Products section -->
    <div class="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <!-- Result count -->
      <p v-if="products.length > 0" class="font-body text-sm text-text-muted mb-6">
        {{ products.length }} {{ products.length === 1 ? 'product' : 'products' }}
      </p>

      <!-- Product grid -->
      <ProductGrid v-if="products.length > 0" :products="products" :columns="4" />

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <p class="font-body text-text-muted mb-4">No products in this category yet.</p>
        <NuxtLink
          to="/categories"
          class="inline-flex items-center justify-center rounded-md border border-brand-dark text-brand-dark font-body text-sm px-6 py-2.5 hover:bg-brand-dark hover:text-white transition-colors"
        >
          Browse all products →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
