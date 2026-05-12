<script setup lang="ts">
import { formatXAF } from '@thia/shared'
import type { AdminMetrics } from '@thia/shared'

const props = defineProps<AdminMetrics>()
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <!-- Total Orders -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Orders</p>
      <p class="mt-2 text-3xl font-bold text-brand-dark">{{ props.total_orders }}</p>
      <p class="mt-1 text-sm text-text-muted">
        <span class="font-semibold text-brand-dark">{{ props.orders_this_month }}</span>
        new this month
      </p>
    </div>

    <!-- Total Revenue -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Revenue</p>
      <p class="mt-2 text-3xl font-bold text-brand-dark">{{ formatXAF(props.total_revenue) }}</p>
      <p class="mt-1 text-sm text-text-muted">
        <span class="font-semibold text-brand-dark">{{ formatXAF(props.revenue_this_month) }}</span>
        this month
      </p>
    </div>

    <!-- Total Products -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Products</p>
      <p class="mt-2 text-3xl font-bold text-brand-dark">{{ props.total_products }}</p>
      <p class="mt-1 text-sm text-text-muted">published products</p>
    </div>

    <!-- Total Customers -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Customers</p>
      <p class="mt-2 text-3xl font-bold text-brand-dark">{{ props.total_customers }}</p>
      <p class="mt-1 text-sm text-text-muted">registered accounts</p>
    </div>
  </div>
</template>
