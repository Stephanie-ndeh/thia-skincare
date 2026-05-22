<script setup lang="ts">
import type { Testimonial } from '@thia/shared'

definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const { t } = useI18n()
const config = useRuntimeConfig()

const { data: testimonialsRaw } = await useAsyncData('all-testimonials', async () => {
  const { data } = await supabase
    .from('testimonials')
    .select('id,customer_name,text,photo_url,is_featured,display_order,storage_path,created_at,updated_at')
    .order('display_order')
  return data as Testimonial[] | null
})

const testimonials = computed((): Testimonial[] => testimonialsRaw.value ?? [])

const siteUrl = computed(() => config.public.siteUrl || 'https://thia.cm')

useSeoMeta({
  title: 'Customer Stories — Thia Skincare',
  description: 'Read what our customers say about their experience with Thia natural skincare products.',
  ogTitle: 'Customer Stories — Thia Skincare',
  ogDescription: 'Read what our customers say about their experience with Thia natural skincare products.',
  ogType: 'website',
  ogUrl: () => `${siteUrl.value}/testimonials`,
})

useHead({
  link: [{ rel: 'canonical', href: () => `${siteUrl.value}/testimonials` }],
})
</script>

<template>
  <div class="bg-brand-light min-h-screen">
    <!-- Header -->
    <section class="py-16 sm:py-20 px-4 sm:px-8 bg-cream border-b border-brand-dark/[0.07]">
      <div class="max-w-7xl mx-auto text-center">
        <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center justify-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
          {{ $t('home.strip_2') }}
        </p>
        <h1 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark mb-4">
          {{ $t('home.customers_say') }}
        </h1>
        <p class="font-body text-sm text-text-muted max-w-md mx-auto">
          Real stories from customers across Cameroon who trust Thia for their skincare.
        </p>
      </div>
    </section>

    <!-- Grid -->
    <section class="py-16 sm:py-20 px-4 sm:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Populated state -->
        <div v-if="testimonials.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestimonialCard
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            :testimonial="testimonial"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-24">
          <p class="font-heading text-2xl text-brand-dark mb-3">No stories yet</p>
          <p class="font-body text-sm text-text-muted mb-8">Be the first to share your experience with Thia.</p>
          <NuxtLink
            to="/categories"
            class="inline-flex items-center justify-center bg-brand-dark text-cream font-body text-xs tracking-[0.18em] uppercase px-8 py-4 hover:bg-espresso transition-colors duration-200"
          >
            Shop the collection
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
