<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  productId: string
}>()

const supabase = useSupabaseClient()

interface RawReview {
  id: string
  rating: number
  text: string | null
  created_at: string
  profiles: { full_name: string | null } | null
}

const PAGE_SIZE = 5

const reviews = ref<RawReview[]>([])
const total = ref(0)
const offset = ref(0)
const loading = ref(false)

async function fetchReviews(reset = false) {
  loading.value = true
  const start = reset ? 0 : offset.value

  const { data, count } = await supabase
    .from('reviews')
    .select('id,rating,text,created_at,profiles(full_name)', { count: 'exact' })
    .eq('product_id', props.productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(start, start + PAGE_SIZE - 1)

  if (reset) {
    reviews.value = (data as RawReview[] | null) ?? []
    offset.value = PAGE_SIZE
  } else {
    reviews.value = [...reviews.value, ...((data as RawReview[] | null) ?? [])]
    offset.value += PAGE_SIZE
  }
  total.value = count ?? 0
  loading.value = false
}

await fetchReviews(true)

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.value.length
})

const hasMore = computed(() => reviews.value.length < total.value)

function formatName(profile: { full_name: string | null } | null): string {
  const name = profile?.full_name?.trim()
  if (!name) return 'Customer'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0]!
  return `${parts[0]} ${parts[parts.length - 1]!.charAt(0)}.`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div>
    <h2 class="font-heading text-xl font-semibold text-brand-dark mb-4">Customer Reviews</h2>

    <!-- Summary -->
    <div v-if="reviews.length > 0" class="flex items-center gap-3 mb-6">
      <StarRating :rating="averageRating" size="lg" />
      <span class="font-body text-sm text-text-muted">
        {{ averageRating.toFixed(1) }} · Based on {{ total }} {{ total === 1 ? 'review' : 'reviews' }}
      </span>
    </div>

    <!-- Review list -->
    <div v-if="reviews.length > 0" class="space-y-5">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="border-b border-brand-dark/10 pb-5 last:border-0"
      >
        <div class="flex items-start justify-between gap-2 mb-1">
          <p class="font-body text-sm font-semibold text-brand-dark">{{ formatName(review.profiles) }}</p>
          <time class="font-body text-xs text-text-muted shrink-0">{{ formatDate(review.created_at) }}</time>
        </div>
        <StarRating :rating="review.rating" size="sm" class="mb-2" />
        <p v-if="review.text" class="font-body text-sm text-text-muted leading-relaxed">{{ review.text }}</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="py-8 text-center">
      <p class="font-body text-sm text-text-muted">No reviews yet. Be the first to review this product!</p>
    </div>

    <!-- Load more -->
    <button
      v-if="hasMore"
      type="button"
      class="mt-6 flex items-center gap-1.5 font-body text-sm text-brand-dark hover:text-brand-accent transition-colors disabled:opacity-60"
      :disabled="loading"
      @click="fetchReviews(false)"
    >
      <ChevronDown class="w-4 h-4" />
      {{ loading ? 'Loading...' : 'Load more reviews' }}
    </button>
  </div>
</template>
