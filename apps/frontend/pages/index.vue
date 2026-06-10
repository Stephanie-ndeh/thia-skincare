<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const { t } = useI18n()
const config = useRuntimeConfig()

// ── Minimal settings fetch — shared with HomeHero via same key ───────────────

const { data: settingsRows } = await useAsyncData('homepage-settings', async () => {
  const { data } = await supabase
    .from('site_settings')
    .select('key,value')
    .in('key', ['homepage_hero'])
  return data as Array<{ key: string; value: unknown }> | null
})

interface HeroSettings { image_url: string }

const heroOgImage = computed((): string | undefined => {
  const row = settingsRows.value?.find(r => r.key === 'homepage_hero')
  const val = (row?.value ?? {}) as Partial<HeroSettings>
  return val.image_url || undefined
})

// ── SEO ──────────────────────────────────────────────────────────────────────

const siteUrl = computed(() => config.public.siteUrl || 'https://thia.cm')

useSeoMeta({
  title: () => t('seo.home_title'),
  description: () => t('seo.home_desc'),
  ogTitle: () => t('seo.home_title'),
  ogDescription: () => t('seo.home_desc'),
  ogType: 'website',
  ogUrl: () => siteUrl.value,
  ogImage: () => heroOgImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.home_title'),
  twitterDescription: () => t('seo.home_desc'),
})

useHead({
  link: [{ rel: 'canonical', href: () => siteUrl.value }],
})

// ── Ingredient feature (section 6) — rotating card ──────────────────────────

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
const { el: ingredientSectionEl, visible: ingredientSectionVisible } = useFadeUp()
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

    <!-- 1. Hero -->
    <HomeHero />

    <!-- 2. Announcement strip -->
    <AnnouncementStrip />

    <!-- 3. Categories -->
    <HomeCategoryGrid />

    <!-- 4. Best sellers -->
    <HomeBestSellers />

    <!-- 5. Brand story -->
    <HomeBrandStory />

    <!-- 6. Ingredient feature ──────────────────────────────────────────────── -->
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

    <!-- 7. Why Thia -->
    <HomeWhyThia />

    <!-- 8. Testimonials -->
    <HomeTestimonials />

    <!-- 9. Payment trust -->
    <HomePaymentTrust />

    <!-- 10. Newsletter -->
    <NewsletterSection />

  </div>
</template>
