<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { ReviewListItem, ReviewStatus } from '@thia/shared'

definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const uiStore = useUiStore()
const apiBase = config.public.apiBaseUrl as string

const reviews = ref<ReviewListItem[]>([])
const meta = ref<Meta | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)
const pendingCount = ref(0)

const activeStatus = ref<ReviewStatus | 'all'>('pending')
const currentPage = ref(1)

const selectedIds = ref<string[]>([])
const expandedIds = ref<Set<string>>(new Set())

const STATUS_TABS: Array<{ value: ReviewStatus | 'all'; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

async function fetchReviews() {
  isLoading.value = true
  fetchError.value = null
  try {
    const token = await getToken()
    if (!token) return
    const params = new URLSearchParams({
      status: activeStatus.value,
      page: String(currentPage.value),
      limit: '20',
    })
    const res = await $fetch<{ data: ReviewListItem[]; meta: Meta }>(
      `${apiBase}/admin/reviews?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    reviews.value = res.data
    meta.value = res.meta
  } catch {
    fetchError.value = 'Failed to load reviews.'
  } finally {
    isLoading.value = false
  }
}

async function fetchPendingCount() {
  try {
    const token = await getToken()
    if (!token) return
    const res = await $fetch<{ meta: Meta }>(
      `${apiBase}/admin/reviews?status=pending&page=1&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    pendingCount.value = res.meta.total
  } catch { /* ignore */ }
}

watch(activeStatus, () => {
  currentPage.value = 1
  selectedIds.value = []
  expandedIds.value = new Set()
  fetchReviews()
})

watch(currentPage, () => {
  selectedIds.value = []
  expandedIds.value = new Set()
  fetchReviews()
})

// Selection helpers
const allSelected = computed(
  () => reviews.value.length > 0 && reviews.value.every((r) => selectedIds.value.includes(r.id)),
)
const someSelected = computed(() => selectedIds.value.length > 0)

function isSelected(id: string): boolean {
  return selectedIds.value.includes(id)
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = reviews.value.map((r) => r.id)
  }
}

function toggleSelect(id: string) {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

// Expand/collapse review text
function isExpanded(id: string): boolean {
  return expandedIds.value.has(id)
}

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

// Single review status update (optimistic)
async function updateStatus(review: ReviewListItem, status: 'approved' | 'rejected') {
  const prev = review.status
  review.status = status
  try {
    const token = await getToken()
    if (!token) throw new Error('No token')
    await $fetch(`${apiBase}/admin/reviews/${review.id}`, {
      method: 'PATCH',
      body: { status },
      headers: { Authorization: `Bearer ${token}` },
    })
    await fetchPendingCount()
  } catch {
    review.status = prev
    uiStore.addToast('Failed to update review status.', 'error')
  }
}

// Bulk action
async function bulkUpdate(status: 'approved' | 'rejected') {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  try {
    const token = await getToken()
    if (!token) throw new Error('No token')
    await $fetch(`${apiBase}/admin/reviews/bulk`, {
      method: 'PATCH',
      body: { ids, status },
      headers: { Authorization: `Bearer ${token}` },
    })
    selectedIds.value = []
    uiStore.addToast(`${ids.length} review${ids.length === 1 ? '' : 's'} ${status}.`, 'success')
    await Promise.all([fetchReviews(), fetchPendingCount()])
  } catch {
    uiStore.addToast('Bulk action failed.', 'error')
    await fetchReviews()
  }
}

// Formatters
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function statusBadgeClass(status: ReviewStatus): string {
  const map: Record<ReviewStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[status]
}

function emptyLabel(status: ReviewStatus | 'all'): string {
  if (status === 'all') return 'No reviews found'
  return `No ${status} reviews`
}

onMounted(async () => {
  await Promise.all([fetchReviews(), fetchPendingCount()])
})
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <h2 class="font-heading text-2xl font-semibold text-brand-dark">Reviews</h2>
      <span
        v-if="pendingCount > 0"
        class="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700"
      >
        {{ pendingCount }} pending
      </span>
    </div>

    <!-- Status tabs -->
    <div class="flex flex-wrap gap-1 border-b border-gray-200">
      <button
        v-for="tab in STATUS_TABS"
        :key="tab.value"
        type="button"
        :class="[
          'px-3 py-2 text-sm font-medium transition-colors',
          activeStatus === tab.value
            ? 'border-b-2 border-brand-dark text-brand-dark'
            : 'text-text-muted hover:text-brand-dark',
        ]"
        @click="activeStatus = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Bulk action bar -->
    <div
      v-if="someSelected"
      class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5"
    >
      <span class="text-sm font-medium text-brand-dark">
        {{ selectedIds.length }} selected
      </span>
      <button
        type="button"
        class="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
        @click="bulkUpdate('approved')"
      >
        Approve All
      </button>
      <button
        type="button"
        class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
        @click="bulkUpdate('rejected')"
      >
        Reject All
      </button>
      <button
        type="button"
        class="ml-auto text-xs text-text-muted hover:text-brand-dark"
        @click="selectedIds = []"
      >
        Clear selection
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <div v-for="n in 6" :key="n" class="h-16 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700">
      {{ fetchError }}
    </div>

    <!-- Table -->
    <template v-else>
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-100 bg-gray-50">
            <tr>
              <!-- Select all checkbox -->
              <th class="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected && !allSelected"
                  class="h-4 w-4 rounded border-gray-300 accent-brand-dark"
                  @change="toggleSelectAll"
                />
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted"
              >
                Product
              </th>
              <th
                class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell"
              >
                Customer
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted"
              >
                Rating
              </th>
              <th
                class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted lg:table-cell"
              >
                Review
              </th>
              <th
                class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted md:table-cell"
              >
                Date
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted"
              >
                Status
              </th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="reviews.length === 0">
              <td colspan="8" class="px-4 py-10 text-center text-sm text-text-muted">
                {{ emptyLabel(activeStatus) }}
              </td>
            </tr>
            <tr
              v-for="review in reviews"
              :key="review.id"
              class="align-top transition-colors hover:bg-gray-50"
            >
              <!-- Checkbox -->
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="isSelected(review.id)"
                  class="h-4 w-4 rounded border-gray-300 accent-brand-dark"
                  @change="toggleSelect(review.id)"
                />
              </td>

              <!-- Product -->
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/products/${review.product_slug}`"
                  class="font-medium text-brand-dark hover:underline"
                >
                  {{ review.product_name }}
                </NuxtLink>
              </td>

              <!-- Customer -->
              <td class="hidden px-4 py-3 text-text-muted sm:table-cell">
                {{ review.customer_name }}
              </td>

              <!-- Rating -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <StarRating :rating="review.rating" size="sm" />
                  <span class="text-xs text-text-muted">{{ review.rating }}</span>
                </div>
              </td>

              <!-- Review text -->
              <td class="hidden max-w-xs px-4 py-3 lg:table-cell">
                <p class="text-text-muted">
                  <template v-if="isExpanded(review.id) || review.text.length <= 100">
                    {{ review.text }}
                  </template>
                  <template v-else>
                    {{ review.text.slice(0, 100) }}…
                  </template>
                </p>
                <button
                  v-if="review.text.length > 100"
                  type="button"
                  class="mt-0.5 text-xs text-brand-dark hover:underline"
                  @click="toggleExpand(review.id)"
                >
                  {{ isExpanded(review.id) ? 'Show less' : 'Read more' }}
                </button>
              </td>

              <!-- Date -->
              <td class="hidden px-4 py-3 text-text-muted md:table-cell">
                {{ formatDate(review.created_at) }}
              </td>

              <!-- Status -->
              <td class="px-4 py-3 text-center">
                <span
                  :class="[
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    statusBadgeClass(review.status),
                  ]"
                >
                  {{ review.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="review.status !== 'approved'"
                    type="button"
                    class="rounded-lg border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50"
                    @click="updateStatus(review, 'approved')"
                  >
                    Approve
                  </button>
                  <button
                    v-if="review.status !== 'rejected'"
                    type="button"
                    class="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    @click="updateStatus(review, 'rejected')"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.totalPages > 1" class="flex items-center justify-between text-sm">
        <p class="text-text-muted">
          {{ meta.total }} reviews &mdash; page {{ meta.page }} of {{ meta.totalPages }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="currentPage === 1"
            :class="[
              'flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
              currentPage === 1
                ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                : 'border-gray-200 bg-white text-text-muted hover:border-brand-dark',
            ]"
            @click="currentPage--"
          >
            Prev
          </button>
          <button
            v-for="p in meta.totalPages"
            :key="p"
            :class="[
              'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
              p === currentPage
                ? 'border-brand-dark bg-brand-dark text-white'
                : 'border-gray-200 bg-white text-text-muted hover:border-brand-dark',
            ]"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button
            :disabled="currentPage === meta.totalPages"
            :class="[
              'flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
              currentPage === meta.totalPages
                ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                : 'border-gray-200 bg-white text-text-muted hover:border-brand-dark',
            ]"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
