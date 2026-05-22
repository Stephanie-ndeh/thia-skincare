<script setup lang="ts">
defineProps<{
  imageUrl: string
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
}>()
</script>

<template>
  <section class="relative min-h-[520px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2a1f10] to-[#1a1a1a]">
    <!-- Background image -->
    <NuxtImg
      v-if="imageUrl"
      :src="imageUrl"
      alt="Thia hero banner"
      class="absolute inset-0 w-full h-full object-cover"
      loading="eager"
      fetchpriority="high"
      width="1440"
      height="640"
    />

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40" />

    <!-- Content -->
    <div class="relative z-10 text-center px-4 max-w-2xl mx-auto">
      <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4">
        {{ headline }}
      </h1>
      <p class="font-body text-base sm:text-lg text-white/85 mb-8">
        {{ subheadline }}
      </p>
      <NuxtLink
        :to="ctaLink"
        class="inline-flex items-center justify-center rounded-md bg-brand-accent text-white font-body font-medium text-sm sm:text-base px-8 py-3 hover:bg-brand-accent/90 transition-colors"
      >
        {{ ctaText }}
      </NuxtLink>
    </div>
  </section>
</template>
