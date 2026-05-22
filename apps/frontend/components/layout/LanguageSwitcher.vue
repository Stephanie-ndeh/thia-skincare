<script setup lang="ts">
const { locale, setLocale } = useI18n()
const localeCookie = useCookie<'en' | 'fr'>('thia-locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })

function switchTo(code: 'en' | 'fr') {
  localeCookie.value = code
  setLocale(code)
}
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
      @click="switchTo('en')"
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
      @click="switchTo('fr')"
    >
      FR
    </button>
  </div>
</template>
