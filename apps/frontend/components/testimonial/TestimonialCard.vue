<script setup lang="ts">
import type { Testimonial } from '@thia/shared'

defineProps<{ testimonial: Testimonial }>()
</script>

<template>
  <div class="bg-white p-8 flex flex-col">
    <span class="font-heading text-5xl text-terracotta leading-none mb-4 select-none">"</span>
    <p class="font-heading text-base italic text-brand-dark leading-relaxed flex-1 mb-8">
      "{{ testimonial.text }}"
    </p>
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-terracotta shrink-0 flex items-center justify-center overflow-hidden">
        <NuxtImg
          v-if="testimonial.photo_url"
          :src="testimonial.photo_url"
          :alt="testimonial.customer_name"
          class="w-full h-full object-cover"
          loading="lazy"
          width="36"
          height="36"
        />
        <span v-else class="font-body text-xs font-semibold text-white">
          {{ testimonial.customer_name.charAt(0).toUpperCase() }}
        </span>
      </div>
      <div>
        <p class="font-body text-xs font-medium text-brand-dark">{{ testimonial.customer_name }}</p>
        <p class="font-body text-xs text-text-muted">Cameroon</p>
      </div>
    </div>
  </div>
</template>
