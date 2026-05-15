<script setup lang="ts">
import { isValidCameroonPhone } from '@thia/shared'

definePageMeta({ layout: 'default', ssr: false, middleware: 'auth' })
useSeoMeta({ title: 'My Account — Thia', robots: 'noindex, nofollow' })

const authStore = useAuthStore()
const uiStore = useUiStore()
const supabaseUser = useSupabaseUser()

const fullName = ref('')
const phone = ref('')
const phoneError = ref('')
const isSubmitting = ref(false)

onMounted(() => {
  fullName.value = authStore.profile?.fullName ?? ''
  phone.value = authStore.profile?.phone ?? ''
})

function onPhoneBlur() {
  if (phone.value && !isValidCameroonPhone(phone.value)) {
    phoneError.value = 'Please enter a valid Cameroonian phone number (e.g. 677000000)'
  } else {
    phoneError.value = ''
  }
}

async function handleSubmit() {
  if (phone.value && !isValidCameroonPhone(phone.value)) {
    phoneError.value = 'Please enter a valid Cameroonian phone number'
    return
  }

  const session = await useSupabaseClient().auth.getSession()
  const token = session.data.session?.access_token
  if (!token) return

  isSubmitting.value = true
  try {
    await $fetch(`${useRuntimeConfig().public.apiBaseUrl}/profile`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { full_name: fullName.value, phone: phone.value || undefined },
    })
    await authStore.fetchProfile()
    uiStore.addToast('Profile updated successfully', 'success')
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update profile'
    uiStore.addToast(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="lg:flex lg:items-start lg:gap-8">
      <AccountSidebar />

      <div class="min-w-0 flex-1">
        <h1 class="mb-6 font-heading text-2xl font-semibold text-brand-dark">
          My Profile
        </h1>

        <div class="rounded-xl bg-white p-6 sm:p-8">
          <form class="max-w-md space-y-5" @submit.prevent="handleSubmit">
            <!-- Email (read-only) -->
            <div>
              <label class="block font-body text-sm font-medium text-brand-dark">Email</label>
              <input
                type="email"
                :value="supabaseUser?.email ?? ''"
                disabled
                class="mt-1 w-full rounded-lg border border-brand-dark/10 bg-gray-50 px-3 py-2.5 font-body text-sm text-text-muted"
              />
            </div>

            <!-- Full name -->
            <div>
              <label class="block font-body text-sm font-medium text-brand-dark">Full Name</label>
              <input
                v-model="fullName"
                type="text"
                placeholder="e.g. Marie Nguele"
                class="mt-1 w-full rounded-lg border border-brand-dark/20 px-3 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block font-body text-sm font-medium text-brand-dark">Phone Number</label>
              <input
                v-model="phone"
                type="tel"
                placeholder="677000000"
                class="mt-1 w-full rounded-lg border px-3 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                :class="phoneError ? 'border-red-400' : 'border-brand-dark/20'"
                @blur="onPhoneBlur"
              />
              <p v-if="phoneError" class="mt-1 font-body text-xs text-red-600">{{ phoneError }}</p>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-lg bg-brand-dark px-6 py-2.5 font-body text-sm font-medium text-white hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Saving…' : 'Save Changes' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
