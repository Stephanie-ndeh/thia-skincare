<script setup lang="ts">
import type { AdminMetrics } from '@thia/shared'

definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const metrics = ref<AdminMetrics | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

onMounted(async () => {
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    const res = await $fetch<{ data: AdminMetrics }>(
      `${apiBase}/admin/metrics`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    metrics.value = res.data
  } catch {
    fetchError.value = 'Failed to load dashboard metrics.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="font-heading text-2xl font-semibold text-brand-dark">Dashboard</h2>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="n in 4"
        :key="n"
        class="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
      />
    </div>

    <!-- Error -->
    <div
      v-else-if="fetchError"
      class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
    >
      {{ fetchError }}
    </div>

    <!-- Metrics -->
    <template v-else-if="metrics">
      <AdminMetricsRow v-bind="metrics" />
    </template>

    <!-- Recent Orders -->
    <AdminRecentOrders />

    <!-- Low Stock Alert -->
    <AdminLowStockAlert />
  </div>
</template>
