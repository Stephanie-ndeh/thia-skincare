<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

const password = ref('')
const confirm = ref('')
const errorMsg = ref('')
const fieldErrors = ref({ password: '', confirm: '' })
const touched = ref({ password: false, confirm: false })

function validatePassword(val: string) {
  if (!val) return 'Password is required'
  if (val.length < 8) return 'Password must be at least 8 characters'
  return ''
}

function validateConfirm(val: string) {
  if (!val) return 'Please confirm your password'
  if (val !== password.value) return 'Passwords do not match'
  return ''
}

function validateAll() {
  touched.value = { password: true, confirm: true }
  fieldErrors.value.password = validatePassword(password.value)
  fieldErrors.value.confirm = validateConfirm(confirm.value)
  return !fieldErrors.value.password && !fieldErrors.value.confirm
}

async function handleSubmit() {
  if (!validateAll()) return
  errorMsg.value = ''
  try {
    await authStore.updatePassword(password.value)
    uiStore.addToast('Password updated. Please log in.', 'success')
    router.push('/auth/login')
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to update password'
  }
}
</script>

<template>
  <div>
    <h1 class="mb-1 text-xl font-semibold text-brand-dark">Set new password</h1>
    <p class="mb-6 text-sm text-text-muted">Choose a strong password for your account.</p>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <div class="space-y-1">
        <Label for="password">New password</Label>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="Min. 8 characters"
          :class="touched.password && fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.password = true; fieldErrors.password = validatePassword(password)"
        />
        <p v-if="touched.password && fieldErrors.password" class="text-xs text-red-500">
          {{ fieldErrors.password }}
        </p>
      </div>

      <div class="space-y-1">
        <Label for="confirm">Confirm password</Label>
        <Input
          id="confirm"
          v-model="confirm"
          type="password"
          autocomplete="new-password"
          placeholder="Repeat your password"
          :class="touched.confirm && fieldErrors.confirm ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.confirm = true; fieldErrors.confirm = validateConfirm(confirm)"
        />
        <p v-if="touched.confirm && fieldErrors.confirm" class="text-xs text-red-500">
          {{ fieldErrors.confirm }}
        </p>
      </div>

      <p v-if="errorMsg" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
        {{ errorMsg }}
      </p>

      <Button type="submit" class="w-full" :disabled="authStore.loading">
        <span
          v-if="authStore.loading"
          class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        {{ authStore.loading ? 'Updating…' : 'Update password' }}
      </Button>
    </form>
  </div>
</template>
