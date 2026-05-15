<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.about_title'),
  description: () => t('seo.about_desc'),
  ogTitle: () => t('seo.about_title'),
  ogDescription: () => t('seo.about_desc'),
})

const ingredients = computed(() => [
  { emoji: '🌿', name: t('about.shea_name'), region: t('about.shea_region'), desc: t('about.shea_desc') },
  { emoji: '💧', name: t('about.marula_name'), region: t('about.marula_region'), desc: t('about.marula_desc') },
  { emoji: '🌳', name: t('about.baobab_name'), region: t('about.baobab_region'), desc: t('about.baobab_desc') },
  { emoji: '🌺', name: t('about.hibiscus_name'), region: t('about.hibiscus_region'), desc: t('about.hibiscus_desc') },
])

const whyItems = computed(() => [
  { icon: '🌿', title: t('about.why_natural'), desc: t('about.why_natural_desc') },
  { icon: '🤝', title: t('about.why_women'), desc: t('about.why_women_desc') },
  { icon: '💚', title: t('about.why_uncompromising'), desc: t('about.why_uncompromising_desc') },
])
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <!-- 1. Hero banner -->
    <section class="relative overflow-hidden bg-[#2C1810] py-24 sm:py-32 text-center">
      <div class="relative mx-auto max-w-3xl px-4">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-[#D4A882] mb-4">
          {{ $t('about.hero_label') }}
        </p>
        <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5EDE3] leading-tight">
          {{ $t('about.hero_title') }}
        </h1>
      </div>
      <!-- Decorative botanical circles -->
      <div class="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-[#3D1F0D] opacity-50" />
      <div class="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#3D1F0D] opacity-40" />
    </section>

    <!-- 2. Brand story -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:py-24">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <!-- Image placeholder (brand photo) -->
        <div class="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#2C1810]">
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-30">
            <span class="text-8xl">🌿</span>
          </div>
          <div class="absolute inset-0 bg-gradient-to-br from-[#3D1F0D] via-transparent to-[#2C1810] opacity-60" />
        </div>

        <!-- Text -->
        <div class="space-y-5">
          <p class="font-body text-xs uppercase tracking-[0.25em] text-text-muted">
            {{ $t('about.brand_eyebrow') }}
          </p>
          <h2 class="font-heading text-3xl sm:text-4xl font-semibold text-brand-dark leading-snug">
            {{ $t('about.brand_title') }}
          </h2>
          <p class="font-body text-base text-text-muted leading-relaxed">
            {{ $t('about.brand_p1') }}
          </p>
          <p class="font-body text-base text-text-muted leading-relaxed">
            {{ $t('about.brand_p2') }}
          </p>
          <p class="font-body text-base text-text-muted leading-relaxed">
            {{ $t('about.brand_p3') }}
          </p>
        </div>
      </div>
    </section>

    <!-- 3. Why Thia -->
    <section class="bg-white py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4">
        <h2 class="font-heading text-3xl font-semibold text-brand-dark text-center mb-12">
          {{ $t('about.why_title') }}
        </h2>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div
            v-for="item in whyItems"
            :key="item.title"
            class="flex flex-col items-center text-center gap-4 p-6 rounded-xl border border-brand-dark/10 hover:border-brand-accent transition-colors"
          >
            <span class="text-4xl">{{ item.icon }}</span>
            <h3 class="font-heading text-lg font-semibold text-brand-dark">{{ item.title }}</h3>
            <p class="font-body text-sm text-text-muted leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Ingredients -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:py-24">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl font-semibold text-brand-dark">
          {{ $t('about.ingredients_title') }}
        </h2>
        <p class="mt-2 font-body text-sm text-text-muted">
          {{ $t('about.ingredients_subtitle') }}
        </p>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="ingredient in ingredients"
          :key="ingredient.name"
          class="relative overflow-hidden rounded-xl bg-[#2C1810] p-6 text-white"
        >
          <span class="text-3xl mb-3 block">{{ ingredient.emoji }}</span>
          <p class="font-body text-xs uppercase tracking-wider text-[#D4A882] mb-1">
            {{ ingredient.region }}
          </p>
          <h3 class="font-heading text-lg font-semibold mb-2">{{ ingredient.name }}</h3>
          <p class="font-body text-sm text-[#C4A882] leading-relaxed">{{ ingredient.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 5. Stats -->
    <section class="bg-[#2C1810] py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4">
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-3 text-center">
          <div>
            <p class="font-heading text-5xl font-bold text-[#F5EDE3]">
              {{ $t('about.stats_cooperatives_num') }}
            </p>
            <p class="mt-2 font-body text-sm uppercase tracking-wider text-[#D4A882]">
              {{ $t('about.stats_cooperatives_label') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-5xl font-bold text-[#F5EDE3]">
              {{ $t('about.stats_ingredients_num') }}
            </p>
            <p class="mt-2 font-body text-sm uppercase tracking-wider text-[#D4A882]">
              {{ $t('about.stats_ingredients_label') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-5xl font-bold text-[#F5EDE3]">
              {{ $t('about.stats_founded_num') }}
            </p>
            <p class="mt-2 font-body text-sm uppercase tracking-wider text-[#D4A882]">
              {{ $t('about.stats_founded_label') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. CTA -->
    <section class="mx-auto max-w-7xl px-4 py-20 sm:py-28 text-center">
      <h2 class="font-heading text-3xl sm:text-4xl font-semibold text-brand-dark mb-4">
        {{ $t('about.cta_title') }}
      </h2>
      <p class="font-body text-base text-text-muted mb-8 max-w-xl mx-auto">
        {{ $t('about.cta_subtitle') }}
      </p>
      <NuxtLink
        to="/categories"
        class="inline-flex items-center gap-2 rounded-full bg-brand-dark px-8 py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
      >
        {{ $t('about.cta_button') }}
      </NuxtLink>
    </section>
  </div>
</template>
