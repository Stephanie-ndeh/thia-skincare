<script setup lang="ts">
interface GalleryImage {
  url: string
  is_primary: boolean
}

const props = defineProps<{
  images: GalleryImage[]
  badge?: string | null
}>()

const primaryIndex = computed(() => {
  const idx = props.images.findIndex(img => img.is_primary)
  return idx >= 0 ? idx : 0
})

const activeIndex = ref(primaryIndex.value)

watch(() => props.images, () => {
  activeIndex.value = primaryIndex.value
})

const activeImage = computed(() => props.images[activeIndex.value] ?? props.images[0] ?? null)
</script>

<template>
  <div>
    <div class="flex gap-3">
      <!-- Thumbnail strip — vertical on md+, hidden on mobile -->
      <div
        v-if="images.length > 1"
        class="hidden md:flex flex-col gap-2 w-14 shrink-0"
      >
        <button
          v-for="(img, i) in images"
          :key="i"
          type="button"
          class="w-14 h-14 overflow-hidden border-2 transition-all shrink-0"
          :class="activeIndex === i
            ? 'border-espresso'
            : 'border-transparent opacity-50 hover:opacity-80'"
          :aria-label="`View image ${i + 1}`"
          @click="activeIndex = i"
        >
          <NuxtImg
            :src="img.url"
            alt=""
            class="w-full h-full object-cover"
            loading="lazy"
            width="56"
            height="56"
          />
        </button>
      </div>

      <!-- Main image area -->
      <div class="flex-1 aspect-square bg-sand relative overflow-hidden">
        <div class="texture-diagonal absolute inset-0" />

        <!-- Placeholder when no image -->
        <div
          v-if="!activeImage?.url"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2"
        >
          <span
            class="font-heading font-semibold text-brand-dark/[0.10] leading-none select-none"
            style="font-size: clamp(4rem, 15vw, 9rem)"
          >
            n°01
          </span>
          <p class="font-body text-[9px] tracking-[0.35em] uppercase text-brand-dark/20">
            hero product shot
          </p>
          <p class="font-body text-[9px] text-brand-dark/15">
            or browse files
          </p>
        </div>

        <NuxtImg
          v-else
          :src="activeImage.url"
          alt="Product image"
          class="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          width="600"
          height="600"
        />

        <!-- Badge -->
        <div
          v-if="badge"
          class="absolute top-3 right-3 bg-espresso text-cream font-body text-[9px] tracking-[0.15em] uppercase px-2 py-1 z-10"
        >
          {{ badge }}
        </div>
      </div>
    </div>

    <!-- Mobile thumbnail strip — horizontal, below main image -->
    <div
      v-if="images.length > 1"
      class="md:hidden flex gap-2 mt-3 overflow-x-auto pb-1"
    >
      <button
        v-for="(img, i) in images"
        :key="i"
        type="button"
        class="shrink-0 w-14 h-14 overflow-hidden border-2 transition-all"
        :class="activeIndex === i
          ? 'border-espresso'
          : 'border-transparent opacity-50 hover:opacity-80'"
        :aria-label="`View image ${i + 1}`"
        @click="activeIndex = i"
      >
        <NuxtImg
          :src="img.url"
          alt=""
          class="w-full h-full object-cover"
          loading="lazy"
          width="56"
          height="56"
        />
      </button>
    </div>
  </div>
</template>
