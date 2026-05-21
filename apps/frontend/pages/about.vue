<script setup lang="ts">
import { GraduationCap, Heart, MessageCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Our Story — Thia',
  description: "Meet the dermatology graduate behind Thia — Cameroon's expert-curated skincare destination.",
})
</script>

<template>
  <div class="min-h-screen">

    <!-- Section 1 — Hero -->
    <section
      class="relative overflow-hidden min-h-[60vh] flex items-center"
      style="background: var(--color-espresso, #2C1810);"
    >
      <div class="mx-auto max-w-7xl px-6 lg:px-10 py-20 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">

          <!-- Left -->
          <div class="space-y-6">
            <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta">
              {{ $t('about.hero_eyebrow') }}
            </p>
            <h1 class="font-heading font-bold leading-tight" style="font-size: clamp(40px, 5vw, 64px); color: var(--color-cream, #FAF7F2);">
              <span class="block">{{ $t('about.hero_title_l1') }}</span>
              <span class="block">{{ $t('about.hero_title_l2') }}</span>
              <span class="block italic text-terracotta">{{ $t('about.hero_title_l3') }}</span>
            </h1>
            <p class="font-heading italic" style="font-size: 22px; color: rgba(250,247,242,0.7);">
              {{ $t('about.hero_tagline') }}
            </p>
            <p class="font-body" style="font-size: 14px; color: rgba(250,247,242,0.6); max-width: 420px; line-height: 1.7;">
              {{ $t('about.hero_body') }}
            </p>
          </div>

          <!-- Right — oval founder placeholder -->
          <div class="flex flex-col items-center gap-4">
            <div
              class="relative flex items-center justify-center"
              style="width: 280px; height: 360px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);"
            >
              <span
                class="font-heading select-none"
                style="font-size: 80px; color: rgba(250,247,242,0.20); line-height: 1;"
              >T</span>
            </div>
            <p class="font-body text-center" style="font-size: 12px; color: rgba(250,247,242,0.5); letter-spacing: 0.08em;">
              Nadège · Fondatrice
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- Section 2 — Story -->
    <section style="background: var(--color-cream, #FAF7F2);" class="py-20 lg:py-24">
      <div class="mx-auto max-w-7xl px-6 lg:px-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <!-- Left -->
          <div class="space-y-6">
            <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta">
              {{ $t('about.story_eyebrow') }}
            </p>
            <h2 class="font-heading font-semibold leading-snug text-brand-dark" style="font-size: 42px;">
              {{ $t('about.story_title') }}
            </h2>
            <p class="font-body text-[14px] text-text-muted leading-relaxed">
              {{ $t('about.story_para_1') }}
            </p>
            <p class="font-body text-[14px] text-text-muted leading-relaxed">
              {{ $t('about.story_para_2') }}
            </p>
            <p class="font-body text-[14px] text-text-muted leading-relaxed">
              {{ $t('about.story_para_3') }}
            </p>
            <!-- Quote callout -->
            <blockquote
              class="px-8 py-6 mt-2"
              style="background: var(--color-terracotta, #C4714A);"
            >
              <p class="font-heading italic text-white" style="font-size: 20px; line-height: 1.5;">
                "{{ $t('about.story_quote') }}"
              </p>
            </blockquote>
          </div>

          <!-- Right — portrait placeholder -->
          <div class="flex flex-col items-center gap-3">
            <div
              class="w-full flex items-center justify-center"
              style="aspect-ratio: 3/4; background: var(--color-sand, #E8DDD0); max-width: 380px;"
            >
              <span class="font-body text-[11px] tracking-[0.2em] uppercase text-text-muted">FONDATRICE</span>
            </div>
            <p class="font-body text-[12px] text-text-muted tracking-wide">Founder · Dermatology Graduate</p>
          </div>

        </div>
      </div>
    </section>

    <!-- Section 3 — Why Thia -->
    <section class="bg-white py-20" style="padding: 80px 0;">
      <div class="mx-auto max-w-7xl px-6 lg:px-10">
        <div class="text-center mb-14">
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4">
            {{ $t('about.why_eyebrow') }}
          </p>
          <h2 class="font-heading font-semibold text-brand-dark" style="font-size: 36px;">
            {{ $t('about.why_title') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Card 1 -->
          <div
            class="text-center p-10 border rounded-lg"
            style="background: var(--color-cream, #FAF7F2);"
          >
            <div class="inline-flex items-center justify-center mb-6">
              <GraduationCap class="text-terracotta" style="width: 32px; height: 32px;" />
            </div>
            <h3 class="font-heading font-semibold text-brand-dark mb-3" style="font-size: 22px;">
              {{ $t('about.card_1_title') }}
            </h3>
            <p class="font-body text-text-muted" style="font-size: 13px; line-height: 1.65;">
              {{ $t('about.card_1_body') }}
            </p>
          </div>
          <!-- Card 2 -->
          <div
            class="text-center p-10 border rounded-lg"
            style="background: var(--color-cream, #FAF7F2);"
          >
            <div class="inline-flex items-center justify-center mb-6">
              <Heart class="text-terracotta" style="width: 32px; height: 32px;" />
            </div>
            <h3 class="font-heading font-semibold text-brand-dark mb-3" style="font-size: 22px;">
              {{ $t('about.card_2_title') }}
            </h3>
            <p class="font-body text-text-muted" style="font-size: 13px; line-height: 1.65;">
              {{ $t('about.card_2_body') }}
            </p>
          </div>
          <!-- Card 3 -->
          <div
            class="text-center p-10 border rounded-lg"
            style="background: var(--color-cream, #FAF7F2);"
          >
            <div class="inline-flex items-center justify-center mb-6">
              <MessageCircle class="text-terracotta" style="width: 32px; height: 32px;" />
            </div>
            <h3 class="font-heading font-semibold text-brand-dark mb-3" style="font-size: 22px;">
              {{ $t('about.card_3_title') }}
            </h3>
            <p class="font-body text-text-muted" style="font-size: 13px; line-height: 1.65;">
              {{ $t('about.card_3_body') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4 — Curation Process -->
    <section style="background: var(--color-cream, #FAF7F2); padding: 80px 0;">
      <div class="mx-auto max-w-7xl px-6 lg:px-10">
        <div class="mb-14">
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4">
            {{ $t('about.process_eyebrow') }}
          </p>
          <h2 class="font-heading font-semibold text-brand-dark" style="font-size: 36px;">
            {{ $t('about.process_title') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4">
          <!-- Step 1 -->
          <div class="py-8 pr-8 md:border-r border-brand-dark/10">
            <p class="font-heading text-terracotta/20 select-none mb-4 leading-none" style="font-size: 48px; font-weight: 700;">01</p>
            <p class="font-body text-[13px] font-medium uppercase tracking-wider text-brand-dark mb-2">
              {{ $t('about.step_1_title') }}
            </p>
            <p class="font-body text-[12px] text-text-muted leading-relaxed">
              {{ $t('about.step_1_body') }}
            </p>
          </div>
          <!-- Step 2 -->
          <div class="py-8 px-8 md:border-r border-brand-dark/10">
            <p class="font-heading text-terracotta/20 select-none mb-4 leading-none" style="font-size: 48px; font-weight: 700;">02</p>
            <p class="font-body text-[13px] font-medium uppercase tracking-wider text-brand-dark mb-2">
              {{ $t('about.step_2_title') }}
            </p>
            <p class="font-body text-[12px] text-text-muted leading-relaxed">
              {{ $t('about.step_2_body') }}
            </p>
          </div>
          <!-- Step 3 -->
          <div class="py-8 px-8 md:border-r border-brand-dark/10">
            <p class="font-heading text-terracotta/20 select-none mb-4 leading-none" style="font-size: 48px; font-weight: 700;">03</p>
            <p class="font-body text-[13px] font-medium uppercase tracking-wider text-brand-dark mb-2">
              {{ $t('about.step_3_title') }}
            </p>
            <p class="font-body text-[12px] text-text-muted leading-relaxed">
              {{ $t('about.step_3_body') }}
            </p>
          </div>
          <!-- Step 4 -->
          <div class="py-8 pl-8">
            <p class="font-heading text-terracotta/20 select-none mb-4 leading-none" style="font-size: 48px; font-weight: 700;">04</p>
            <p class="font-body text-[13px] font-medium uppercase tracking-wider text-brand-dark mb-2">
              {{ $t('about.step_4_title') }}
            </p>
            <p class="font-body text-[12px] text-text-muted leading-relaxed">
              {{ $t('about.step_4_body') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5 — Stats -->
    <section style="background: var(--color-espresso, #2C1810); padding: 60px 0;">
      <div class="mx-auto max-w-7xl px-6 lg:px-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="font-heading text-cream" style="font-size: 52px; font-weight: 700; line-height: 1;">2023</p>
            <p class="font-body uppercase mt-2" style="font-size: 11px; color: rgba(250,247,242,0.6); letter-spacing: 0.15em;">
              {{ $t('about.stats_founded') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-cream" style="font-size: 52px; font-weight: 700; line-height: 1;">9</p>
            <p class="font-body uppercase mt-2" style="font-size: 11px; color: rgba(250,247,242,0.6); letter-spacing: 0.15em;">
              {{ $t('about.stats_categories') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-cream" style="font-size: 52px; font-weight: 700; line-height: 1;">100%</p>
            <p class="font-body uppercase mt-2" style="font-size: 11px; color: rgba(250,247,242,0.6); letter-spacing: 0.15em;">
              {{ $t('about.stats_curated') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-cream" style="font-size: 52px; font-weight: 700; line-height: 1;">2</p>
            <p class="font-body uppercase mt-2" style="font-size: 11px; color: rgba(250,247,242,0.6); letter-spacing: 0.15em;">
              {{ $t('about.stats_cities') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6 — CTA -->
    <section style="background: var(--color-cream, #FAF7F2); padding: 80px 0;">
      <div class="mx-auto max-w-7xl px-6 lg:px-10 text-center">
        <h2 class="font-heading font-semibold text-brand-dark mb-4" style="font-size: 42px;">
          {{ $t('about.cta_title') }}
        </h2>
        <p class="font-body text-text-muted mb-10" style="font-size: 14px;">
          {{ $t('about.cta_subtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/categories"
            class="inline-flex items-center justify-center font-body text-[11px] tracking-[0.18em] uppercase px-8 py-4 transition-opacity hover:opacity-90"
            style="background: var(--color-espresso, #2C1810); color: var(--color-cream, #FAF7F2);"
          >
            {{ $t('about.cta_primary') }}
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center justify-center font-body text-[11px] tracking-[0.18em] uppercase px-8 py-4 border border-brand-dark/30 text-brand-dark transition-colors hover:border-brand-dark"
          >
            {{ $t('about.cta_secondary') }}
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>
