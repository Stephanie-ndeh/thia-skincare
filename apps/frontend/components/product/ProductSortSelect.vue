<script setup lang="ts">
import type { SortOption } from '@/composables/useProductFilters'

const props = defineProps<{
  modelValue: SortOption
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SortOption]
}>()
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      class="appearance-none font-body text-sm text-brand-dark bg-white border border-brand-dark/20 rounded-lg px-3 py-2 pr-8 cursor-pointer hover:border-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as SortOption)"
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="best_rated">Best Rated</option>
      <option value="name_asc">Name A–Z</option>
    </select>
    <svg
      class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    >
      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</template>
