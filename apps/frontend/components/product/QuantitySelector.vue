<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  max: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function decrement() {
  if (props.modelValue > 1) emit('update:modelValue', props.modelValue - 1)
}

function increment() {
  if (props.modelValue < props.max) emit('update:modelValue', props.modelValue + 1)
}
</script>

<template>
  <div class="inline-flex items-center border border-brand-dark/20 rounded-lg overflow-hidden">
    <button
      type="button"
      class="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="disabled || modelValue <= 1"
      @click="decrement"
      aria-label="Decrease quantity"
    >
      <span class="text-lg leading-none">−</span>
    </button>

    <span class="w-10 text-center font-body text-sm font-medium text-brand-dark select-none">
      {{ modelValue }}
    </span>

    <button
      type="button"
      class="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="disabled || modelValue >= max"
      @click="increment"
      aria-label="Increase quantity"
    >
      <span class="text-lg leading-none">+</span>
    </button>
  </div>
</template>
