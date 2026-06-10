<script setup lang="ts">
const { el: sectionEl, visible: sectionVisible } = useFadeUp()
const { containerEl: staggerEl, visible: staggerVisible } = useStagger()
</script>

<template>
  <section
    ref="sectionEl"
    class="fade-up py-16 sm:py-24 px-4 sm:px-8 bg-cream border-t border-brand-dark/[0.07]"
    :class="{ visible: sectionVisible }"
  >
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-14 sm:mb-20">
        <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center justify-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          {{ $t('home.why_thia_eyebrow') }}
        </p>
        <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark">
          {{ $t('home.why_thia_title') }}
        </h2>
      </div>

      <div ref="staggerEl" class="grid sm:grid-cols-3 gap-8 sm:gap-12">
        <div
          class="stagger-item hover-lift-sm text-center"
          :class="{ visible: staggerVisible }"
        >
          <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-brand-dark/15">
            <span class="font-body text-lg">✦</span>
          </div>
          <h3 class="font-heading text-xl font-semibold text-brand-dark mb-3">
            {{ $t('home.card_1_title') }}
          </h3>
          <p class="font-body text-sm text-text-muted leading-relaxed">
            {{ $t('home.card_1_body') }}
          </p>
        </div>
        <div
          class="stagger-item hover-lift-sm text-center"
          :class="{ visible: staggerVisible }"
        >
          <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-brand-dark/15">
            <span class="font-body text-lg">◈</span>
          </div>
          <h3 class="font-heading text-xl font-semibold text-brand-dark mb-3">
            {{ $t('home.card_2_title') }}
          </h3>
          <p class="font-body text-sm text-text-muted leading-relaxed">
            {{ $t('home.card_2_body') }}
          </p>
        </div>
        <div
          class="stagger-item hover-lift-sm text-center"
          :class="{ visible: staggerVisible }"
        >
          <div class="w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-brand-dark/15">
            <span class="font-body text-lg">◉</span>
          </div>
          <h3 class="font-heading text-xl font-semibold text-brand-dark mb-3">
            {{ $t('home.card_3_title') }}
          </h3>
          <p class="font-body text-sm text-text-muted leading-relaxed">
            {{ $t('home.card_3_body') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
