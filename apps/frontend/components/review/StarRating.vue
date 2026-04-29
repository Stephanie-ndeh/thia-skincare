<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const props = defineProps<{
  rating: number
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  'update:rating': [value: number]
}>()

const sizeClass = computed(() => ({
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}[props.size ?? 'md']))

function starFill(index: number): 'full' | 'empty' {
  return index <= Math.round(props.rating) ? 'full' : 'empty'
}
</script>

<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="i in 5"
      :key="i"
      :class="[
        sizeClass,
        interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none',
      ]"
      type="button"
      :aria-label="`${i} star${i !== 1 ? 's' : ''}`"
      @click="interactive && emit('update:rating', i)"
    >
      <Star
        :class="[
          sizeClass,
          starFill(i) === 'full'
            ? 'fill-amber-400 text-amber-400'
            : 'fill-transparent text-amber-300',
        ]"
      />
    </button>
  </div>
</template>
