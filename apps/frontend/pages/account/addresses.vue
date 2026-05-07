<script setup lang="ts">
import { MapPin, Star, Trash2, Plus, X } from 'lucide-vue-next'
import { isValidCameroonPhone, CAMEROON_REGIONS } from '@thia/shared'
import type { Address } from '@thia/shared'

definePageMeta({ layout: 'default', ssr: false, middleware: 'auth' })

const uiStore = useUiStore()

const addresses = ref<Address[]>([])
const isLoading = ref(false)
const showAddForm = ref(false)

// ── Add form state ─────────────────────────────────────────────────────────

const form = reactive({
  full_name: '',
  phone: '',
  region: '',
  city: '',
  address_line: '',
})
const formPhoneError = ref('')
const isSubmitting = ref(false)

// ── Helpers ────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const session = await useSupabaseClient().auth.getSession()
  return session.data.session?.access_token ?? null
}

const apiBase = useRuntimeConfig().public.apiBaseUrl

// ── Fetch addresses ────────────────────────────────────────────────────────

async function fetchAddresses() {
  const token = await getToken()
  if (!token) return
  isLoading.value = true
  try {
    const response = await $fetch<{ data: Address[] }>(`${apiBase}/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    addresses.value = response.data
  } finally {
    isLoading.value = false
  }
}

// ── Set default ────────────────────────────────────────────────────────────

async function setDefault(id: string) {
  const token = await getToken()
  if (!token) return
  try {
    await $fetch(`${apiBase}/addresses/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { is_default: true },
    })
    await fetchAddresses()
    uiStore.addToast('Default address updated', 'success')
  } catch {
    uiStore.addToast('Failed to update default address', 'error')
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────

async function deleteAddress(id: string) {
  const token = await getToken()
  if (!token) return
  try {
    await $fetch(`${apiBase}/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    addresses.value = addresses.value.filter((a) => a.id !== id)
    uiStore.addToast('Address deleted', 'success')
  } catch {
    uiStore.addToast('Failed to delete address', 'error')
  }
}

// ── Add new ────────────────────────────────────────────────────────────────

function onFormPhoneBlur() {
  if (form.phone && !isValidCameroonPhone(form.phone)) {
    formPhoneError.value = 'Please enter a valid Cameroonian phone number (e.g. 677000000)'
  } else {
    formPhoneError.value = ''
  }
}

function resetForm() {
  form.full_name = ''
  form.phone = ''
  form.region = ''
  form.city = ''
  form.address_line = ''
  formPhoneError.value = ''
  showAddForm.value = false
}

async function handleAdd() {
  if (!form.full_name || !form.phone || !form.region || !form.city || !form.address_line) {
    uiStore.addToast('Please fill in all required fields', 'error')
    return
  }
  if (!isValidCameroonPhone(form.phone)) {
    formPhoneError.value = 'Please enter a valid Cameroonian phone number'
    return
  }

  const token = await getToken()
  if (!token) return

  isSubmitting.value = true
  try {
    await $fetch(`${apiBase}/addresses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...form },
    })
    await fetchAddresses()
    resetForm()
    uiStore.addToast('Address added', 'success')
  } catch {
    uiStore.addToast('Failed to add address', 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchAddresses())
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="lg:flex lg:items-start lg:gap-8">
      <AccountSidebar />

      <div class="min-w-0 flex-1">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="font-heading text-2xl font-semibold text-brand-dark">Saved Addresses</h1>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-dark px-4 py-2 font-body text-sm font-medium text-white hover:bg-brand-accent transition-colors"
            @click="showAddForm = !showAddForm"
          >
            <component :is="showAddForm ? X : Plus" class="h-4 w-4" />
            {{ showAddForm ? 'Cancel' : 'Add Address' }}
          </button>
        </div>

        <!-- Add form -->
        <div v-if="showAddForm" class="mb-6 rounded-xl bg-white p-6">
          <h2 class="mb-4 font-heading text-base font-semibold text-brand-dark">New Address</h2>
          <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="handleAdd">
            <div>
              <label class="block font-body text-sm font-medium text-brand-dark">Full Name</label>
              <input
                v-model="form.full_name"
                type="text"
                placeholder="e.g. Marie Nguele"
                class="mt-1 w-full rounded-lg border border-brand-dark/20 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              />
            </div>

            <div>
              <label class="block font-body text-sm font-medium text-brand-dark">Phone</label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="677000000"
                class="mt-1 w-full rounded-lg border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                :class="formPhoneError ? 'border-red-400' : 'border-brand-dark/20'"
                @blur="onFormPhoneBlur"
              />
              <p v-if="formPhoneError" class="mt-1 font-body text-xs text-red-600">{{ formPhoneError }}</p>
            </div>

            <div>
              <label class="block font-body text-sm font-medium text-brand-dark">Region</label>
              <select
                v-model="form.region"
                class="mt-1 w-full rounded-lg border border-brand-dark/20 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              >
                <option value="" disabled>Select a region</option>
                <option v-for="r in CAMEROON_REGIONS" :key="r.name" :value="r.name">{{ r.name }}</option>
              </select>
            </div>

            <div>
              <label class="block font-body text-sm font-medium text-brand-dark">City</label>
              <input
                v-model="form.city"
                type="text"
                placeholder="e.g. Douala"
                class="mt-1 w-full rounded-lg border border-brand-dark/20 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block font-body text-sm font-medium text-brand-dark">Address</label>
              <input
                v-model="form.address_line"
                type="text"
                placeholder="Street address"
                class="mt-1 w-full rounded-lg border border-brand-dark/20 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              />
            </div>

            <div class="sm:col-span-2">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="rounded-lg bg-brand-dark px-6 py-2.5 font-body text-sm font-medium text-white hover:bg-brand-accent transition-colors disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving…' : 'Save Address' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="space-y-3">
          <div v-for="n in 2" :key="n" class="h-24 animate-pulse rounded-xl bg-white" />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="addresses.length === 0"
          class="flex flex-col items-center gap-3 rounded-xl bg-white py-14 text-center"
        >
          <MapPin class="h-10 w-10 text-brand-dark/20" />
          <p class="font-body text-text-muted">No saved addresses yet</p>
        </div>

        <!-- Address list -->
        <div v-else class="space-y-3">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            class="rounded-xl bg-white p-5"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <p class="font-body text-sm font-semibold text-brand-dark">{{ addr.fullName }}</p>
                  <span
                    v-if="addr.isDefault"
                    class="rounded-full bg-brand-accent/10 px-2 py-0.5 font-body text-xs font-medium text-brand-accent"
                  >
                    Default
                  </span>
                </div>
                <p class="font-body text-sm text-text-muted">{{ addr.phone }}</p>
                <p class="font-body text-sm text-text-muted">
                  {{ addr.addressLine }}, {{ addr.city }}, {{ addr.region }}
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <button
                  v-if="!addr.isDefault"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-brand-dark/20 px-3 py-1.5 font-body text-xs font-medium text-brand-dark hover:bg-gray-50 transition-colors"
                  @click="setDefault(addr.id)"
                >
                  <Star class="h-3 w-3" />
                  Set default
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  @click="deleteAddress(addr.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
