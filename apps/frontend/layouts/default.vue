<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <MobileMenu />
    <main class="flex-1 pt-[60px] sm:pt-[96px] md:pt-[140px]">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
