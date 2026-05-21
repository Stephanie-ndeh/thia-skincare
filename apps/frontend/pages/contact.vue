<script setup lang="ts">
import { MessageCircle, Mail, Phone, MapPin, CheckCircle } from 'lucide-vue-next'
import type { ContactRequest } from '@thia/shared'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Contact — Thia',
  description: "Get in touch with Thia's skincare experts. We respond within 24 hours.",
})

const { t } = useI18n()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string
const uiStore = useUiStore()

const subjects = computed(() => [
  t('contact.subject_1'),
  t('contact.subject_2'),
  t('contact.subject_3'),
  t('contact.subject_4'),
  t('contact.subject_5'),
])

const selectedSubject = ref(t('contact.subject_1'))

const form = reactive({
  name: '',
  email: '',
  phone: '',
  orderNumber: '',
  message: '',
  privacyConsent: false,
})

const isSending = ref(false)
const isSuccess = ref(false)

async function handleSubmit() {
  if (isSending.value || !form.privacyConsent) return
  isSending.value = true
  try {
    const body: ContactRequest = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      subject: selectedSubject.value,
      subject_type: selectedSubject.value,
      message: form.message,
    }
    await $fetch(`${apiBase}/contact`, {
      method: 'POST',
      body,
    })
    isSuccess.value = true
  } catch {
    uiStore.addToast(t('contact.error'), 'error')
  } finally {
    isSending.value = false
  }
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.orderNumber = ''
  form.message = ''
  form.privacyConsent = false
  selectedSubject.value = t('contact.subject_1')
  isSuccess.value = false
}
</script>

