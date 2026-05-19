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
  <section class="py-16 sm:py-20 px-4 sm:px-8 bg-cream border-t border-brand-dark/[0.08]">
    <div class="max-w-5xl mx-auto">
      <div class="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
        <!-- Left: copy -->
        <div>
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-5 flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Letters from the Lab
          </p>
          <h2 class="font-heading text-4xl sm:text-5xl font-semibold text-brand-dark leading-[1.1] mb-4">
            Slow beauty,<br>in your inbox.
          </h2>
          <p class="font-body text-sm text-text-muted leading-relaxed">
            One letter a month. New drops, the botanicals we're sourcing, and the women behind them.
          </p>
        </div>

        <!-- Right: form -->
        <div>
          <template v-if="!submitted">
            <form class="flex" @submit.prevent="handleSubmit">
              <Input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                class="flex-1 rounded-none border-r-0 border-brand-dark/20 bg-white text-brand-dark placeholder:text-text-muted focus-visible:ring-terracotta focus-visible:ring-offset-0 focus-visible:ring-1"
              />
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex items-center justify-center bg-brand-dark text-white font-body text-xs tracking-[0.12em] uppercase px-6 py-3 hover:bg-espresso disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
              >
                <span
                  v-if="loading"
                  class="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
                {{ loading ? 'Subscribing…' : 'Subscribe →' }}
              </button>
            </form>
            <p class="font-body text-[11px] text-text-muted mt-3">
              We'll never share your email. Unsubscribe any time.
            </p>
          </template>

          <template v-else>
            <div class="flex flex-col gap-2">
              <p class="font-heading text-2xl font-semibold text-brand-dark">You're on the list.</p>
              <p class="font-body text-sm text-text-muted">We'll be in touch soon.</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
