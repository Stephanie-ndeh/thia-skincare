<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface GalleryImage {
  url: string
  is_primary: boolean
}

const props = defineProps<{
  images: GalleryImage[]
}>()

const primaryIndex = computed(() => {
  const idx = props.images.findIndex(img => img.is_primary)
  return idx >= 0 ? idx : 0
})

const activeIndex = ref(primaryIndex.value)

watch(() => props.images, () => {
  activeIndex.value = primaryIndex.value
})

const activeImage = computed(() => props.images[activeIndex.value] ?? props.images[0])

function prev() {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}
</script>

<template>
  <div class="space-y-3">
    <!-- Main image -->
    <div class="relative aspect-square rounded-xl overflow-hidden bg-brand-secondary">
      <NuxtImg
        v-if="activeImage"
        :src="activeImage.url"
        :alt="'Product image'"
        class="w-full h-full object-cover"
        loading="eager"
        fetchpriority="high"
        width="600"
        height="600"
      />

      <!-- Prev/next arrows (always present, useful on mobile too) -->
      <button
        v-if="images.length > 1"
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
        @click="prev"
        aria-label="Previous image"
      >
        <ChevronLeft class="w-4 h-4 text-brand-dark" />
      </button>
      <button
        v-if="images.length > 1"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
        @click="next"
        aria-label="Next image"
      >
        <ChevronRight class="w-4 h-4 text-brand-dark" />
      </button>
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(img, idx) in images"
        :key="idx"
        type="button"
        class="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
        :class="idx === activeIndex ? 'border-brand-dark' : 'border-transparent hover:border-brand-dark/30'"
        @click="activeIndex = idx"
        :aria-label="`View image ${idx + 1}`"
      >
        <NuxtImg
          :src="img.url"
          alt=""
          class="w-full h-full object-cover"
          loading="lazy"
          width="64"
          height="64"
        />
      </button>
    </div>
  </div>
</template>
