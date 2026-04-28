<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <MobileMenu />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
