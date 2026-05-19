<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.about_title'),
  description: () => t('seo.about_desc'),
  ogTitle: () => t('seo.about_title'),
  ogDescription: () => t('seo.about_desc'),
})

const whyItems = computed(() => [
  { icon: '✦', title: t('about.why_natural'), desc: t('about.why_natural_desc') },
  { icon: '◈', title: t('about.why_women'), desc: t('about.why_women_desc') },
  { icon: '◉', title: t('about.why_uncompromising'), desc: t('about.why_uncompromising_desc') },
])
</script>

<template>
  <div class="min-h-screen bg-cream">
    <!-- 1. Hero banner -->
    <section class="relative overflow-hidden bg-espresso py-24 sm:py-32 text-center">
      <div class="relative mx-auto max-w-3xl px-4">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-terracotta mb-4 flex items-center justify-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          {{ $t('about.hero_label') }}
        </p>
        <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight">
          {{ $t('about.hero_title') }}
        </h1>
      </div>
      <div class="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/[0.03]" />
      <div class="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/[0.03]" />
    </section>

    <!-- 2. Brand story -->
    <section class="mx-auto max-w-7xl px-4 sm:px-8 py-16 sm:py-24">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <!-- Visual placeholder -->
        <div class="relative aspect-[4/3] overflow-hidden bg-sand texture-diagonal flex items-center justify-center">
          <span class="font-heading text-[12rem] font-semibold text-brand-dark/[0.07] leading-none select-none">T</span>
        </div>

        <!-- Text -->
        <div class="space-y-5">
          <p class="font-body text-xs uppercase tracking-[0.25em] text-terracotta">
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
    <section class="bg-white py-16 sm:py-20 border-y border-brand-dark/[0.07]">
      <div class="mx-auto max-w-7xl px-4 sm:px-8">
        <div class="text-center mb-12">
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center justify-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            WHY THIA
          </p>
          <h2 class="font-heading text-3xl sm:text-4xl font-semibold text-brand-dark">
            {{ $t('about.why_title') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div
            v-for="item in whyItems"
            :key="item.title"
            class="flex flex-col items-center text-center gap-4 p-8 border border-brand-dark/10"
          >
            <div class="w-10 h-10 flex items-center justify-center border border-brand-dark/15">
              <span class="font-body text-base">{{ item.icon }}</span>
            </div>
            <h3 class="font-heading text-lg font-semibold text-brand-dark">{{ item.title }}</h3>
            <p class="font-body text-sm text-text-muted leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Stats -->
    <section class="bg-espresso py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-8">
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-3 text-center">
          <div>
            <p class="font-heading text-5xl font-semibold text-white">
              {{ $t('about.stats_cooperatives_num') }}
            </p>
            <p class="mt-2 font-body text-[11px] uppercase tracking-wider text-white/45">
              {{ $t('about.stats_cooperatives_label') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-5xl font-semibold text-white">
              {{ $t('about.stats_ingredients_num') }}
            </p>
            <p class="mt-2 font-body text-[11px] uppercase tracking-wider text-white/45">
              {{ $t('about.stats_ingredients_label') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-5xl font-semibold text-white">
              {{ $t('about.stats_founded_num') }}
            </p>
            <p class="mt-2 font-body text-[11px] uppercase tracking-wider text-white/45">
              {{ $t('about.stats_founded_label') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. CTA -->
    <section class="mx-auto max-w-7xl px-4 sm:px-8 py-20 sm:py-28 text-center">
      <h2 class="font-heading text-3xl sm:text-4xl font-semibold text-brand-dark mb-4">
        {{ $t('about.cta_title') }}
      </h2>
      <p class="font-body text-base text-text-muted mb-8 max-w-xl mx-auto">
        {{ $t('about.cta_subtitle') }}
      </p>
      <NuxtLink
        to="/categories"
        class="inline-flex items-center justify-center bg-espresso text-cream font-body text-[11px] tracking-[0.18em] uppercase px-8 py-4 hover:opacity-90 transition-opacity"
      >
        {{ $t('about.cta_button') }}
      </NuxtLink>
    </section>
  </div>
</template>
