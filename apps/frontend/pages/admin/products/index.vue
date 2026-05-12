<script setup lang="ts">
import { formatXAF } from '@thia/shared'
import { useDebounceFn } from '@vueuse/core'
import { Pencil, Trash2, Plus } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

interface AdminProductRow {
  id: string
  name: string
  slug: string
  category_id: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  categories: { id: string; name: string } | null
  product_variants: { price: number; stock_quantity: number }[]
  product_images: { url: string; is_primary: boolean }[]
}

interface CategoryRow {
  id: string
  name: string
}

interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const products = ref<AdminProductRow[]>([])
const categories = ref<CategoryRow[]>([])
const meta = ref<Meta | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const search = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const confirmDeleteId = ref<string | null>(null)

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

async function fetchProducts() {
  isLoading.value = true
  fetchError.value = null
  try {
    const token = await getToken()
    if (!token) return

    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: '20',
    })
    if (search.value) params.set('search', search.value)
    if (categoryFilter.value) params.set('category_id', categoryFilter.value)

    const res = await $fetch<{ data: AdminProductRow[]; meta: Meta }>(
      `${apiBase}/admin/products?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    products.value = res.data
    meta.value = res.meta
  } catch {
    fetchError.value = 'Failed to load products.'
  } finally {
    isLoading.value = false
  }
}

const debouncedFetch = useDebounceFn(fetchProducts, 300)

watch(search, () => {
  currentPage.value = 1
  debouncedFetch()
})

watch(categoryFilter, () => {
  currentPage.value = 1
  fetchProducts()
})

watch(currentPage, fetchProducts)

async function toggleField(product: AdminProductRow, field: 'is_published' | 'is_featured') {
  const token = await getToken()
  if (!token) return
  const newValue = !product[field]
  product[field] = newValue
  try {
    await $fetch(`${apiBase}/admin/products/${product.id}/toggle`, {
      method: 'PATCH',
      body: { field, value: newValue },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    product[field] = !newValue
  }
}

async function deleteProduct() {
  if (!confirmDeleteId.value) return
  const token = await getToken()
  if (!token) return
  try {
    await $fetch(`${apiBase}/admin/products/${confirmDeleteId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    await fetchProducts()
  } catch {
    // ignore
  } finally {
    confirmDeleteId.value = null
  }
}

function primaryImage(product: AdminProductRow): string | null {
  const primary = product.product_images?.find((img) => img.is_primary)
  return primary?.url ?? product.product_images?.[0]?.url ?? null
}

function lowestStock(product: AdminProductRow): number {
  const stocks = product.product_variants?.map((v) => v.stock_quantity) ?? []
  return stocks.length > 0 ? Math.min(...stocks) : 0
}

onMounted(async () => {
  const [, res] = await Promise.allSettled([
    fetchProducts(),
    $fetch<{ data: CategoryRow[] }>(`${apiBase}/categories`),
  ])
  if (res.status === 'fulfilled') {
    categories.value = (res.value as { data: CategoryRow[] }).data
  }
})
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="font-heading text-2xl font-semibold text-brand-dark">Products</h2>
      <NuxtLink
        to="/admin/products/new"
        class="flex items-center gap-2 rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        <Plus class="h-4 w-4" />
        Add Product
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <input
        v-model="search"
        type="search"
        class="min-w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
        placeholder="Search by name…"
      />
      <select
        v-model="categoryFilter"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
      >
        <option value="">All categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <div v-for="n in 6" :key="n" class="h-14 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <!-- Error -->
    <div
      v-else-if="fetchError"
      class="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700"
    >
      {{ fetchError }}
    </div>

    <!-- Table -->
    <template v-else>
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-100 bg-gray-50">
            <tr>
              <th class="w-12 px-4 py-3" />
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">Name</th>
              <th class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell">Category</th>
              <th class="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted md:table-cell">Variants</th>
              <th class="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted lg:table-cell">Stock</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted">Published</th>
              <th class="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell">Featured</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="products.length === 0">
              <td colspan="8" class="px-4 py-10 text-center text-sm text-text-muted">No products found</td>
            </tr>
            <tr
              v-for="product in products"
              :key="product.id"
              class="transition-colors hover:bg-gray-50"
            >
              <!-- Thumb -->
              <td class="px-4 py-3">
                <img
                  v-if="primaryImage(product)"
                  :src="primaryImage(product)!"
                  :alt="product.name"
                  class="h-10 w-10 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-text-muted"
                >
                  —
                </div>
              </td>

              <td class="px-4 py-3 font-medium text-brand-dark">{{ product.name }}</td>

              <td class="hidden px-4 py-3 text-text-muted sm:table-cell">
                {{ product.categories?.name ?? '—' }}
              </td>

              <td class="hidden px-4 py-3 text-center text-text-muted md:table-cell">
                {{ product.product_variants?.length ?? 0 }}
              </td>

              <td class="hidden px-4 py-3 text-center lg:table-cell">
                <span
                  :class="[
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                    lowestStock(product) === 0
                      ? 'bg-red-100 text-red-700'
                      : lowestStock(product) < 5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700',
                  ]"
                >
                  {{ lowestStock(product) }}
                </span>
              </td>

              <!-- Published toggle -->
              <td class="px-4 py-3 text-center">
                <button
                  type="button"
                  :class="[
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                    product.is_published ? 'bg-brand-dark' : 'bg-gray-300',
                  ]"
                  @click="toggleField(product, 'is_published')"
                >
                  <span
                    :class="[
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                      product.is_published ? 'translate-x-4' : 'translate-x-0.5',
                    ]"
                  />
                </button>
              </td>

              <!-- Featured toggle -->
              <td class="hidden px-4 py-3 text-center sm:table-cell">
                <button
                  type="button"
                  :class="[
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                    product.is_featured ? 'bg-brand-accent' : 'bg-gray-300',
                  ]"
                  @click="toggleField(product, 'is_featured')"
                >
                  <span
                    :class="[
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                      product.is_featured ? 'translate-x-4' : 'translate-x-0.5',
                    ]"
                  />
                </button>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/products/${product.id}`"
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-text-muted transition-colors hover:border-brand-dark hover:text-brand-dark"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </NuxtLink>
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                    @click="confirmDeleteId = product.id"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
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
          {{ meta.total }} products &mdash; page {{ meta.page }} of {{ meta.totalPages }}
        </p>
        <div class="flex items-center gap-1">
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
        </div>
      </div>
    </template>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="confirmDeleteId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="confirmDeleteId = null"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-base font-semibold text-brand-dark">Delete product?</h3>
          <p class="mt-1 text-sm text-text-muted">
            This will unpublish the product. The record is not permanently removed.
          </p>
          <div class="mt-4 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-gray-50"
              @click="confirmDeleteId = null"
            >
              Cancel
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              @click="deleteProduct"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
