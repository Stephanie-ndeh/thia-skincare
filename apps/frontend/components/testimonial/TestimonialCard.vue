<script setup lang="ts">
defineProps<{
  testimonial: {
    customer_name: string
    text: string
    photo_url: string | null
  }
}>()
</script>

<template>
  <div class="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
    <!-- Photo -->
    <div class="w-16 h-16 rounded-full overflow-hidden bg-brand-secondary mb-4 shrink-0">
      <NuxtImg
        v-if="testimonial.photo_url"
        :src="testimonial.photo_url"
        :alt="testimonial.customer_name"
        class="w-full h-full object-cover"
        loading="lazy"
        width="64"
        height="64"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-brand-dark font-heading text-xl font-semibold"
      >
        {{ testimonial.customer_name.charAt(0).toUpperCase() }}
      </div>
    </div>

    <!-- Text -->
    <p class="font-body text-sm text-text-muted leading-relaxed line-clamp-3 mb-3">
      "{{ testimonial.text }}"
    </p>

    <!-- Name -->
    <span class="font-body text-sm font-semibold text-brand-dark">
      {{ testimonial.customer_name }}
    </span>
  </div>
</template>
