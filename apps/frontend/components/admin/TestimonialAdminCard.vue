<script setup lang="ts">
import { Pencil, Trash2, Star, ChevronUp, ChevronDown } from 'lucide-vue-next'
import type { Testimonial } from '@thia/shared'

const props = defineProps<{
  testimonial: Testimonial
  isFirst: boolean
  isLast: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  'toggle-featured': []
  'move-up': []
  'move-down': []
}>()

function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function truncate(text: string, max = 80): string {
  return text.length <= max ? text : text.slice(0, max) + '…'
}
</script>

<template>
  <div class="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <!-- Featured badge -->
    <div v-if="testimonial.is_featured" class="absolute right-3 top-3">
      <span class="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">
        <Star class="h-3 w-3 fill-amber-400 text-amber-400" />
        Featured
      </span>
    </div>

    <!-- Order badge -->
    <span class="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-text-muted">
      {{ testimonial.display_order }}
    </span>

    <!-- Photo / avatar -->
    <div class="mt-4 mb-3 flex justify-center">
      <div class="h-16 w-16 overflow-hidden rounded-full bg-brand-secondary">
        <img
          v-if="testimonial.photo_url"
          :src="testimonial.photo_url"
          :alt="testimonial.customer_name"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center font-heading text-xl font-semibold text-brand-dark"
        >
          {{ initials(testimonial.customer_name) }}
        </div>
      </div>
    </div>

    <!-- Name & text -->
    <p class="text-center text-sm font-semibold text-brand-dark">{{ testimonial.customer_name }}</p>
    <p class="mt-1 text-center text-xs text-text-muted leading-relaxed">
      "{{ truncate(testimonial.text) }}"
    </p>

    <!-- Action buttons -->
    <div class="mt-4 flex items-center justify-center gap-1.5">
      <!-- Reorder -->
      <button
        type="button"
        :disabled="props.isFirst"
        :class="[
          'flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors',
          props.isFirst
            ? 'cursor-not-allowed border-gray-100 text-gray-300'
            : 'border-gray-200 text-text-muted hover:border-brand-dark hover:text-brand-dark',
        ]"
        @click="emit('move-up')"
      >
        <ChevronUp class="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        :disabled="props.isLast"
        :class="[
          'flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors',
          props.isLast
            ? 'cursor-not-allowed border-gray-100 text-gray-300'
            : 'border-gray-200 text-text-muted hover:border-brand-dark hover:text-brand-dark',
        ]"
        @click="emit('move-down')"
      >
        <ChevronDown class="h-3.5 w-3.5" />
      </button>

      <!-- Toggle featured -->
      <button
        type="button"
        :class="[
          'flex h-7 w-7 items-center justify-center rounded-lg border transition-colors',
          testimonial.is_featured
            ? 'border-amber-300 bg-amber-50 text-amber-500'
            : 'border-gray-200 text-text-muted hover:border-amber-300 hover:text-amber-500',
        ]"
        @click="emit('toggle-featured')"
      >
        <Star
          class="h-3.5 w-3.5"
          :class="testimonial.is_featured ? 'fill-amber-400 text-amber-400' : ''"
        />
      </button>

      <!-- Edit -->
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-text-muted transition-colors hover:border-brand-dark hover:text-brand-dark"
        @click="emit('edit')"
      >
        <Pencil class="h-3.5 w-3.5" />
      </button>

      <!-- Delete -->
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50"
        @click="emit('delete')"
      >
        <Trash2 class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
</template>
