<script setup lang="ts">
import type { Category } from '@thia/shared'

type RawCategoryWithCount = Pick<Category, 'id' | 'name' | 'slug'> & {
  image_url: string | null
  products: Array<{ count: number }>
}

const supabase = useSupabaseClient()

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

function cardColor(index: number): string {
  const colors = [
    '#E8C99A', '#D4B896', '#C9A882',
    '#BFA07A', '#D4C4A8', '#C4B098',
    '#B8A08A', '#D8C4AA', '#C8B49A',
  ]
  return colors[index % colors.length]
}

const { el: sectionEl, visible: sectionVisible } = useFadeUp()
const { containerEl: staggerEl, visible: staggerVisible } = useStagger()
</script>

<template>
  <section
    v-if="categories.length > 0"
    ref="sectionEl"
    class="fade-up py-16 sm:py-20 px-4 sm:px-8 bg-cream"
    :class="{ visible: sectionVisible }"
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

      <div ref="staggerEl" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          v-for="(category, idx) in categories.slice(0, 4)"
          :key="category.id"
          class="relative aspect-[3/4] overflow-hidden rounded-sm cursor-pointer group stagger-item"
          :class="{ visible: staggerVisible }"
          @click="navigateTo(`/categories/${category.slug}`)"
        >
          <!-- Background image -->
          <NuxtImg
            v-if="category.image_url"
            :src="category.image_url"
            :alt="category.name"
            width="300"
            height="400"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <!-- Tonal placeholder if no image -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
            :style="{ backgroundColor: cardColor(idx) }"
          >
            <span
              class="font-serif text-8xl font-light select-none"
              :style="{ color: 'rgba(255,255,255,0.2)' }"
            >
              {{ category.name.charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <!-- Category name overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <p class="text-white font-serif text-2xl font-semibold">
              {{ category.name }}
            </p>
            <p class="text-white/70 text-xs mt-1">
              {{ getProductCount(category) }} produits
            </p>
          </div>

          <!-- Number badge -->
          <div class="absolute top-3 left-3 text-white/60 text-xs uppercase tracking-widest">
            n°{{ String(idx + 1).padStart(2, '0') }}
          </div>
        </div>
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
</template>
