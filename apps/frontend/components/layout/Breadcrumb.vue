<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  items: Array<{ label: string; href?: string }>
}>()
</script>

<template>
  <nav aria-label="breadcrumb">
    <ol class="flex items-center flex-wrap gap-1 text-sm text-text-muted">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center gap-1"
      >
        <ChevronRight v-if="index > 0" class="w-3.5 h-3.5 shrink-0 text-text-muted/60" />
        <NuxtLink
          v-if="item.href"
          :to="item.href"
          class="hover:text-brand-dark transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="text-brand-dark font-medium">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