<template>
  <div class="min-h-screen" style="background: var(--color-cream, #FAF7F2);">

    <!-- Section 1 — Send Us a Message -->
    <section class="mx-auto max-w-7xl px-6 lg:px-10 py-16">

      <!-- Section header row -->
      <div class="flex items-center justify-between border-b border-border pb-4 mb-8">
        <div class="flex items-center gap-3">
          <span class="font-heading text-terracotta" style="font-size: 18px;">§ 01</span>
          <span class="font-body text-[10px] tracking-[0.2em] uppercase text-text-muted">
            {{ $t('contact.section1_label') }}
          </span>
        </div>
        <span class="font-body text-text-muted text-sm">—</span>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 items-start">

        <!-- Form column -->
        <div>
          <!-- Headline -->
          <h1 class="font-heading font-bold mb-4 leading-tight" style="font-size: clamp(36px, 5vw, 52px);">
            <span class="text-brand-dark">{{ $t('contact.headline_1') }}</span><br>
            <span class="italic text-terracotta">{{ $t('contact.headline_2') }}</span>
          </h1>
          <p class="font-body text-text-muted mb-8 max-w-sm" style="font-size: 13px; line-height: 1.65;">
            {{ $t('contact.subtext') }}
          </p>

          <!-- Success state -->
          <div v-if="isSuccess" class="text-center py-16">
            <CheckCircle class="mx-auto mb-4 text-terracotta" style="width: 48px; height: 48px;" />
            <p class="font-heading text-brand-dark mb-2" style="font-size: 24px;">{{ $t('contact.success_title') }}</p>
            <p class="font-body text-text-muted mb-6" style="font-size: 14px;">{{ $t('contact.success_body') }}</p>
            <button
              class="font-body text-[11px] tracking-[0.18em] uppercase border border-brand-dark/30 px-6 py-3 text-brand-dark hover:border-brand-dark transition-colors"
              @click="resetForm"
            >
              {{ $t('contact.success_reset') }}
            </button>
          </div>

          <!-- Form -->
          <form v-else class="space-y-5" @submit.prevent="handleSubmit">
            <!-- Row 1: Name + Email -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-body text-[10px] tracking-[0.18em] uppercase text-text-muted mb-1.5">
                  {{ $t('contact.field_name') }} *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  minlength="2"
                  autocomplete="name"
                  class="w-full border border-border bg-white px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none"
                  style="font-size: 14px;"
                >
              </div>
              <div>
                <label class="block font-body text-[10px] tracking-[0.18em] uppercase text-text-muted mb-1.5">
                  {{ $t('contact.field_email') }} *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  inputmode="email"
                  autocomplete="email"
                  class="w-full border border-border bg-white px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none"
                  style="font-size: 14px;"
                >
              </div>
            </div>

            <!-- Row 2: Phone + Order Number -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-body text-[10px] tracking-[0.18em] uppercase text-text-muted mb-1.5">
                  {{ $t('contact.field_phone') }}
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="+237 ..."
                  class="w-full border border-border bg-white px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none"
                  style="font-size: 14px;"
                >
              </div>
              <div>
                <label class="block font-body text-[10px] tracking-[0.18em] uppercase text-text-muted mb-1.5">
                  {{ $t('contact.field_order') }}
                </label>
                <input
                  v-model="form.orderNumber"
                  type="text"
                  placeholder="#THIA-2026-..."
                  class="w-full border border-border bg-white px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none"
                  style="font-size: 14px;"
                >
              </div>
            </div>

            <!-- Subject pills -->
            <div>
              <p class="font-body text-[10px] tracking-[0.18em] uppercase text-text-muted mb-3">
                {{ $t('contact.subject_label') }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="subj in subjects"
                  :key="subj"
                  type="button"
                  class="rounded-full px-4 py-2 font-body text-xs cursor-pointer transition-all"
                  :class="selectedSubject === subj
                    ? 'bg-espresso text-cream'
                    : 'border border-border text-brand-dark hover:border-brand-dark'"
                  @click="selectedSubject = subj"
                >
                  {{ subj }}
                </button>
              </div>
            </div>

            <!-- Message -->
            <div>
              <label class="block font-body text-[10px] tracking-[0.18em] uppercase text-text-muted mb-1.5">
                {{ $t('contact.message_label') }}
              </label>
              <textarea
                v-model="form.message"
                required
                minlength="10"
                rows="5"
                :placeholder="$t('contact.message_placeholder')"
                class="w-full resize-none border border-border bg-white px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none"
                style="font-size: 14px;"
              />
            </div>

            <!-- Privacy + Submit -->
            <div class="space-y-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  v-model="form.privacyConsent"
                  type="checkbox"
                  class="mt-0.5 shrink-0 accent-espresso"
                >
                <span class="font-body text-[12px] text-text-muted leading-relaxed">
                  {{ $t('contact.privacy_text') }}
                </span>
              </label>
              <button
                type="submit"
                :disabled="isSending || !form.privacyConsent"
                class="w-full h-12 font-body text-xs tracking-[0.18em] uppercase transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style="background: var(--color-espresso, #2C1810); color: var(--color-cream, #FAF7F2);"
              >
                {{ $t('contact.submit_button') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Location card column -->
        <div>
          <div class="border rounded-lg p-6">
            <p class="font-body text-[10px] tracking-[0.2em] uppercase text-terracotta mb-3">
              {{ $t('contact.location_eyebrow') }}
            </p>
            <p class="font-heading font-bold text-brand-dark mb-1" style="font-size: 20px;">
              {{ $t('contact.location_name') }}
            </p>
            <p class="font-body text-text-muted mb-5" style="font-size: 12px;">
              {{ $t('contact.location_hours') }}
            </p>

            <!-- SVG Radar map -->
            <svg viewBox="0 0 300 200" width="100%" class="mb-5" aria-hidden="true">
              <!-- Concentric circles -->
              <circle cx="150" cy="100" r="80" fill="none" stroke="var(--color-terracotta, #C4714A)" stroke-width="0.5" opacity="0.3" />
              <circle cx="150" cy="100" r="55" fill="none" stroke="var(--color-terracotta, #C4714A)" stroke-width="0.5" opacity="0.4" />
              <circle cx="150" cy="100" r="30" fill="none" stroke="var(--color-terracotta, #C4714A)" stroke-width="0.5" opacity="0.5" />
              <!-- Dashed crosshair lines -->
              <line x1="150" y1="20" x2="150" y2="180" stroke="var(--color-terracotta, #C4714A)" stroke-width="0.5" stroke-dasharray="4 4" opacity="0.3" />
              <line x1="70" y1="100" x2="230" y2="100" stroke="var(--color-terracotta, #C4714A)" stroke-width="0.5" stroke-dasharray="4 4" opacity="0.3" />
              <!-- Center dot -->
              <circle cx="150" cy="100" r="6" fill="var(--color-terracotta, #C4714A)" opacity="0.8" />
              <!-- Label -->
              <text x="158" y="90" font-family="sans-serif" font-size="9" fill="var(--color-terracotta, #C4714A)" opacity="0.7">ATELIER</text>
            </svg>

            <a
              href="https://maps.google.com/?q=Bonamousadi+Douala"
              target="_blank"
              rel="noopener noreferrer"
              class="font-body uppercase tracking-wider text-terracotta hover:underline"
              style="font-size: 11px;"
            >
              {{ $t('contact.location_directions') }}
            </a>
          </div>
        </div>

      </div>
    </section>

    <!-- Section 2 — Four Ways to Reach Us -->
    <section class="mx-auto max-w-7xl px-6 lg:px-10 pb-16">

      <!-- Section header row -->
      <div class="flex items-center justify-between border-t border-b border-border py-4 mb-8">
        <div class="flex items-center gap-3">
          <span class="font-heading text-terracotta" style="font-size: 18px;">§ 02</span>
          <span class="font-body text-[10px] tracking-[0.2em] uppercase text-text-muted">
            {{ $t('contact.section2_label') }}
          </span>
        </div>
        <span class="font-body text-text-muted text-sm">{{ $t('contact.section2_right') }}</span>
      </div>

      <!-- 4 contact cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- WhatsApp -->
        <div class="border border-border rounded p-6">
          <div class="flex justify-between items-center mb-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(196,113,74,0.1);">
              <MessageCircle class="text-terracotta" style="width: 20px; height: 20px;" />
            </div>
            <span class="font-body text-text-muted" style="font-size: 11px;">01</span>
          </div>
          <p class="font-body uppercase tracking-wider text-text-muted mb-2" style="font-size: 9px;">
            {{ $t('contact.card_1_eyebrow') }}
          </p>
          <p class="font-heading font-bold text-brand-dark mb-1" style="font-size: 22px;">
            {{ $t('contact.card_1_value') }}
          </p>
          <p class="font-body text-text-muted mb-4" style="font-size: 11px;">
            {{ $t('contact.card_1_subtitle') }}
          </p>
          <a
            href="https://wa.me/237670076224"
            target="_blank"
            rel="noopener noreferrer"
            class="font-body uppercase tracking-wider text-terracotta hover:underline"
            style="font-size: 11px;"
          >
            {{ $t('contact.card_1_cta') }}
          </a>
        </div>

        <!-- Email -->
        <div class="border border-border rounded p-6">
          <div class="flex justify-between items-center mb-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(196,113,74,0.1);">
              <Mail class="text-terracotta" style="width: 20px; height: 20px;" />
            </div>
            <span class="font-body text-text-muted" style="font-size: 11px;">02</span>
          </div>
          <p class="font-body uppercase tracking-wider text-text-muted mb-2" style="font-size: 9px;">
            {{ $t('contact.card_2_eyebrow') }}
          </p>
          <p class="font-heading font-bold text-brand-dark mb-1" style="font-size: 22px; word-break: break-all;">
            {{ $t('contact.card_2_value') }}
          </p>
          <p class="font-body text-text-muted mb-4" style="font-size: 11px;">
            {{ $t('contact.card_2_subtitle') }}
          </p>
          <a
            href="mailto:hello@thia.cm"
            class="font-body uppercase tracking-wider text-terracotta hover:underline"
            style="font-size: 11px;"
          >
            {{ $t('contact.card_2_cta') }}
          </a>
        </div>

        <!-- Phone -->
        <div class="border border-border rounded p-6">
          <div class="flex justify-between items-center mb-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(196,113,74,0.1);">
              <Phone class="text-terracotta" style="width: 20px; height: 20px;" />
            </div>
            <span class="font-body text-text-muted" style="font-size: 11px;">03</span>
          </div>
          <p class="font-body uppercase tracking-wider text-text-muted mb-2" style="font-size: 9px;">
            {{ $t('contact.card_3_eyebrow') }}
          </p>
          <p class="font-heading font-bold text-brand-dark mb-1" style="font-size: 22px;">
            {{ $t('contact.card_3_value') }}
          </p>
          <p class="font-body text-text-muted mb-4" style="font-size: 11px;">
            {{ $t('contact.card_3_subtitle') }}
          </p>
          <a
            href="tel:+237670076224"
            class="font-body uppercase tracking-wider text-terracotta hover:underline"
            style="font-size: 11px;"
          >
            {{ $t('contact.card_3_cta') }}
          </a>
        </div>

        <!-- Atelier -->
        <div class="border border-border rounded p-6">
          <div class="flex justify-between items-center mb-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(196,113,74,0.1);">
              <MapPin class="text-terracotta" style="width: 20px; height: 20px;" />
            </div>
            <span class="font-body text-text-muted" style="font-size: 11px;">04</span>
          </div>
          <p class="font-body uppercase tracking-wider text-text-muted mb-2" style="font-size: 9px;">
            {{ $t('contact.card_4_eyebrow') }}
          </p>
          <p class="font-heading font-bold text-brand-dark mb-1" style="font-size: 22px;">
            {{ $t('contact.card_4_value') }}
          </p>
          <p class="font-body text-text-muted mb-4" style="font-size: 11px;">
            {{ $t('contact.card_4_subtitle') }}
          </p>
          <a
            href="https://maps.google.com/?q=Bonamousadi+Douala"
            target="_blank"
            rel="noopener noreferrer"
            class="font-body uppercase tracking-wider text-terracotta hover:underline"
            style="font-size: 11px;"
          >
            {{ $t('contact.card_4_cta') }}
          </a>
        </div>

      </div>
    </section>

  </div>
</template>
