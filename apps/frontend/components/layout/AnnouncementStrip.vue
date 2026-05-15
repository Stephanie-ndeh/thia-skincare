<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div
    class="overflow-hidden border-b border-border py-2.5"
    style="background: var(--color-brand-dark, #2C2C2A);"
  >
    <div
      class="animate-marquee flex gap-16 whitespace-nowrap text-xs tracking-widest uppercase"
      style="color: var(--color-brand-light, #F1EFE8);"
    >
      <span>{{ t('home.free_delivery') }}</span>
      <span>·</span>
      <span>{{ t('home.mobile_money') }}</span>
      <span>·</span>
      <span>{{ t('home.products_available') }}</span>
      <span>·</span>
      <span>{{ t('home.nationwide') }}</span>
      <span>·</span>
      <span>{{ t('home.free_delivery') }}</span>
      <span>·</span>
      <span>{{ t('home.mobile_money') }}</span>
      <span>·</span>
      <span>{{ t('home.products_available') }}</span>
      <span>·</span>
      <span>{{ t('home.nationwide') }}</span>
    </div>
  </div>
</template>
