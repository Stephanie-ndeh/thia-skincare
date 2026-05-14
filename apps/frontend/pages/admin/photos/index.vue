<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { Testimonial } from '@thia/shared'

definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const uiStore = useUiStore()
const apiBase = config.public.apiBaseUrl as string

const testimonials = ref<Testimonial[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

// Modal state
const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingTestimonial = ref<Testimonial | null>(null)

// Delete confirmation
const confirmDeleteId = ref<string | null>(null)
const isDeleting = ref(false)

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

async function fetchTestimonials() {
  isLoading.value = true
  fetchError.value = null
  try {
    const token = await getToken()
    if (!token) return
    const res = await $fetch<{ data: Testimonial[] }>(`${apiBase}/admin/testimonials`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    testimonials.value = res.data
  } catch {
    fetchError.value = 'Failed to load testimonials.'
  } finally {
    isLoading.value = false
  }
}

function openCreate() {
  modalMode.value = 'create'
  editingTestimonial.value = null
  modalOpen.value = true
}

function openEdit(testimonial: Testimonial) {
  modalMode.value = 'edit'
  editingTestimonial.value = testimonial
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingTestimonial.value = null
}

async function onFormSuccess() {
  closeModal()
  uiStore.addToast(
    modalMode.value === 'create' ? 'Testimonial added.' : 'Testimonial updated.',
    'success',
  )
  await fetchTestimonials()
}

async function toggleFeatured(testimonial: Testimonial) {
  const prev = testimonial.is_featured
  testimonial.is_featured = !prev
  try {
    const token = await getToken()
    if (!token) throw new Error('No token')
    await $fetch(`${apiBase}/admin/testimonials/${testimonial.id}`, {
      method: 'PUT',
      body: { is_featured: !prev },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    testimonial.is_featured = prev
    uiStore.addToast('Failed to update featured status.', 'error')
  }
}

async function confirmDelete() {
  if (!confirmDeleteId.value) return
  isDeleting.value = true
  try {
    const token = await getToken()
    if (!token) return
    await $fetch(`${apiBase}/admin/testimonials/${confirmDeleteId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    uiStore.addToast('Testimonial deleted.', 'success')
    await fetchTestimonials()
  } catch {
    uiStore.addToast('Failed to delete testimonial.', 'error')
  } finally {
    confirmDeleteId.value = null
    isDeleting.value = false
  }
}

async function moveOrder(index: number, direction: 'up' | 'down') {
  const adjacentIndex = direction === 'up' ? index - 1 : index + 1
  const current = testimonials.value[index]
  const adjacent = testimonials.value[adjacentIndex]
  if (!current || !adjacent) return

  const currentOrder = current.display_order
  const adjacentOrder = adjacent.display_order

  // Optimistic swap
  current.display_order = adjacentOrder
  adjacent.display_order = currentOrder

  try {
    const token = await getToken()
    if (!token) throw new Error('No token')
    await Promise.all([
      $fetch(`${apiBase}/admin/testimonials/${current.id}`, {
        method: 'PUT',
        body: { display_order: adjacentOrder },
        headers: { Authorization: `Bearer ${token}` },
      }),
      $fetch(`${apiBase}/admin/testimonials/${adjacent.id}`, {
        method: 'PUT',
        body: { display_order: currentOrder },
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
    await fetchTestimonials()
  } catch {
    // Revert on error
    current.display_order = currentOrder
    adjacent.display_order = adjacentOrder
    uiStore.addToast('Failed to reorder.', 'error')
  }
}

const maxDisplayOrder = computed(() =>
  testimonials.value.length > 0
    ? Math.max(...testimonials.value.map(t => t.display_order)) + 1
    : 0,
)

onMounted(fetchTestimonials)
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="font-heading text-2xl font-semibold text-brand-dark">
        Client Photos &amp; Testimonials
      </h2>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        @click="openCreate"
      >
        <Plus class="h-4 w-4" />
        Add Testimonial
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="n in 8" :key="n" class="h-48 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700">
      {{ fetchError }}
    </div>

    <!-- Grid -->
    <template v-else>
      <div
        v-if="testimonials.length > 0"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        <TestimonialAdminCard
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.id"
          :testimonial="testimonial"
          :is-first="index === 0"
          :is-last="index === testimonials.length - 1"
          @edit="openEdit(testimonial)"
          @delete="confirmDeleteId = testimonial.id"
          @toggle-featured="toggleFeatured(testimonial)"
          @move-up="moveOrder(index, 'up')"
          @move-down="moveOrder(index, 'down')"
        />
      </div>
      <div v-else class="rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p class="text-sm text-text-muted">No testimonials yet.</p>
        <button
          type="button"
          class="mt-3 text-sm font-medium text-brand-dark underline"
          @click="openCreate"
        >
          Add the first one
        </button>
      </div>
    </template>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModal"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <h3 class="mb-4 text-base font-semibold text-brand-dark">
            {{ modalMode === 'create' ? 'Add Testimonial' : 'Edit Testimonial' }}
          </h3>
          <TestimonialForm
            :mode="modalMode"
            :testimonial="editingTestimonial ?? undefined"
            :default-display-order="maxDisplayOrder"
            @success="onFormSuccess"
            @cancel="closeModal"
          />
        </div>
      </div>
    </Teleport>

    <!-- Delete confirmation -->
    <Teleport to="body">
      <div
        v-if="confirmDeleteId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="confirmDeleteId = null"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-base font-semibold text-brand-dark">Delete testimonial?</h3>
          <p class="mt-1 text-sm text-text-muted">
            This will permanently remove the testimonial and its photo.
          </p>
          <div class="mt-4 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-gray-50"
              @click="confirmDeleteId = null"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="isDeleting"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              @click="confirmDelete"
            >
              {{ isDeleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
