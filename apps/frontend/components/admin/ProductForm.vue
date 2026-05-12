<script setup lang="ts">
import { formatXAF } from '@thia/shared'
import { Trash2, Plus } from 'lucide-vue-next'

interface VariantRow {
  id?: string
  size_label: string
  scent_label: string
  price: number
  stock_quantity: number
}

interface ImageRow {
  id: string
  url: string
  storage_path: string
  is_primary: boolean
  display_order: number
}

interface ProductData {
  id?: string
  name: string
  slug: string
  category_id: string
  description: string | null
  ingredients: string | null
  usage_instructions: string | null
  is_published: boolean
  is_featured: boolean
  product_variants?: VariantRow[]
  product_images?: ImageRow[]
}

interface CategoryRow {
  id: string
  name: string
}

const props = defineProps<{
  mode: 'create' | 'edit'
  product?: ProductData
}>()

const emit = defineEmits<{
  success: [productId: string]
}>()

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const categories = ref<CategoryRow[]>([])
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const validationError = ref<string | null>(null)
const images = ref<ImageRow[]>(
  [...(props.product?.product_images ?? [])].sort((a, b) => a.display_order - b.display_order),
)
const isUploadingImage = ref(false)

const form = reactive({
  name: props.product?.name ?? '',
  slug: props.product?.slug ?? '',
  category_id: props.product?.category_id ?? '',
  description: props.product?.description ?? '',
  ingredients: props.product?.ingredients ?? '',
  usage_instructions: props.product?.usage_instructions ?? '',
  is_published: props.product?.is_published ?? false,
  is_featured: props.product?.is_featured ?? false,
})

const variants = ref<VariantRow[]>(
  props.product?.product_variants && props.product.product_variants.length > 0
    ? props.product.product_variants.map((v) => ({
        id: v.id,
        size_label: v.size_label ?? '',
        scent_label: v.scent_label ?? '',
        price: v.price,
        stock_quantity: v.stock_quantity,
      }))
    : [{ size_label: '', scent_label: '', price: 0, stock_quantity: 0 }],
)

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function onNameInput() {
  if (props.mode === 'create') {
    form.slug = slugify(form.name)
  }
}

function addVariant() {
  variants.value.push({ size_label: '', scent_label: '', price: 0, stock_quantity: 0 })
}

function removeVariant(idx: number) {
  variants.value.splice(idx, 1)
}

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

