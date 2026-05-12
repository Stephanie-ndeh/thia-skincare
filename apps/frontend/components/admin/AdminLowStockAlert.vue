<script setup lang="ts">
interface LowStockItem {
  id: string
  product_id: string
  product_name: string
  variant_label: string
  stock_quantity: number
}

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const items = ref<LowStockItem[]>([])

onMounted(async () => {
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    const res = await $fetch<{ data: LowStockItem[] }>(
      `${apiBase}/admin/low-stock`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    items.value = res.data
  } catch {
    // Silently ignore — low stock is a non-critical widget
  }
})
</script>

<template>
  <div v-if="items.length > 0" class="rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm">
    <div class="border-b border-yellow-200 px-5 py-4">
      <h2 class="text-sm font-semibold text-yellow-800">Low Stock Alert</h2>
      <p class="mt-0.5 text-xs text-yellow-700">{{ items.length }} variant(s) below 5 units</p>
    </div>
    <ul class="divide-y divide-yellow-100">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between px-5 py-3"
      >
        <div>
          <p class="text-sm font-medium text-yellow-900">{{ item.product_name }}</p>
          <p class="text-xs text-yellow-700">
            {{ item.variant_label }} &mdash;
            <span class="font-semibold">{{ item.stock_quantity }} left</span>
          </p>
        </div>
        <NuxtLink
          :to="`/admin/products/${item.product_id}`"
          class="ml-4 shrink-0 text-sm font-medium text-yellow-800 underline underline-offset-2 hover:text-yellow-900"
        >
          Edit
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
