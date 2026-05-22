<script setup lang="ts">
defineProps<{
  stock: number
}>()
</script>

<template>
  <div class="flex items-center gap-1.5">
    <template v-if="stock > 5">
      <span class="w-2 h-2 rounded-full bg-green-500 inline-block" />
      <span class="font-body text-sm text-green-700">In Stock</span>
    </template>
    <template v-else-if="stock >= 1">
      <span class="w-2 h-2 rounded-full bg-amber-500 inline-block" />
      <span class="font-body text-sm text-amber-700">Low Stock ({{ stock }} left)</span>
    </template>
    <template v-else>
      <span class="w-2 h-2 rounded-full bg-red-500 inline-block" />
      <span class="font-body text-sm text-red-700">Out of Stock</span>
    </template>
  </div>
</template>
