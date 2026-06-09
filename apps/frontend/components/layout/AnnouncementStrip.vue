<script setup lang="ts">
const { t } = useI18n()

// ── Rotating announcement bar ─────────────────────────────────────────────

const announcements = computed(() => [
  t('home.free_delivery'),
  t('home.announcement_curated'),
  t('home.mobile_money'),
  t('home.nationwide'),
  t('home.announcement_expert'),
])

const currentIndex = ref(0)
let rotatorInterval: ReturnType<typeof setInterval>

onMounted(() => {
  rotatorInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % announcements.value.length
  }, 3800)
})

onUnmounted(() => clearInterval(rotatorInterval))

// ── Marquee ticker items ──────────────────────────────────────────────────

const items = computed(() => [
  t('home.strip_1'),
  t('home.strip_2'),
  t('home.strip_3'),
  t('home.strip_4'),
  t('home.strip_5'),
  t('home.strip_6'),
])

const doubled = computed(() => [...items.value, ...items.value])
</script>

<template>
  <!-- Rotating announcement bar -->
<!--  <div class="bg-espresso py-2.5 text-center overflow-hidden">-->
<!--    <span-->
<!--      :key="currentIndex"-->
<!--      class="font-body text-[11px] tracking-[0.2em] uppercase text-cream/80"-->
<!--      style="animation: thia-fade-swap 0.5s ease-out;"-->
<!--    >-->
<!--      {{ announcements[currentIndex] }}-->
<!--    </span>-->
<!--  </div>-->

  <!-- Marquee ticker strip -->
  <div class="overflow-hidden border-b border-brand-dark/10 bg-white py-3.5">
    <div class="animate-marquee flex whitespace-nowrap">
      <div
        v-for="(item, i) in doubled"
        :key="i"
        class="inline-flex items-center shrink-0"
      >
        <span class="font-heading italic text-sm text-brand-dark/75 px-8 sm:px-12">{{ item }}</span>
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
      </div>
    </div>
  </div>
</template>
