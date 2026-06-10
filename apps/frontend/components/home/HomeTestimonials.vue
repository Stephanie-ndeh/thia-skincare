<script setup lang="ts">
import type { Testimonial } from '@thia/shared'

const supabase = useSupabaseClient()

const { data: testimonialsRaw } = await useAsyncData('featured-testimonials', async () => {
  const { data } = await supabase
    .from('testimonials')
    .select('id,customer_name,text,photo_url,is_featured,display_order,storage_path,created_at,updated_at')
    .eq('is_featured', true)
    .order('display_order')
    .limit(6)
  return data as Testimonial[] | null
})

const testimonials = computed((): Testimonial[] => testimonialsRaw.value ?? [])

const { el: sectionEl, visible: sectionVisible } = useFadeUp()
</script>

<template>
  <section
    v-if="testimonials.length > 0"
    ref="sectionEl"
    class="fade-up py-16 sm:py-20 px-4 sm:px-8 bg-brand-light"
    :class="{ visible: sectionVisible }"
  >
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center justify-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          {{ $t('home.strip_2') }}
        </p>
        <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark">
          {{ $t('home.customers_say') }}
        </h2>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <TestimonialCard
          v-for="testimonial in testimonials.slice(0, 3)"
          :key="testimonial.id"
          :testimonial="testimonial"
          class="hover-lift-sm"
        />
      </div>
    </div>
  </section>
</template>
