<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <ShoppingBag class="w-12 h-12 text-brand-dark/20 mb-4" />
    <h3 class="font-heading text-lg font-semibold text-brand-dark mb-2">Your cart is empty</h3>
    <p class="font-body text-sm text-text-muted mb-6">Discover our range of natural skincare products.</p>
    <NuxtLink
      to="/categories"
      class="inline-flex items-center justify-center rounded-lg bg-brand-dark text-white font-body text-sm px-6 py-2.5 hover:bg-brand-accent transition-colors"
    >
      Browse Products
    </NuxtLink>
  </div>
</template>
