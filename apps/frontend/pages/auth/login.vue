<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
useSeoMeta({ title: () => t('seo.login_title') })

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const fieldErrors = ref({ email: '', password: '' })
const touched = ref({ email: false, password: false })

function validateEmail(val: string) {
  if (!val) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address'
  return ''
}

function validatePassword(val: string) {
  if (!val) return 'Password is required'
  return ''
}

function validateAll() {
  fieldErrors.value.email = validateEmail(email.value)
  fieldErrors.value.password = validatePassword(password.value)
  return !fieldErrors.value.email && !fieldErrors.value.password
}

function mapError(msg: string) {
  if (msg.includes('Invalid login credentials')) return 'Email or password is incorrect'
  return msg
}

async function handleSubmit() {
  touched.value = { email: true, password: true }
  if (!validateAll()) return
  errorMsg.value = ''
  try {
    await authStore.login(email.value, password.value)
    const redirect = route.query.redirect as string | undefined
    const defaultRedirect = authStore.isAdmin ? '/admin' : '/account'
    router.push(redirect || defaultRedirect)
  } catch (err: unknown) {
    errorMsg.value = mapError(err instanceof Error ? err.message : 'Login failed')
  }
}
</script>

<template>
  <div>
    <h1 class="mb-1 text-xl font-semibold text-brand-dark">Welcome back</h1>
    <p class="mb-6 text-sm text-text-muted">Sign in to your Thia account</p>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <div class="space-y-1">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :class="touched.email && fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.email = true; fieldErrors.email = validateEmail(email)"
        />
        <p v-if="touched.email && fieldErrors.email" class="text-xs text-red-500">
          {{ fieldErrors.email }}
        </p>
      </div>

      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <Label for="password">Password</Label>
          <NuxtLink to="/auth/forgot-password" class="text-xs text-brand-dark hover:underline">
            Forgot password?
          </NuxtLink>
        </div>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          :class="touched.password && fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.password = true; fieldErrors.password = validatePassword(password)"
        />
        <p v-if="touched.password && fieldErrors.password" class="text-xs text-red-500">
          {{ fieldErrors.password }}
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
        {{ authStore.loading ? 'Signing in…' : 'Sign in' }}
      </Button>
    </form>

    <p class="mt-6 text-center text-sm text-text-muted">
      Don't have an account?
      <NuxtLink to="/auth/register" class="font-medium text-brand-dark hover:underline">
        Register
      </NuxtLink>
    </p>
  </div>
</template>
