<script setup lang="ts">
import type { Testimonial } from '@thia/shared'

interface Props {
  testimonials: Testimonial[]
}
const props = defineProps<Props>()

const photosWithImages = computed<Testimonial[]>(() =>
  props.testimonials.filter(t => t.photo_url !== null).slice(0, 8),
)
</script>

<template>
  <div
    v-if="photosWithImages.length > 0"
    class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 px-4"
  >
    <div
      v-for="testimonial in photosWithImages"
      :key="testimonial.id"
      class="aspect-square overflow-hidden rounded-lg"
    >
      <NuxtImg
        :src="testimonial.photo_url!"
        :alt="testimonial.customer_name"
        width="300"
        height="300"
        loading="lazy"
        format="webp"
        quality="75"
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</template>
