<script setup lang="ts">
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-brand-secondary px-4 py-12">
    <!-- Logo -->
    <NuxtLink to="/" class="mb-8 font-heading text-3xl font-semibold text-brand-dark">
      Thia
    </NuxtLink>

    <!-- Card slot -->
    <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
      <slot />
    </div>

    <!-- Minimal footer -->
    <p class="mt-8 text-xs text-text-muted">
      © {{ new Date().getFullYear() }} Thia. All rights reserved.
    </p>
  </div>
</template>
