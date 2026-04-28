<script setup lang="ts">
import { isValidCameroonPhone } from '@thia/shared'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const errorMsg = ref('')
const fieldErrors = ref({ fullName: '', email: '', phone: '', password: '' })
const touched = ref({ fullName: false, email: false, phone: false, password: false })

type Field = keyof typeof fieldErrors.value

function validateField(field: Field): string {
  switch (field) {
    case 'fullName':
      if (!fullName.value.trim()) return 'Full name is required'
      if (fullName.value.trim().length < 2) return 'Name must be at least 2 characters'
      return ''
    case 'email':
      if (!email.value) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Enter a valid email address'
      return ''
    case 'phone':
      if (!phone.value.trim()) return 'Phone number is required'
      if (!isValidCameroonPhone(phone.value.trim())) return 'Enter a valid Cameroonian number (+237 6XX XXX XXX)'
      return ''
    case 'password':
      if (!password.value) return 'Password is required'
      if (password.value.length < 8) return 'Password must be at least 8 characters'
      return ''
    default:
      return ''
  }
}

function validateAll() {
  const fields: Field[] = ['fullName', 'email', 'phone', 'password']
  fields.forEach((f) => {
    touched.value[f] = true
    fieldErrors.value[f] = validateField(f)
  })
  return Object.values(fieldErrors.value).every((e) => !e)
}

function mapError(msg: string) {
  if (msg.includes('User already registered')) return 'An account with this email already exists'
  if (msg.includes('Password should be at least')) return 'Password must be at least 8 characters'
  return msg
}

async function handleSubmit() {
  if (!validateAll()) return
  errorMsg.value = ''
  try {
    await authStore.register(email.value, password.value, {
      full_name: fullName.value.trim(),
      phone: phone.value.trim(),
    })
    router.push('/auth/confirm')
  } catch (err: unknown) {
    errorMsg.value = mapError(err instanceof Error ? err.message : 'Registration failed')
  }
}
</script>

<template>
  <div>
    <h1 class="mb-1 text-xl font-semibold text-brand-dark">Create an account</h1>
    <p class="mb-6 text-sm text-text-muted">Join Thia — Cameroonian skincare you can trust</p>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <div class="space-y-1">
        <Label for="fullName">Full name</Label>
        <Input
          id="fullName"
          v-model="fullName"
          type="text"
          autocomplete="name"
          placeholder="Stephanie Mbusheri"
          :class="touched.fullName && fieldErrors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.fullName = true; fieldErrors.fullName = validateField('fullName')"
        />
        <p v-if="touched.fullName && fieldErrors.fullName" class="text-xs text-red-500">
          {{ fieldErrors.fullName }}
        </p>
      </div>

      <div class="space-y-1">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :class="touched.email && fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.email = true; fieldErrors.email = validateField('email')"
        />
        <p v-if="touched.email && fieldErrors.email" class="text-xs text-red-500">
          {{ fieldErrors.email }}
        </p>
      </div>

      <div class="space-y-1">
        <Label for="phone">Phone number</Label>
        <Input
          id="phone"
          v-model="phone"
          type="tel"
          autocomplete="tel"
          inputmode="tel"
          placeholder="+237 6XX XXX XXX"
          :class="touched.phone && fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.phone = true; fieldErrors.phone = validateField('phone')"
        />
        <p v-if="touched.phone && fieldErrors.phone" class="text-xs text-red-500">
          {{ fieldErrors.phone }}
        </p>
      </div>

      <div class="space-y-1">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="Min. 8 characters"
          :class="touched.password && fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''"
          @blur="touched.password = true; fieldErrors.password = validateField('password')"
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
        {{ authStore.loading ? 'Creating account…' : 'Create account' }}
      </Button>
    </form>

    <p class="mt-6 text-center text-sm text-text-muted">
      Already have an account?
      <NuxtLink to="/auth/login" class="font-medium text-brand-dark hover:underline">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
