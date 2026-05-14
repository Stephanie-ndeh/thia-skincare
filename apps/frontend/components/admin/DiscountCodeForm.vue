<script setup lang="ts">
import type { DiscountCode } from '@thia/shared'

const props = defineProps<{
  mode: 'create' | 'edit'
  discountCode?: DiscountCode
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const uiStore = useUiStore()
const apiBase = config.public.apiBaseUrl as string

const code = ref(props.discountCode?.code ?? '')
const type = ref<'percentage' | 'fixed'>(props.discountCode?.type ?? 'percentage')
const value = ref<number | ''>(props.discountCode?.value ?? '')
const minimumOrder = ref<number | ''>(props.discountCode?.minimum_order || '')
const usageLimit = ref<number | ''>(props.discountCode?.usage_limit ?? '')
const startsAt = ref(toDateInput(props.discountCode?.starts_at ?? null))
const expiresAt = ref(toDateInput(props.discountCode?.expires_at ?? null))
const isActive = ref(props.discountCode?.is_active ?? true)

const isSubmitting = ref(false)
const codeError = ref<string | null>(null)
const valueError = ref<string | null>(null)
const dateError = ref<string | null>(null)

function toDateInput(iso: string | null): string {
  if (!iso) return ''
  return iso.substring(0, 10)
}

function handleCodeInput(e: Event) {
  const input = e.target as HTMLInputElement
  code.value = input.value.toUpperCase().replace(/\s/g, '')
  codeError.value = null
}

async function getToken(): Promise<string | null> {
  const session = await supabase.auth.getSession()
  return session.data.session?.access_token ?? null
}

function validate(): boolean {
  codeError.value = null
  valueError.value = null
  dateError.value = null

  if (!code.value.trim()) {
    codeError.value = 'Code is required.'
    return false
  }

  if (value.value === '' || Number(value.value) <= 0) {
    valueError.value = 'Value must be greater than 0.'
    return false
  }

  if (type.value === 'percentage' && Number(value.value) > 100) {
    valueError.value = 'Percentage cannot exceed 100.'
    return false
  }

  if (startsAt.value && expiresAt.value && expiresAt.value <= startsAt.value) {
    dateError.value = 'Expiry date must be after start date.'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  try {
    const token = await getToken()
    if (!token) throw new Error('Not authenticated')

    if (props.mode === 'create') {
      const body: Record<string, unknown> = {
        code: code.value.trim().toUpperCase(),
        type: type.value,
        value: Number(value.value),
        is_active: isActive.value,
      }
      if (minimumOrder.value !== '') body.minimum_order = Number(minimumOrder.value)
      if (usageLimit.value !== '') body.usage_limit = Number(usageLimit.value)
      if (startsAt.value) body.starts_at = startsAt.value
      if (expiresAt.value) body.expires_at = expiresAt.value

      await $fetch(`${apiBase}/admin/discount-codes`, {
        method: 'POST',
        body,
        headers: { Authorization: `Bearer ${token}` },
      })
    } else {
      const body: Record<string, unknown> = {
        type: type.value,
        value: Number(value.value),
        is_active: isActive.value,
        minimum_order: minimumOrder.value !== '' ? Number(minimumOrder.value) : 0,
        usage_limit: usageLimit.value !== '' ? Number(usageLimit.value) : null,
        expires_at: expiresAt.value || null,
      }
      if (startsAt.value) body.starts_at = startsAt.value

      await $fetch(`${apiBase}/admin/discount-codes/${props.discountCode!.id}`, {
        method: 'PUT',
        body,
        headers: { Authorization: `Bearer ${token}` },
      })
    }

    emit('success')
  } catch (err: unknown) {
    const apiErr = err as { data?: { error?: { code?: string; message?: string } } }
    if (apiErr?.data?.error?.code === 'CONFLICT') {
      codeError.value = 'This code already exists.'
    } else {
      uiStore.addToast('Failed to save discount code.', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}

const valueLabel = computed(() =>
  type.value === 'percentage' ? 'Discount %' : 'Discount Amount (XAF)',
)
const valuePlaceholder = computed(() =>
  type.value === 'percentage' ? 'e.g. 10' : 'e.g. 2000',
)
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- Code -->
    <div>
      <label class="mb-1 block text-sm font-medium text-brand-dark">
        Code <span class="text-red-500">*</span>
      </label>
      <input
        v-if="mode === 'create'"
        :value="code"
        type="text"
        required
        class="w-full rounded-lg border px-3 py-2 font-mono text-sm uppercase focus:outline-none"
        :class="codeError ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-brand-dark'"
        placeholder="e.g. SUMMER20"
        @input="handleCodeInput"
      />
      <div v-else class="flex flex-col gap-1">
        <input
          :value="code"
          type="text"
          readonly
          class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm uppercase text-text-muted"
        />
        <p class="text-xs text-text-muted">Code cannot be changed after creation.</p>
      </div>
      <p v-if="codeError" class="mt-1 text-xs text-red-600">{{ codeError }}</p>
    </div>

    <!-- Type -->
    <div>
      <label class="mb-2 block text-sm font-medium text-brand-dark">Type</label>
      <div class="flex gap-4">
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input v-model="type" type="radio" value="percentage" class="accent-brand-dark" />
          Percentage
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input v-model="type" type="radio" value="fixed" class="accent-brand-dark" />
          Fixed Amount
        </label>
      </div>
    </div>

    <!-- Value -->
    <div>
      <label class="mb-1 block text-sm font-medium text-brand-dark">
        {{ valueLabel }} <span class="text-red-500">*</span>
      </label>
      <input
        v-model.number="value"
        type="number"
        min="1"
        :max="type === 'percentage' ? 100 : undefined"
        step="1"
        required
        class="w-32 rounded-lg border px-3 py-2 text-sm focus:outline-none"
        :class="valueError ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-brand-dark'"
        :placeholder="valuePlaceholder"
      />
      <p v-if="valueError" class="mt-1 text-xs text-red-600">{{ valueError }}</p>
    </div>

    <!-- Min Order + Usage Limit row -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-brand-dark">Min Order (XAF)</label>
        <input
          v-model.number="minimumOrder"
          type="number"
          min="0"
          step="100"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
          placeholder="0 = none"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-brand-dark">Usage Limit</label>
        <input
          v-model.number="usageLimit"
          type="number"
          min="1"
          step="1"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
          placeholder="Empty = unlimited"
        />
      </div>
    </div>

    <!-- Dates row -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-brand-dark">Start Date</label>
        <input
          v-model="startsAt"
          type="date"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-brand-dark">Expiry Date</label>
        <input
          v-model="expiresAt"
          type="date"
          class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
          :class="dateError ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-brand-dark'"
        />
        <p v-if="dateError" class="mt-1 text-xs text-red-600">{{ dateError }}</p>
      </div>
    </div>

    <!-- Is Active -->
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-brand-dark">Active</span>
      <button
        type="button"
        :class="[
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          isActive ? 'bg-green-500' : 'bg-gray-300',
        ]"
        @click="isActive = !isActive"
      >
        <span
          :class="[
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
            isActive ? 'translate-x-4' : 'translate-x-0.5',
          ]"
        />
      </button>
      <span class="text-xs text-text-muted">Can be redeemed at checkout</span>
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
        :disabled="isSubmitting"
        class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Code' : 'Save Changes' }}
      </button>
    </div>
  </form>
</template>
