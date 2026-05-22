<script setup lang="ts">
definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

interface VariantRow {
  id: string
  sku: string
  size_label: string | null
  scent_label: string | null
  price: number
  stock_quantity: number
  display_order: number
}

interface ImageRow {
  id: string
  url: string
  storage_path: string
  is_primary: boolean
  display_order: number
}

interface ProductData {
  id: string
  name: string
  slug: string
  category_id: string
  description: string | null
  ingredients: string | null
  usage_instructions: string | null
  is_published: boolean
  is_featured: boolean
  product_variants: VariantRow[]
  product_images: ImageRow[]
}

const route = useRoute()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string
const uiStore = useUiStore()

const product = ref<ProductData | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const mappedProduct = computed(() => {
  if (!product.value) return undefined
  return {
    ...product.value,
    product_variants: product.value.product_variants.map((v) => ({
      ...v,
      size_label: v.size_label ?? '',
      scent_label: v.scent_label ?? '',
    })),
  }
})

onMounted(async () => {
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    const res = await $fetch<{ data: ProductData }>(
      `${apiBase}/admin/products/${route.params.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    product.value = res.data
  } catch {
    fetchError.value = 'Failed to load product.'
  } finally {
    isLoading.value = false
  }
})

function onSuccess() {
  uiStore.addToast('Product updated.', 'success')
}
</script>

<template>
  <div class="space-y-5">
    <h2 class="font-heading text-2xl font-semibold text-brand-dark">Edit Product</h2>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="h-32 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <div
      v-else-if="fetchError"
      class="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700"
    >
      {{ fetchError }}
    </div>

    <ProductForm
      v-else-if="mappedProduct"
      mode="edit"
      :product="mappedProduct"
      @success="onSuccess"
    />
  </div>
</template>
