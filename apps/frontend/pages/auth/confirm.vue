<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Confirm Email — Thia', robots: 'noindex, nofollow' })

const supabaseUser = useSupabaseUser()

// After email confirmation link is clicked, @nuxtjs/supabase exchanges the token
// and populates supabaseUser — that signals a successful confirmation.
const isConfirmed = computed(() => !!supabaseUser.value)
</script>

<template>
  <div class="text-center">
    <template v-if="isConfirmed">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="mb-2 text-xl font-semibold text-brand-dark">Email confirmed!</h1>
      <p class="mb-6 text-sm text-text-muted">Your account is ready. You can now sign in.</p>
      <Button class="w-full" @click="navigateTo('/auth/login')">
        Go to login
      </Button>
    </template>

    <template v-else>
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-secondary">
        <svg class="h-6 w-6 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 class="mb-2 text-xl font-semibold text-brand-dark">Check your email</h1>
      <p class="mb-6 text-sm text-text-muted">
        We sent a confirmation link to your email address. Click it to activate your account.
      </p>
      <p class="text-xs text-text-muted">
        Already confirmed?
        <NuxtLink to="/auth/login" class="font-medium text-brand-dark hover:underline">
          Sign in
        </NuxtLink>
      </p>
    </template>
  </div>
</template>
