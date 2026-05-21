<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.faq_title'),
  description: () => t('seo.faq_desc'),
  ogTitle: () => t('seo.faq_title'),
  ogDescription: () => t('seo.faq_desc'),
})

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  label: string
  items: FaqItem[]
}

const categories = computed((): FaqCategory[] => [
  {
    label: t('faq.cat_livraison'),
    items: [
      { q: t('faq.q_livraison_1'), a: t('faq.a_livraison_1') },
      { q: t('faq.q_livraison_2'), a: t('faq.a_livraison_2') },
      { q: t('faq.q_livraison_3'), a: t('faq.a_livraison_3') },
    ],
  },
  {
    label: t('faq.cat_paiement'),
    items: [
      { q: t('faq.q_paiement_1'), a: t('faq.a_paiement_1') },
      { q: t('faq.q_paiement_2'), a: t('faq.a_paiement_2') },
    ],
  },
  {
    label: t('faq.cat_produits'),
    items: [
      { q: t('faq.q_produits_1'), a: t('faq.a_produits_1') },
      { q: t('faq.q_produits_2'), a: t('faq.a_produits_2') },
      { q: t('faq.q_produits_3'), a: t('faq.a_produits_3') },
    ],
  },
  {
    label: t('faq.cat_retours'),
    items: [
      { q: t('faq.q_retours_1'), a: t('faq.a_retours_1') },
      { q: t('faq.q_retours_2'), a: t('faq.a_retours_2') },
    ],
  },
  {
    label: t('faq.cat_compte'),
    items: [
      { q: t('faq.q_compte_1'), a: t('faq.a_compte_1') },
      { q: t('faq.q_compte_2'), a: t('faq.a_compte_2') },
    ],
  },
])

// Track open accordion items with a Set of "catIndex-itemIndex" keys
const openItems = ref<Set<string>>(new Set())

function toggle(key: string) {
  if (openItems.value.has(key)) {
    openItems.value.delete(key)
  } else {
    openItems.value.add(key)
  }
  // Trigger reactivity for Set mutation
  openItems.value = new Set(openItems.value)
}

function isOpen(key: string) {
  return openItems.value.has(key)
}
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <!-- Header -->
    <section class="bg-white border-b border-brand-dark/10 py-14 text-center">
      <div class="mx-auto max-w-2xl px-4">
        <h1 class="font-heading text-4xl font-semibold text-brand-dark">
          {{ $t('faq.title') }}
        </h1>
        <p class="mt-3 font-body text-base text-text-muted">
          {{ $t('faq.subtitle') }}
        </p>
      </div>
    </section>

    <!-- FAQ Categories -->
    <div class="mx-auto max-w-3xl px-4 py-12 space-y-10">
      <section
        v-for="(category, catIdx) in categories"
        :key="catIdx"
      >
        <h2 class="font-heading text-lg font-semibold text-brand-dark mb-4 uppercase tracking-wider text-sm">
          {{ category.label }}
        </h2>
        <div class="rounded-xl border border-brand-dark/10 bg-white overflow-hidden divide-y divide-brand-dark/10">
          <div
            v-for="(item, itemIdx) in category.items"
            :key="itemIdx"
          >
            <button
              type="button"
              class="w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-brand-light"
              :aria-expanded="isOpen(`${catIdx}-${itemIdx}`)"
              @click="toggle(`${catIdx}-${itemIdx}`)"
            >
              <span class="font-body text-sm font-medium text-brand-dark">{{ item.q }}</span>
              <span
                class="shrink-0 text-text-muted accordion-icon"
                :class="{ open: isOpen(`${catIdx}-${itemIdx}`) }"
                aria-hidden="true"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>
            <div
              class="accordion-content px-6"
              :class="{ open: isOpen(`${catIdx}-${itemIdx}`) }"
            >
              <p class="font-body text-sm text-text-muted leading-relaxed pb-5">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact CTA -->
      <div class="rounded-xl border border-brand-dark/10 bg-white px-6 py-8 text-center">
        <p class="font-body text-base text-brand-dark font-medium mb-2">
          {{ $t('faq.contact_cta') }}
        </p>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-brand-accent hover:underline"
        >
          {{ $t('faq.contact_link') }} →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
