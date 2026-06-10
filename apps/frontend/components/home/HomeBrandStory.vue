<script setup lang="ts">
const { el: sectionEl, visible: sectionVisible } = useFadeUp()
const { el: stat9El, current: stat9Count } = useCountUp(9)
const { el: stat100El, current: stat100Count } = useCountUp(100)
</script>

<template>
  <section
    ref="sectionEl"
    class="fade-up py-20 sm:py-24 px-4 sm:px-8 bg-espresso"
    :class="{ visible: sectionVisible }"
  >
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-end">
      <div>
        <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-6 flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          {{ $t('about.hero_label') }}
        </p>
        <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-white leading-[1.1] mb-8">
          {{ $t('about.brand_title') }}
        </h2>
        <p class="font-body text-sm text-white/60 leading-relaxed mb-12 max-w-md">
          {{ $t('about.brand_p1') }}
        </p>
        <!-- Stats with CountUp -->
        <div class="grid grid-cols-3 gap-6 mb-12">
          <div>
            <p class="font-heading text-4xl sm:text-5xl font-semibold text-white">
              {{ $t('about.stats_cooperatives_num') }}
            </p>
            <p class="font-body text-[11px] text-white/45 mt-1.5 leading-tight">
              {{ $t('about.stats_cooperatives_label') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-4xl sm:text-5xl font-semibold text-white">
              <span ref="stat100El">{{ stat100Count }}</span>%
            </p>
            <p class="font-body text-[11px] text-white/45 mt-1.5 leading-tight">
              {{ $t('about.stats_ingredients_label') }}
            </p>
          </div>
          <div>
            <p class="font-heading text-4xl sm:text-5xl font-semibold text-white">
              <span ref="stat9El">{{ stat9Count }}</span>
            </p>
            <p class="font-body text-[11px] text-white/45 mt-1.5 leading-tight">
              {{ $t('about.stats_founded_label') }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/about"
          class="animated-link font-body text-sm text-white/70 hover:text-white transition-colors"
        >
          {{ $t('home.meet_expert') }}
        </NuxtLink>
      </div>

      <!-- Tagline block -->
      <div class="flex items-end md:justify-end">
        <div class="bg-terracotta px-8 py-7">
          <p class="font-heading text-xl sm:text-2xl italic text-white">
            "{{ $t('home.tagline') }}"
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
