<script setup lang="ts">
interface HeroSettings {
  image_url: string
  cta_link: string
  cta_text: string
  headline?: string
  subheadline?: string
}

interface RawProductImage {
  url: string
  is_primary: boolean
}

const supabase = useSupabaseClient()
const { t } = useI18n()

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

const { data: featuredImgRaw } = await useAsyncData('hero-featured-img', async () => {
  const { data } = await supabase
    .from('products')
    .select('id, product_images(url, is_primary)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(1)
  return data as Array<{ id: string; product_images: RawProductImage[] }> | null
})

const { data: firstPublishedRaw } = await useAsyncData('hero-fallback', async () => {
  const { data } = await supabase
    .from('products')
    .select('id, product_images(url, is_primary)')
    .eq('is_published', true)
    .limit(1)
  return data as Array<{ id: string; product_images: RawProductImage[] }> | null
})

const heroImageUrl = computed((): string | null => {
  const featured = featuredImgRaw.value?.[0]
  const featuredImg = featured?.product_images?.find(i => i.is_primary)?.url
    ?? featured?.product_images?.[0]?.url
    ?? null
  if (featuredImg) return featuredImg
  const fallback = firstPublishedRaw.value?.[0]
  const fallbackImg = fallback?.product_images?.find(i => i.is_primary)?.url
    ?? fallback?.product_images?.[0]?.url
    ?? null
  if (fallbackImg) return fallbackImg
  return heroSettings.value.image_url || null
})

const mounted = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})
</script>

<template>
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
      class="hidden lg:block hero-image relative w-full h-full min-h-125 overflow-hidden bg-sand"
      :class="{ mounted }"
    >
      <NuxtImg
        v-if="heroImageUrl"
        :src="heroImageUrl"
        alt="Thia featured product"
        width="600"
        height="700"
        loading="eager"
        fetchpriority="high"
        class="w-full h-full object-cover object-center"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <span class="font-serif text-9xl font-light text-black/8 select-none">n°01</span>
      </div>
      <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] uppercase tracking-widest text-espresso">
        featured product
      </div>
    </div>
  </section>
</template>
