<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

const email = ref('')
const emailError = ref('')
const emailTouched = ref(false)
const submitted = ref(false)

function validateEmail(val: string) {
  if (!val) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address'
  return ''
}

async function handleSubmit() {
  emailTouched.value = true
  emailError.value = validateEmail(email.value)
  if (emailError.value) return

  try {
    await authStore.resetPassword(email.value)
  } catch {
    // Swallow to prevent email enumeration
  }
  submitted.value = true
}
</script>

<template>
  <div>
    <template v-if="!submitted">
      <h1 class="mb-1 text-xl font-semibold text-brand-dark">Reset your password</h1>
      <p class="mb-6 text-sm text-text-muted">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <div class="space-y-1">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            :class="emailTouched && emailError ? 'border-red-500 focus-visible:ring-red-500' : ''"
            @blur="emailTouched = true; emailError = validateEmail(email)"
          />
          <p v-if="emailTouched && emailError" class="text-xs text-red-500">
            {{ emailError }}
          </p>
        </div>

        <Button type="submit" class="w-full" :disabled="authStore.loading">
          <span
            v-if="authStore.loading"
            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          />
          {{ authStore.loading ? 'Sending…' : 'Send reset link' }}
        </Button>
      </form>
    </template>

    <template v-else>
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="mb-2 text-xl font-semibold text-brand-dark">Check your inbox</h1>
        <p class="text-sm text-text-muted">
          If an account exists with this email, you'll receive a reset link shortly.
        </p>
      </div>
    </template>

    <p class="mt-6 text-center text-sm text-text-muted">
      <NuxtLink to="/auth/login" class="font-medium text-brand-dark hover:underline">
        Back to login
      </NuxtLink>
    </p>
  </div>
</template>
