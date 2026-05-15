<script setup lang="ts">
const { locale, setLocale } = useI18n()
</script>

<template>
  <div class="flex items-center gap-1 text-xs font-medium">
    <button
      type="button"
      class="px-1.5 py-0.5 rounded transition-colors"
      :class="locale === 'en'
        ? 'text-brand-dark font-semibold'
        : 'text-text-muted hover:text-brand-dark'"
      aria-label="Switch to English"
      @click="setLocale('en')"
    >
      EN
    </button>
    <span class="text-text-muted/50">|</span>
    <button
      type="button"
      class="px-1.5 py-0.5 rounded transition-colors"
      :class="locale === 'fr'
        ? 'text-brand-dark font-semibold'
        : 'text-text-muted hover:text-brand-dark'"
      aria-label="Passer en français"
      @click="setLocale('fr')"
    >
      FR
    </button>
  </div>
</template>
