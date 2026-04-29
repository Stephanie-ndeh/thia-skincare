<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()

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

useHead({
  title: 'Shop by Category — Thia',
  meta: [
    {
      name: 'description',
      content: 'Browse all Thia skincare categories — cleansers, moisturizers, serums, sunscreens, body care, and more. Natural skincare from Cameroon.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <!-- Page header -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <h1 class="font-heading text-3xl sm:text-4xl font-semibold text-brand-dark mb-2">
          Shop by Category
        </h1>
        <p class="font-body text-sm text-text-muted">
          Discover our range of natural skincare products
        </p>
      </div>
    </div>

    <!-- Category grid -->
    <div class="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <div
        v-if="categoryList.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5 sm:gap-6"
      >
        <NuxtLink
          v-for="category in categoryList"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          class="group flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200"
        >
          <!-- Image -->
          <div class="aspect-[4/3] overflow-hidden bg-brand-secondary relative">
            <NuxtImg
              v-if="category.image_url"
              :src="category.image_url"
              :alt="category.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              width="400"
              height="300"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <span class="font-heading text-4xl text-brand-accent/40 font-semibold">
                {{ category.name.charAt(0) }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <h2 class="font-body text-base font-semibold text-brand-dark group-hover:text-brand-accent transition-colors">
              {{ category.name }}
            </h2>
            <p v-if="category.description" class="font-body text-xs text-text-muted mt-1 line-clamp-2">
              {{ category.description }}
            </p>
            <p class="font-body text-xs text-text-muted mt-2">
              {{ category.productCount }} {{ category.productCount === 1 ? 'product' : 'products' }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty state (no categories in DB yet) -->
      <div v-else class="text-center py-20">
        <p class="font-body text-text-muted">No categories available yet. Check back soon.</p>
      </div>
    </div>
  </div>
</template>
