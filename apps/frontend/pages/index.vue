<script setup lang="ts">
import type { Category, Testimonial } from '@thia/shared'

definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()

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
    cta_text: val.cta_text ?? 'Shop Now',
    headline: val.headline ?? 'Natural Skincare from Cameroon',
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

// ── SEO ──────────────────────────────────────────────────────────────────────

useHead({
  title: 'Thia — Natural Skincare from Cameroon',
  meta: [
    {
      name: 'description',
      content: 'Thia offers premium natural skincare products handcrafted with African botanicals. Shop cleansers, moisturizers, serums, and more.',
    },
    { property: 'og:title', content: 'Thia — Natural Skincare from Cameroon' },
    { property: 'og:description', content: 'Handcrafted African skincare. Shop Thia.' },
  ],
})
</script>

<template>
  <div>
    <!-- 1. Hero section -->
    <HeroSection
      :image-url="heroSettings.image_url"
      :headline="heroSettings.headline ?? 'Natural Skincare from Cameroon'"
      :subheadline="heroSettings.subheadline ?? 'Handcrafted with African botanicals for radiant, healthy skin.'"
      :cta-text="heroSettings.cta_text"
      :cta-link="heroSettings.cta_link"
    />

    <!-- 2. Announcement strip -->
    <AnnouncementStrip />

    <!-- 3. Featured categories -->
    <section v-if="categories.length > 0" class="py-16 px-4 bg-brand-light">
      <div class="max-w-7xl mx-auto">
        <h2 class="font-heading text-2xl sm:text-3xl font-semibold text-brand-dark mb-8 text-center">
          Shop by Category
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="group flex flex-col items-center gap-3"
          >
            <div class="w-full aspect-square rounded-full overflow-hidden bg-brand-secondary relative">
              <NuxtImg
                v-if="category.image_url"
                :src="category.image_url"
                :alt="category.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                width="200"
                height="200"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <span class="font-heading text-3xl font-semibold text-brand-accent/40">
                  {{ category.name.charAt(0) }}
                </span>
              </div>
            </div>
            <span class="font-body text-sm font-medium text-brand-dark text-center group-hover:text-brand-accent transition-colors">
              {{ category.name }}
            </span>
            <span class="font-body text-xs text-text-muted text-center">
              {{ getProductCount(category) > 0
                ? `${getProductCount(category)} products`
                : 'Coming soon' }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 4. Best sellers / featured products -->
    <section v-if="featuredProducts.length > 0" class="py-16 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <h2 class="font-heading text-2xl sm:text-3xl font-semibold text-brand-dark mb-2 text-center">
          Best Sellers
        </h2>
        <p class="font-body text-sm text-text-muted text-center mb-8">
          Our most loved natural skincare picks
        </p>
        <ProductGrid :products="featuredProducts" :columns="4" />
        <div class="text-center mt-10">
          <NuxtLink
            to="/categories"
            class="inline-flex items-center justify-center rounded-md border border-brand-dark text-brand-dark font-body font-medium text-sm px-8 py-3 hover:bg-brand-dark hover:text-white transition-colors"
          >
            View All Products
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 5. Testimonials carousel + client photos -->
    <section v-if="testimonials.length > 0" class="py-16 px-4 bg-brand-secondary">
      <div class="max-w-7xl mx-auto">
        <h2 class="font-heading text-2xl sm:text-3xl font-semibold text-brand-dark mb-2 text-center">
          What Our Customers Say
        </h2>
        <p class="font-body text-sm text-text-muted text-center mb-10">
          Real results from real people
        </p>
        <TestimonialCarousel :testimonials="testimonials" />
        <!-- <ClientPhotosGrid :testimonials="testimonials" /> -->
      </div>
    </section>

    <!-- 6. Newsletter signup -->
    <NewsletterSection />
  </div>
</template>
