<script setup lang="ts">
import type { Testimonial } from '@thia/shared'

const props = defineProps<{
  mode: 'create' | 'edit'
  testimonial?: Testimonial
  defaultDisplayOrder?: number
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const uiStore = useUiStore()
const apiBase = config.public.apiBaseUrl as string

const customerName = ref(props.testimonial?.customer_name ?? '')
const text = ref(props.testimonial?.text ?? '')
const isFeatured = ref(props.testimonial?.is_featured ?? false)
const displayOrder = ref(props.testimonial?.display_order ?? props.defaultDisplayOrder ?? 0)
const photoFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isSubmitting = ref(false)

const photoInputRef = ref<HTMLInputElement | null>(null)

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

function handlePhotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    uiStore.addToast('Photo must be under 5 MB.', 'error')
    return
  }
  photoFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function handleSubmit() {
  if (!customerName.value.trim() || !text.value.trim()) return
  if (text.value.trim().length < 10) {
    uiStore.addToast('Review text must be at least 10 characters.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const token = await getToken()
    if (!token) throw new Error('Not authenticated')

    if (props.mode === 'create') {
      const formData = new FormData()
      formData.append('customer_name', customerName.value.trim())
      formData.append('text', text.value.trim())
      formData.append('is_featured', String(isFeatured.value))
      formData.append('display_order', String(displayOrder.value))
      if (photoFile.value) formData.append('photo', photoFile.value)

      await $fetch(`${apiBase}/admin/testimonials`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      })
    } else {
      // Step 1: Update text fields
      await $fetch(`${apiBase}/admin/testimonials/${props.testimonial!.id}`, {
        method: 'PUT',
        body: {
          customer_name: customerName.value.trim(),
          text: text.value.trim(),
          is_featured: isFeatured.value,
          display_order: displayOrder.value,
        },
        headers: { Authorization: `Bearer ${token}` },
      })

      // Step 2: Upload new photo if selected
      if (photoFile.value) {
        const formData = new FormData()
        formData.append('photo', photoFile.value)
        await $fetch(`${apiBase}/admin/testimonials/${props.testimonial!.id}/photo`, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    }

    emit('success')
  } catch {
    uiStore.addToast('Failed to save testimonial.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const currentPhotoUrl = computed(() => previewUrl.value ?? props.testimonial?.photo_url ?? null)
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- Customer Name -->
    <div>
      <label class="mb-1 block text-sm font-medium text-brand-dark">Customer Name *</label>
      <input
        v-model="customerName"
        type="text"
        required
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
        placeholder="e.g. Amara N."
      />
    </div>

    <!-- Review Text -->
    <div>
      <label class="mb-1 block text-sm font-medium text-brand-dark">Review Text *</label>
      <textarea
        v-model="text"
        required
        rows="3"
        minlength="10"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
        placeholder="What did the customer say?"
      />
    </div>

    <!-- Photo upload -->
    <div>
      <label class="mb-1 block text-sm font-medium text-brand-dark">Photo (optional)</label>

      <!-- Preview -->
      <div v-if="currentPhotoUrl" class="mb-2 flex items-center gap-3">
        <img
          :src="currentPhotoUrl"
          alt="Preview"
          class="h-14 w-14 rounded-full object-cover"
        />
        <button
          type="button"
          class="text-xs text-brand-dark underline"
          @click="photoInputRef?.click()"
        >
          Change photo
        </button>
      </div>

      <input
        ref="photoInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :class="currentPhotoUrl ? 'hidden' : 'block w-full text-sm text-text-muted'"
        @change="handlePhotoChange"
      />
      <p v-if="!currentPhotoUrl" class="mt-1 text-xs text-text-muted">
        JPEG, PNG or WebP — max 5 MB
      </p>
    </div>

    <!-- Display order -->
    <div>
      <label class="mb-1 block text-sm font-medium text-brand-dark">Display Order</label>
      <input
        v-model.number="displayOrder"
        type="number"
        min="0"
        class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
      />
    </div>

    <!-- Is Featured toggle -->
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-brand-dark">Featured</span>
      <button
        type="button"
        :class="[
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          isFeatured ? 'bg-amber-400' : 'bg-gray-300',
        ]"
        @click="isFeatured = !isFeatured"
      >
        <span
          :class="[
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
            isFeatured ? 'translate-x-4' : 'translate-x-0.5',
          ]"
        />
      </button>
      <span class="text-xs text-text-muted">Shows on homepage</span>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
      <button
        type="button"
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-gray-50"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || !customerName.trim() || !text.trim()"
        class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Saving…' : mode === 'create' ? 'Add Testimonial' : 'Save Changes' }}
      </button>
    </div>
  </form>
</template>
