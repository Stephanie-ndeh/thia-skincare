<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-brand-light">
    <!-- Minimal header -->
    <header class="border-b bg-white">
      <div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <NuxtLink to="/" class="font-heading text-xl font-semibold text-brand-dark">
          Thia
        </NuxtLink>
        <NuxtLink
          to="/cart"
          class="flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-dark"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to cart
        </NuxtLink>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <slot />
      </div>
    </main>
  </div>
</template>
