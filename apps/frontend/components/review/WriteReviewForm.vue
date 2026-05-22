<script setup lang="ts">
const props = defineProps<{ productId: string }>()
const emit = defineEmits<{ submitted: [] }>()

const uiStore = useUiStore()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const rating = ref(0)
const text = ref('')
const isLoading = ref(false)

const MIN_CHARS = 20
const charCount = computed(() => text.value.trim().length)
const isValid = computed(() => rating.value > 0 && charCount.value >= MIN_CHARS)

async function submit() {
  if (!isValid.value) return
  isLoading.value = true
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    await $fetch(`${apiBase}/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        product_id: props.productId,
        rating: rating.value,
        text: text.value.trim(),
      },
    })

    uiStore.addToast('Review submitted for approval', 'success')
    rating.value = 0
    text.value = ''
    emit('submitted')
  } catch (err: unknown) {
    const fetchErr = err as { data?: { error?: { message?: string } } }
    const msg =
      fetchErr?.data?.error?.message ??
      (err instanceof Error ? err.message : 'Failed to submit review')
    uiStore.addToast(msg, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <h3 class="mb-4 font-heading text-base font-semibold text-brand-dark">Write a Review</h3>

    <form class="space-y-4" @submit.prevent="submit">
      <!-- Star selector -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-brand-dark">Your Rating</label>
        <StarRating
          :rating="rating"
          :interactive="true"
          size="lg"
          @update:rating="rating = $event"
        />
        <p v-if="rating === 0" class="mt-1 text-xs text-text-muted">Click a star to rate</p>
      </div>

      <!-- Review text -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-brand-dark" for="review-text">
          Your Review
        </label>
        <textarea
          id="review-text"
          v-model="text"
          rows="4"
          :placeholder="`Share your experience (at least ${MIN_CHARS} characters)…`"
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-dark placeholder:text-text-muted focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
        />
        <p
          :class="[
            'mt-1 text-xs',
            charCount >= MIN_CHARS ? 'text-text-muted' : 'text-text-muted',
          ]"
        >
          {{ charCount }} / {{ MIN_CHARS }} characters minimum
        </p>
      </div>

      <button
        type="submit"
        :disabled="!isValid || isLoading"
        class="rounded-full bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ isLoading ? 'Submitting…' : 'Submit Review' }}
      </button>
    </form>
  </div>
</template>
