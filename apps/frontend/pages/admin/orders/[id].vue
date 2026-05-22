<script setup lang="ts">
import { formatXAF, ORDER_STATUS_TRANSITIONS } from '@thia/shared'
import type { OrderDetail, OrderStatus, PaymentStatus } from '@thia/shared'

definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

const route = useRoute()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const uiStore = useUiStore()
const apiBase = config.public.apiBaseUrl as string

const order = ref<OrderDetail | null>(null)
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const selectedStatus = ref<OrderStatus | ''>('')
const showConfirm = ref(false)
const isUpdating = ref(false)

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

async function fetchOrder() {
  isLoading.value = true
  fetchError.value = null
  try {
    const token = await getToken()
    if (!token) return
    const res = await $fetch<{ data: OrderDetail }>(
      `${apiBase}/admin/orders/${route.params.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    order.value = res.data
    selectedStatus.value = ''
  } catch {
    fetchError.value = 'Failed to load order.'
  } finally {
    isLoading.value = false
  }
}

const validNextStatuses = computed<OrderStatus[]>(() => {
  if (!order.value) return []
  return ORDER_STATUS_TRANSITIONS[order.value.status] ?? []
})

function initiateStatusUpdate() {
  if (!selectedStatus.value) return
  showConfirm.value = true
}

async function confirmStatusUpdate() {
  if (!selectedStatus.value || !order.value) return
  isUpdating.value = true
  try {
    const token = await getToken()
    if (!token) return
    await $fetch(`${apiBase}/admin/orders/${order.value.id}/status`, {
      method: 'PATCH',
      body: { status: selectedStatus.value },
      headers: { Authorization: `Bearer ${token}` },
    })
    uiStore.addToast(`Order status updated to "${selectedStatus.value}".`, 'success')
    showConfirm.value = false
    await fetchOrder()
  } catch {
    uiStore.addToast('Failed to update order status.', 'error')
  } finally {
    isUpdating.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadgeClass(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

function paymentBadgeClass(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    pending: 'bg-gray-100 text-gray-600',
    processing: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

function paymentChannelLabel(channel: string | null): string {
  if (!channel) return '—'
  if (channel === 'cm.mtn') return 'MTN MoMo'
  if (channel === 'cm.orange') return 'Orange Money'
  return channel
}

// Build timeline entries from order timestamps
interface TimelineEntry {
  status: OrderStatus
  label: string
  time: string | null
}

const timeline = computed<TimelineEntry[]>(() => {
  if (!order.value) return []
  const o = order.value
  const entries: TimelineEntry[] = [
    { status: 'pending', label: 'Order placed', time: o.created_at },
    { status: 'confirmed', label: 'Confirmed', time: o.confirmed_at },
    { status: 'processing', label: 'Processing', time: null },
    { status: 'shipped', label: 'Shipped', time: o.shipped_at },
    { status: 'delivered', label: 'Delivered', time: o.delivered_at },
    { status: 'cancelled', label: 'Cancelled', time: o.cancelled_at },
  ]
  // Show only reached statuses (those with a time or the current status)
  return entries.filter(
    (e) => e.time !== null || e.status === o.status,
  )
})

onMounted(fetchOrder)
</script>

<template>
  <div class="space-y-5">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-text-muted">
      <NuxtLink to="/admin" class="hover:text-brand-dark">Admin</NuxtLink>
      <span>/</span>
      <NuxtLink to="/admin/orders" class="hover:text-brand-dark">Orders</NuxtLink>
      <span>/</span>
      <span class="font-mono font-medium text-brand-dark">
        {{ order?.order_number ?? '…' }}
      </span>
    </nav>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="col-span-2 space-y-4">
          <div class="h-64 animate-pulse rounded-xl bg-gray-100" />
          <div class="h-32 animate-pulse rounded-xl bg-gray-100" />
        </div>
        <div class="space-y-4">
          <div class="h-48 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700">
      {{ fetchError }}
    </div>

    <template v-else-if="order">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <!-- Left column -->
        <div class="space-y-5 lg:col-span-2">
          <!-- Order Items -->
          <div class="rounded-xl border border-gray-200 bg-white">
            <div class="border-b border-gray-100 px-5 py-4">
              <h3 class="font-semibold text-brand-dark">Order Items</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th class="w-12 px-4 py-3" />
                    <th
                      class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted"
                    >
                      Product
                    </th>
                    <th
                      class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell"
                    >
                      Variant
                    </th>
                    <th
                      class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted"
                    >
                      Qty
                    </th>
                    <th
                      class="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell"
                    >
                      Unit Price
                    </th>
                    <th
                      class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="item in order.items" :key="item.id">
                    <td class="px-4 py-3">
                      <img
                        v-if="item.image_url"
                        :src="item.image_url"
                        :alt="item.product_name"
                        class="h-10 w-10 rounded-lg object-cover"
                      />
                      <div
                        v-else
                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-text-muted"
                      >
                        —
                      </div>
                    </td>
                    <td class="px-4 py-3 font-medium text-brand-dark">
                      {{ item.product_name }}
                    </td>
                    <td class="hidden px-4 py-3 text-text-muted sm:table-cell">
                      {{ item.variant_label }}
                    </td>
                    <td class="px-4 py-3 text-center text-text-muted">{{ item.quantity }}</td>
                    <td class="hidden px-4 py-3 text-right text-text-muted sm:table-cell">
                      {{ formatXAF(item.unit_price) }}
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-brand-dark">
                      {{ formatXAF(item.line_total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Totals -->
            <div class="space-y-1.5 border-t border-gray-100 px-5 py-4">
              <div class="flex justify-between text-sm text-text-muted">
                <span>Subtotal</span>
                <span>{{ formatXAF(order.subtotal) }}</span>
              </div>
              <div v-if="order.discount_amount > 0" class="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>−{{ formatXAF(order.discount_amount) }}</span>
              </div>
              <div class="flex justify-between text-sm text-text-muted">
                <span>Shipping</span>
                <span>{{ formatXAF(order.shipping_cost) }}</span>
              </div>
              <div class="flex justify-between border-t border-gray-100 pt-2 font-semibold text-brand-dark">
                <span>Total</span>
                <span>{{ formatXAF(order.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <h3 class="mb-3 font-semibold text-brand-dark">Customer</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Name</dt>
                <dd class="font-medium text-brand-dark">{{ order.customer.full_name }}</dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Phone</dt>
                <dd class="text-brand-dark">{{ order.customer.phone || '—' }}</dd>
              </div>
              <div v-if="order.customer.email" class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Email</dt>
                <dd class="text-brand-dark">{{ order.customer.email }}</dd>
              </div>
            </dl>
          </div>

          <!-- Shipping Address -->
          <div class="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <h3 class="mb-3 font-semibold text-brand-dark">Shipping Address</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Name</dt>
                <dd class="font-medium text-brand-dark">{{ order.shipping_name }}</dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Phone</dt>
                <dd class="text-brand-dark">{{ order.shipping_phone }}</dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Address</dt>
                <dd class="text-brand-dark">{{ order.shipping_address_line }}</dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">City</dt>
                <dd class="text-brand-dark">{{ order.shipping_city }}</dd>
              </div>
              <div class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Region</dt>
                <dd class="text-brand-dark">{{ order.shipping_region }}</dd>
              </div>
              <div v-if="order.shipping_notes" class="flex gap-4">
                <dt class="w-24 shrink-0 text-text-muted">Notes</dt>
                <dd class="text-brand-dark">{{ order.shipping_notes }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-5">
          <!-- Order Status Card -->
          <div class="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <h3 class="mb-4 font-semibold text-brand-dark">Order Status</h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">Status</span>
                <span
                  :class="[
                    'inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize',
                    statusBadgeClass(order.status),
                  ]"
                >
                  {{ order.status }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">Payment</span>
                <span
                  :class="[
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    paymentBadgeClass(order.payment_status),
                  ]"
                >
                  {{ order.payment_status }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">Reference</span>
                <span class="font-mono text-sm font-semibold text-brand-dark">
                  {{ order.order_number }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">Placed</span>
                <span class="text-sm text-brand-dark">{{ formatDate(order.created_at) }}</span>
              </div>
            </div>

            <!-- Status Update -->
            <div v-if="validNextStatuses.length > 0" class="mt-4 border-t border-gray-100 pt-4">
              <label class="mb-1.5 block text-xs font-medium text-text-muted uppercase tracking-wide">
                Update Status
              </label>
              <select
                v-model="selectedStatus"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
              >
                <option value="">— select new status —</option>
                <option
                  v-for="s in validNextStatuses"
                  :key="s"
                  :value="s"
                  class="capitalize"
                >
                  {{ s }}
                </option>
              </select>
              <button
                type="button"
                :disabled="!selectedStatus"
                :class="[
                  'mt-2 w-full rounded-lg py-2 text-sm font-semibold transition-opacity',
                  selectedStatus
                    ? 'bg-brand-dark text-white hover:opacity-80'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400',
                ]"
                @click="initiateStatusUpdate"
              >
                Update Status
              </button>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <h3 class="mb-4 font-semibold text-brand-dark">Timeline</h3>
            <ol class="space-y-3">
              <li
                v-for="(entry, idx) in timeline"
                :key="idx"
                class="flex items-start gap-3 text-sm"
              >
                <span
                  :class="[
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    entry.status === order.status
                      ? 'bg-brand-dark text-white'
                      : 'bg-gray-100 text-text-muted',
                  ]"
                >
                  {{ idx + 1 }}
                </span>
                <div>
                  <p
                    :class="[
                      'font-medium capitalize',
                      entry.status === order.status ? 'text-brand-dark' : 'text-text-muted',
                    ]"
                  >
                    {{ entry.label }}
                  </p>
                  <p v-if="entry.time" class="text-xs text-text-muted">
                    {{ formatDateTime(entry.time) }}
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <!-- Payment Info -->
          <div class="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <h3 class="mb-3 font-semibold text-brand-dark">Payment</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-text-muted">Method</dt>
                <dd class="font-medium text-brand-dark">
                  {{ paymentChannelLabel(order.payment_channel) }}
                </dd>
              </div>
              <div v-if="order.payment_phone" class="flex justify-between">
                <dt class="text-text-muted">Phone</dt>
                <dd class="text-brand-dark">{{ order.payment_phone }}</dd>
              </div>
              <div v-if="order.notchpay_reference" class="flex justify-between">
                <dt class="text-text-muted">Ref</dt>
                <dd class="font-mono text-xs text-brand-dark">{{ order.notchpay_reference }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-text-muted">Status</dt>
                <dd>
                  <span
                    :class="[
                      'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      paymentBadgeClass(order.payment_status),
                    ]"
                  >
                    {{ order.payment_status }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </template>

    <!-- Status Update Confirmation Dialog -->
    <Teleport to="body">
      <div
        v-if="showConfirm && order && selectedStatus"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showConfirm = false"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-base font-semibold text-brand-dark">Update order status?</h3>
          <p class="mt-1 text-sm text-text-muted">
            Change status from
            <span class="font-semibold capitalize text-brand-dark">{{ order.status }}</span>
            to
            <span class="font-semibold capitalize text-brand-dark">{{ selectedStatus }}</span>?
          </p>
          <div class="mt-4 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-gray-50"
              @click="showConfirm = false"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="isUpdating"
              class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              @click="confirmStatusUpdate"
            >
              {{ isUpdating ? 'Updating…' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
