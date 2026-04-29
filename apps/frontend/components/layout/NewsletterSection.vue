<script setup lang="ts">
const supabase = useSupabaseClient()

const email = ref('')
const submitted = ref(false)
const loading = ref(false)

async function handleSubmit() {
  if (!email.value || loading.value) return
  loading.value = true
  try {
    // @ts-expect-error newsletter_signups not yet in generated Supabase types
    await supabase.from('newsletter_signups').insert({ email: email.value })
  } catch {
    // Fail silently — marketing only
  } finally {
    loading.value = false
    submitted.value = true
  }
}
</script>

<template>
  <section class="bg-brand-primary py-16 px-4">
    <div class="max-w-lg mx-auto text-center">
      <h2 class="font-heading text-2xl sm:text-3xl font-semibold text-white mb-3">
        Stay in the loop
      </h2>
      <p class="font-body text-sm text-white/75 mb-8">
        Be the first to hear about new arrivals, offers, and skincare tips from Thia.
      </p>

      <template v-if="!submitted">
        <form class="flex flex-col sm:flex-row gap-3 justify-center" @submit.prevent="handleSubmit">
          <Input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            class="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-brand-accent"
          />
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center justify-center rounded-md bg-brand-accent text-white font-body font-medium text-sm px-6 py-2 hover:bg-brand-accent/90 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            <span
              v-if="loading"
              class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
            {{ loading ? 'Subscribing…' : 'Subscribe' }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="font-body text-white font-medium">You're on the list!</p>
          <p class="font-body text-sm text-white/70">We'll be in touch soon.</p>
        </div>
      </template>
    </div>
  </section>
</template>
