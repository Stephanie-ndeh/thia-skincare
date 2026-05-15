<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.contact_title'),
  description: () => t('seo.contact_desc'),
  ogTitle: () => t('seo.contact_title'),
  ogDescription: () => t('seo.contact_desc'),
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string
const uiStore = useUiStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const isSending = ref(false)
const isSuccess = ref(false)

const subjects = computed(() => [
  t('contact.subject_general'),
  t('contact.subject_order'),
  t('contact.subject_product'),
  t('contact.subject_return'),
  t('contact.subject_other'),
])

async function handleSubmit() {
  if (isSending.value) return
  isSending.value = true
  try {
    await $fetch(`${apiBase}/contact`, {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        message: form.message,
      },
    })
    isSuccess.value = true
  } catch {
    uiStore.addToast(t('contact.error'), 'error')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <!-- Header -->
    <section class="bg-white border-b border-brand-dark/10 py-14 text-center">
      <div class="mx-auto max-w-2xl px-4">
        <h1 class="font-heading text-4xl font-semibold text-brand-dark">
          {{ $t('contact.title') }}
        </h1>
        <p class="mt-3 font-body text-base text-text-muted">
          {{ $t('contact.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Two column layout -->
    <div class="mx-auto max-w-6xl px-4 py-12">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <!-- Left: Contact info -->
        <div class="space-y-8">
          <h2 class="font-heading text-2xl font-semibold text-brand-dark">
            {{ $t('contact.info_title') }}
          </h2>

          <!-- Phone -->
          <div>
            <p class="font-body text-xs uppercase tracking-wider text-text-muted mb-2">
              {{ $t('contact.phone') }}
            </p>
            <a
              href="tel:+237670076224"
              class="block font-body text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors"
            >
              +237 670 076 224
            </a>
            <a
              href="tel:+237676328226"
              class="block font-body text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors mt-1"
            >
              +237 676 328 226
            </a>
          </div>

          <!-- WhatsApp -->
          <div>
            <p class="font-body text-xs uppercase tracking-wider text-text-muted mb-2">
              {{ $t('contact.whatsapp') }}
            </p>
            <a
              href="https://wa.me/237670076224"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <svg class="h-4 w-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {{ $t('contact.whatsapp_btn') }}
            </a>
          </div>

          <!-- Email -->
          <div>
            <p class="font-body text-xs uppercase tracking-wider text-text-muted mb-2">
              {{ $t('contact.email_label') }}
            </p>
            <a
              href="mailto:hello@thia.cm"
              class="font-body text-sm font-medium text-brand-dark hover:text-brand-accent transition-colors"
            >
              hello@thia.cm
            </a>
          </div>

          <!-- Address -->
          <div>
            <p class="font-body text-xs uppercase tracking-wider text-text-muted mb-2">
              {{ $t('contact.address_label') }}
            </p>
            <p class="font-body text-sm text-brand-dark">{{ $t('contact.address_value') }}</p>
          </div>

          <!-- Hours -->
          <div>
            <p class="font-body text-xs uppercase tracking-wider text-text-muted mb-2">
              {{ $t('contact.hours_label') }}
            </p>
            <p class="font-body text-sm text-brand-dark">{{ $t('contact.hours_value') }}</p>
          </div>
        </div>

        <!-- Right: Form -->
        <div class="rounded-xl bg-white p-6 sm:p-8 border border-brand-dark/10">
          <!-- Success state -->
          <div v-if="isSuccess" class="flex flex-col items-center justify-center text-center py-10 gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg class="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="font-heading text-xl font-semibold text-brand-dark">
              {{ $t('contact.success_title') }}
            </h3>
            <p class="font-body text-sm text-text-muted">{{ $t('contact.success_message') }}</p>
          </div>

          <!-- Form -->
          <form v-else class="space-y-5" @submit.prevent="handleSubmit">
            <h2 class="font-heading text-xl font-semibold text-brand-dark mb-1">
              {{ $t('contact.form_title') }}
            </h2>

            <!-- Name -->
            <div>
              <label class="block font-body text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
                {{ $t('contact.name') }}
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                minlength="2"
                inputmode="text"
                autocomplete="name"
                class="text-base w-full rounded-lg border border-brand-dark/20 bg-brand-light px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
              >
            </div>

            <!-- Email -->
            <div>
              <label class="block font-body text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
                {{ $t('contact.email') }}
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                inputmode="email"
                autocomplete="email"
                class="text-base w-full rounded-lg border border-brand-dark/20 bg-brand-light px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
              >
            </div>

            <!-- Phone (optional) -->
            <div>
              <label class="block font-body text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
                {{ $t('contact.phone_optional') }}
              </label>
              <input
                v-model="form.phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                class="text-base w-full rounded-lg border border-brand-dark/20 bg-brand-light px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
              >
            </div>

            <!-- Subject -->
            <div>
              <label class="block font-body text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
                {{ $t('contact.subject') }}
              </label>
              <select
                v-model="form.subject"
                required
                class="text-base w-full rounded-lg border border-brand-dark/20 bg-brand-light px-4 py-3 font-body text-sm text-brand-dark focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
              >
                <option value="" disabled>{{ $t('contact.subject_placeholder') }}</option>
                <option v-for="subj in subjects" :key="subj" :value="subj">{{ subj }}</option>
              </select>
            </div>

            <!-- Message -->
            <div>
              <label class="block font-body text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
                {{ $t('contact.message') }}
              </label>
              <textarea
                v-model="form.message"
                required
                minlength="20"
                rows="5"
                :placeholder="$t('contact.message_placeholder')"
                class="text-base w-full resize-none rounded-lg border border-brand-dark/20 bg-brand-light px-4 py-3 font-body text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
              />
            </div>

            <button
              type="submit"
              :disabled="isSending"
              class="w-full rounded-lg bg-brand-dark px-6 py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSending ? $t('contact.sending') : $t('contact.send') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
