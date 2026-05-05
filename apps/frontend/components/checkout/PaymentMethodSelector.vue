<script setup lang="ts">
defineProps<{ modelValue: 'cm.mtn' | 'cm.orange' }>()
const emit = defineEmits<{ 'update:modelValue': [value: 'cm.mtn' | 'cm.orange'] }>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <button
      type="button"
      @click="emit('update:modelValue', 'cm.mtn')"
      class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors"
      :class="modelValue === 'cm.mtn'
        ? 'border-brand-dark bg-brand-dark/5'
        : 'border-border hover:border-brand-dark/40'"
    >
      <span class="text-2xl">📱</span>
      <span class="text-sm font-medium text-text-dark">MTN Mobile Money</span>
      <span class="text-xs text-text-muted">cm.mtn</span>
    </button>

    <button
      type="button"
      @click="emit('update:modelValue', 'cm.orange')"
      class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors"
      :class="modelValue === 'cm.orange'
        ? 'border-brand-dark bg-brand-dark/5'
        : 'border-border hover:border-brand-dark/40'"
    >
      <span class="text-2xl">🟠</span>
      <span class="text-sm font-medium text-text-dark">Orange Money</span>
      <span class="text-xs text-text-muted">cm.orange</span>
    </button>
  </div>
</template>
