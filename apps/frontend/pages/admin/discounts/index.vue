<script setup lang="ts">
import { Plus, Copy, Check, Pencil, Trash2 } from 'lucide-vue-next'
import { formatXAF } from '@thia/shared'
import type { DiscountCode } from '@thia/shared'

definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const uiStore = useUiStore()
const apiBase = config.public.apiBaseUrl as string

const codes = ref<DiscountCode[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingCode = ref<DiscountCode | null>(null)

const confirmDeleteId = ref<string | null>(null)
const isDeleting = ref(false)

const copiedId = ref<string | null>(null)

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

async function fetchCodes() {
  isLoading.value = true
  fetchError.value = null
  try {
    const token = await getToken()
    if (!token) return
    const res = await $fetch<{ data: DiscountCode[] }>(`${apiBase}/admin/discount-codes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    codes.value = res.data
  } catch {
    fetchError.value = 'Failed to load discount codes.'
  } finally {
    isLoading.value = false
  }
}

function openCreate() {
  modalMode.value = 'create'
  editingCode.value = null
  modalOpen.value = true
}

function openEdit(code: DiscountCode) {
  modalMode.value = 'edit'
  editingCode.value = code
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingCode.value = null
}

async function onFormSuccess() {
  closeModal()
  uiStore.addToast(
    modalMode.value === 'create' ? 'Discount code created.' : 'Discount code updated.',
    'success',
  )
  await fetchCodes()
}

async function toggleActive(code: DiscountCode) {
  const prev = code.is_active
  code.is_active = !prev
  try {
    const token = await getToken()
    if (!token) throw new Error('No token')
    await $fetch(`${apiBase}/admin/discount-codes/${code.id}/toggle`, {
      method: 'PATCH',
      body: { is_active: !prev },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    code.is_active = prev
    uiStore.addToast('Failed to update status.', 'error')
  }
}

async function confirmDelete() {
  if (!confirmDeleteId.value) return
  isDeleting.value = true
  try {
    const token = await getToken()
    if (!token) return
    await $fetch(`${apiBase}/admin/discount-codes/${confirmDeleteId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    uiStore.addToast('Discount code deleted.', 'success')
    await fetchCodes()
  } catch {
    uiStore.addToast('Failed to delete discount code.', 'error')
  } finally {
    confirmDeleteId.value = null
    isDeleting.value = false
  }
}

async function copyCode(code: DiscountCode) {
  await navigator.clipboard.writeText(code.code)
  copiedId.value = code.id
  setTimeout(() => {
    copiedId.value = null
  }, 1500)
}

function formatDiscount(code: DiscountCode): string {
  if (code.type === 'percentage') return `${code.value}% off`
  return `${formatXAF(code.value)} off`
}

function formatMinOrder(code: DiscountCode): string {
  if (!code.minimum_order) return 'None'
  return formatXAF(code.minimum_order)
}

function formatExpiry(code: DiscountCode): string {
  if (!code.expires_at) return 'Never'
  return new Date(code.expires_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isExpired(code: DiscountCode): boolean {
  return !!code.expires_at && new Date(code.expires_at) < new Date()
}

function isExhausted(code: DiscountCode): boolean {
  return code.usage_limit !== null && code.usage_count >= code.usage_limit
}

function usageProgress(code: DiscountCode): number {
  if (!code.usage_limit) return 0
  return Math.min(100, (code.usage_count / code.usage_limit) * 100)
}

const totalCodes = computed(() => codes.value.length)
const activeCodes = computed(() => codes.value.filter(c => c.is_active).length)
const totalUses = computed(() => codes.value.reduce((sum, c) => sum + c.usage_count, 0))

onMounted(fetchCodes)
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="font-heading text-2xl font-semibold text-brand-dark">Discount Codes</h2>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        @click="openCreate"
      >
        <Plus class="h-4 w-4" />
        Create Code
      </button>
    </div>

    <!-- Stats -->
    <div v-if="!isLoading && !fetchError" class="grid grid-cols-3 gap-4">
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Codes</p>
        <p class="mt-1 text-2xl font-semibold text-brand-dark">{{ totalCodes }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Active</p>
        <p class="mt-1 text-2xl font-semibold text-green-600">{{ activeCodes }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Total Uses</p>
        <p class="mt-1 text-2xl font-semibold text-brand-dark">{{ totalUses }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <div v-for="n in 5" :key="n" class="h-14 animate-pulse rounded-xl bg-gray-100" />
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
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">Code</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">Discount</th>
              <th class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted sm:table-cell">Min Order</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">Usage</th>
              <th class="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted md:table-cell">Expires</th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted">Active</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <!-- Empty -->
            <tr v-if="codes.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-text-muted">
                No discount codes yet.
                <button type="button" class="ml-1 font-medium text-brand-dark underline" @click="openCreate">
                  Create your first one!
                </button>
              </td>
            </tr>

            <tr
              v-for="code in codes"
              :key="code.id"
              :class="['transition-colors hover:bg-gray-50', isExpired(code) ? 'opacity-60' : '']"
            >
              <!-- Code -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm font-semibold text-brand-dark">{{ code.code }}</span>
                  <button
                    type="button"
                    class="text-text-muted transition-colors hover:text-brand-dark"
                    :title="copiedId === code.id ? 'Copied!' : 'Copy code'"
                    @click="copyCode(code)"
                  >
                    <Check v-if="copiedId === code.id" class="h-3.5 w-3.5 text-green-600" />
                    <Copy v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>

              <!-- Discount -->
              <td class="px-4 py-3 font-medium text-brand-dark">
                {{ formatDiscount(code) }}
              </td>

              <!-- Min Order -->
              <td class="hidden px-4 py-3 text-text-muted sm:table-cell">
                {{ formatMinOrder(code) }}
              </td>

              <!-- Usage -->
              <td class="px-4 py-3">
                <div v-if="isExhausted(code)" class="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Exhausted
                </div>
                <template v-else>
                  <div class="mb-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                    <div
                      class="h-1.5 rounded-full bg-brand-dark"
                      :style="{ width: `${usageProgress(code)}%` }"
                    />
                  </div>
                  <span class="text-xs text-text-muted">
                    {{ code.usage_limit ? `${code.usage_count} / ${code.usage_limit} uses` : `${code.usage_count} uses` }}
                  </span>
                </template>
              </td>

              <!-- Expires -->
              <td class="hidden px-4 py-3 md:table-cell">
                <div class="flex items-center gap-2">
                  <span :class="isExpired(code) ? 'text-red-600' : 'text-text-muted'">
                    {{ formatExpiry(code) }}
                  </span>
                  <span
                    v-if="isExpired(code)"
                    class="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                  >
                    Expired
                  </span>
                </div>
              </td>

              <!-- Active toggle -->
              <td class="px-4 py-3 text-center">
                <button
                  type="button"
                  :class="[
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                    code.is_active ? 'bg-green-500' : 'bg-gray-300',
                  ]"
                  @click="toggleActive(code)"
                >
                  <span
                    :class="[
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                      code.is_active ? 'translate-x-4' : 'translate-x-0.5',
                    ]"
                  />
                </button>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-lg border border-gray-200 p-1.5 text-text-muted transition-colors hover:border-brand-dark hover:text-brand-dark"
                    title="Edit"
                    @click="openEdit(code)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-gray-200 p-1.5 text-text-muted transition-colors hover:border-red-300 hover:text-red-600"
                    title="Delete"
                    @click="confirmDeleteId = code.id"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModal"
      >
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <h3 class="mb-4 text-base font-semibold text-brand-dark">
            {{ modalMode === 'create' ? 'Create Discount Code' : 'Edit Discount Code' }}
          </h3>
          <DiscountCodeForm
            :mode="modalMode"
            :discount-code="editingCode ?? undefined"
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
          <h3 class="text-base font-semibold text-brand-dark">Delete discount code?</h3>
          <p class="mt-1 text-sm text-text-muted">
            This will permanently remove the code and it can no longer be redeemed.
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
