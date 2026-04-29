<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Testimonial {
  id: string
  customerName: string
  text: string
  photoUrl: string | null
}

const props = defineProps<{
  testimonials: Testimonial[]
}>()

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const visibleCount = ref(1)

function updateVisibleCount() {
  if (import.meta.client) {
    if (window.innerWidth >= 1024) visibleCount.value = 3
    else if (window.innerWidth >= 768) visibleCount.value = 2
    else visibleCount.value = 1
  }
}

const maxIndex = computed(() =>
  Math.max(0, props.testimonials.length - visibleCount.value),
)

const visibleTestimonials = computed(() =>
  props.testimonials.slice(currentIndex.value, currentIndex.value + visibleCount.value),
)

function prev() {
  currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : maxIndex.value
  resetTimer()
}

function next() {
  currentIndex.value = currentIndex.value < maxIndex.value ? currentIndex.value + 1 : 0
  resetTimer()
}

function goTo(index: number) {
  currentIndex.value = Math.min(index, maxIndex.value)
  resetTimer()
}

function resetTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(next, 5000)
}

onMounted(() => {
  updateVisibleCount()
  window.addEventListener('resize', updateVisibleCount)
  if (props.testimonials.length > 1) {
    timer = setInterval(next, 5000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('resize', updateVisibleCount)
})
</script>

<template>
  <div v-if="testimonials.length > 0" class="relative">
    <!-- Cards -->
    <div class="grid gap-4 transition-all duration-300"
      :class="{
        'grid-cols-1': visibleCount === 1,
        'grid-cols-2': visibleCount === 2,
        'grid-cols-3': visibleCount === 3,
      }"
    >
      <TestimonialCard
        v-for="testimonial in visibleTestimonials"
        :key="testimonial.id"
        :testimonial="testimonial"
      />
    </div>

    <!-- Controls (only when more testimonials than visible slots) -->
    <div v-if="testimonials.length > visibleCount" class="flex items-center justify-center gap-4 mt-6">
      <!-- Prev -->
      <button
        class="p-2 rounded-full border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors"
        aria-label="Previous testimonial"
        @click="prev"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <!-- Dots -->
      <div class="flex gap-2">
        <button
          v-for="(_, i) in testimonials.slice(0, maxIndex + 1)"
          :key="i"
          class="w-2 h-2 rounded-full transition-colors"
          :class="i === currentIndex ? 'bg-brand-accent' : 'bg-gray-300'"
          :aria-label="`Go to slide ${i + 1}`"
          @click="goTo(i)"
        />
      </div>

      <!-- Next -->
      <button
        class="p-2 rounded-full border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors"
        aria-label="Next testimonial"
        @click="next"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
