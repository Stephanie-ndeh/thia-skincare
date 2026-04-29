<script setup lang="ts">
import type { ActiveFilter } from '@/composables/useProductFilters'
import { X } from 'lucide-vue-next'

defineProps<{
  filters: ActiveFilter[]
}>()

const emit = defineEmits<{
  remove: [key: string]
}>()
</script>

<template>
  <div v-if="filters.length > 0" class="flex flex-wrap gap-2">
    <button
      v-for="filter in filters"
      :key="filter.key"
      type="button"
      class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-dark text-white font-body text-xs hover:bg-brand-accent transition-colors"
      @click="emit('remove', filter.key)"
    >
      {{ filter.label }}
      <X class="w-3 h-3" />
    </button>
  </div>
</template>