async function handleSubmit() {
  validationError.value = null
  submitError.value = null

  if (!form.name.trim()) {
    validationError.value = 'Product name is required.'
    return
  }
  if (!form.category_id) {
    validationError.value = 'Category is required.'
    return
  }
  if (variants.value.length === 0) {
    validationError.value = 'At least one variant is required.'
    return
  }
  if (variants.value.some((v) => v.price <= 0)) {
    validationError.value = 'All variant prices must be greater than 0.'
    return
  }

  isSubmitting.value = true
  try {
    const token = await getToken()
    if (!token) return

    const payload = {
      name: form.name,
      slug: form.slug,
      category_id: form.category_id,
      description: form.description || undefined,
      ingredients: form.ingredients || undefined,
      usage_instructions: form.usage_instructions || undefined,
      is_published: form.is_published,
      is_featured: form.is_featured,
      variants: variants.value.map((v, idx) => ({
        ...(v.id ? { id: v.id } : {}),
        size_label: v.size_label || undefined,
        scent_label: v.scent_label || undefined,
        price: v.price,
        stock_quantity: v.stock_quantity,
        display_order: idx,
      })),
    }

    if (props.mode === 'create') {
      const res = await $fetch<{ data: { id: string } }>(`${apiBase}/admin/products`, {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${token}` },
      })
      emit('success', res.data.id)
    } else {
      const res = await $fetch<{ data: { id: string } }>(
        `${apiBase}/admin/products/${props.product!.id}`,
        { method: 'PUT', body: payload, headers: { Authorization: `Bearer ${token}` } },
      )
      emit('success', res.data.id)
    }
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Failed to save product.'
  } finally {
    isSubmitting.value = false
  }
}

async function uploadImage(event: Event) {
  if (!props.product?.id) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isUploadingImage.value = true
  try {
    const token = await getToken()
    if (!token) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await $fetch<{ data: ImageRow }>(`${apiBase}/admin/products/${props.product.id}/images`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    })
    images.value.push(res.data)
  } catch {
    // silently show nothing — could add a toast here
  } finally {
    isUploadingImage.value = false
    input.value = ''
  }
}

async function deleteImage(imageId: string) {
  if (!props.product?.id) return
  const token = await getToken()
  if (!token) return

  await $fetch(`${apiBase}/admin/products/${props.product.id}/images/${imageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  images.value = images.value.filter((img) => img.id !== imageId)

  if (images.value.length > 0 && !images.value.some((img) => img.is_primary)) {
    images.value[0].is_primary = true
  }
}

async function setPrimary(imageId: string) {
  if (!props.product?.id) return
  const token = await getToken()
  if (!token) return

  await $fetch(`${apiBase}/admin/products/${props.product.id}/images/${imageId}/primary`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
  images.value = images.value.map((img) => ({ ...img, is_primary: img.id === imageId }))
}

onMounted(async () => {
  try {
    const res = await $fetch<{ data: CategoryRow[] }>(`${apiBase}/categories`)
    categories.value = res.data
  } catch {
    // non-critical
  }
})
</script>

<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">

    <!-- Basic Info -->
    <section class="rounded-xl border border-gray-200 bg-white p-6">
      <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Basic Info</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-brand-dark">Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.name"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
            placeholder="Product name"
            @input="onNameInput"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-brand-dark">Slug</label>
          <input
            v-model="form.slug"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-brand-dark focus:outline-none"
            placeholder="product-slug"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-brand-dark">Category <span class="text-red-500">*</span></label>
          <select
            v-model="form.category_id"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
          >
            <option value="">Select category…</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-brand-dark">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
            placeholder="Product description…"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-brand-dark">Ingredients</label>
          <textarea
            v-model="form.ingredients"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
            placeholder="Ingredient list…"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-brand-dark">Usage Instructions</label>
          <textarea
            v-model="form.usage_instructions"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
            placeholder="How to use…"
          />
        </div>
      </div>
    </section>

    <!-- Visibility -->
    <section class="rounded-xl border border-gray-200 bg-white p-6">
      <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Visibility</h3>
      <div class="flex flex-wrap gap-6">
        <label class="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
              form.is_published ? 'bg-brand-dark' : 'bg-gray-300',
            ]"
            @click="form.is_published = !form.is_published"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                form.is_published ? 'translate-x-6' : 'translate-x-1',
              ]"
            />
          </button>
          <span class="text-sm font-medium text-brand-dark">Published</span>
        </label>
        <label class="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
              form.is_featured ? 'bg-brand-accent' : 'bg-gray-300',
            ]"
            @click="form.is_featured = !form.is_featured"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                form.is_featured ? 'translate-x-6' : 'translate-x-1',
              ]"
            />
          </button>
          <span class="text-sm font-medium text-brand-dark">Featured</span>
        </label>
      </div>
    </section>

    <!-- Variants -->
    <section class="rounded-xl border border-gray-200 bg-white p-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-text-muted">Variants</h3>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
          @click="addVariant"
        >
          <Plus class="h-3.5 w-3.5" />
          Add Variant
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="(variant, idx) in variants"
          :key="idx"
          class="grid grid-cols-[1fr_1fr_120px_100px_36px] items-center gap-2"
        >
          <input
            v-model="variant.size_label"
            type="text"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
            placeholder="Size (e.g. 50ml)"
          />
          <input
            v-model="variant.scent_label"
            type="text"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
            placeholder="Scent (e.g. Rose)"
          />
          <div class="relative">
            <input
              v-model.number="variant.price"
              type="number"
              min="1"
              step="1"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
              placeholder="Price"
            />
            <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted">XAF</span>
          </div>
          <input
            v-model.number="variant.stock_quantity"
            type="number"
            min="0"
            step="1"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
            placeholder="Stock"
          />
          <button
            type="button"
            :disabled="variants.length === 1"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
            @click="removeVariant(idx)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>

      <p v-if="variants.length > 0" class="mt-2 text-xs text-text-muted">
        Lowest price: {{ formatXAF(Math.min(...variants.map((v) => v.price || 0))) }}
      </p>
    </section>

    <!-- Images (edit mode only) -->
    <section v-if="mode === 'edit' && product?.id" class="rounded-xl border border-gray-200 bg-white p-6">
      <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Images</h3>

      <div class="flex flex-wrap gap-3">
        <div
          v-for="img in images"
          :key="img.id"
          class="group relative"
        >
          <img
            :src="img.url"
            :alt="'Product image'"
            :class="[
              'h-20 w-20 cursor-pointer rounded-lg object-cover ring-2 transition-all',
              img.is_primary ? 'ring-brand-dark' : 'ring-transparent hover:ring-gray-300',
            ]"
            @click="setPrimary(img.id)"
          />
          <span
            v-if="img.is_primary"
            class="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-dark px-1.5 py-0.5 text-[10px] font-medium text-white"
          >
            Primary
          </span>
          <button
            type="button"
            class="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow group-hover:flex"
            @click="deleteImage(img.id)"
          >
            <Trash2 class="h-3 w-3" />
          </button>
        </div>

        <!-- Upload slot -->
        <label
          class="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-brand-dark hover:text-brand-dark"
        >
          <Plus class="h-5 w-5" />
          <span class="mt-1 text-xs">{{ isUploadingImage ? 'Uploading…' : 'Upload' }}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="sr-only"
            :disabled="isUploadingImage"
            @change="uploadImage"
          />
        </label>
      </div>
      <p class="mt-2 text-xs text-text-muted">Click image to set as primary. Max 5 MB per file.</p>
    </section>

    <!-- Errors & Submit -->
    <div class="space-y-3">
      <p v-if="validationError" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ validationError }}
      </p>
      <p v-if="submitError" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ submitError }}
      </p>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="rounded-lg bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ isSubmitting ? 'Saving…' : (mode === 'create' ? 'Create Product' : 'Update Product') }}
      </button>
    </div>

  </form>
</template>
