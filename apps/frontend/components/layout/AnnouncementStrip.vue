<script setup lang="ts">
const { t } = useI18n()

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
