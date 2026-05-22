<script setup lang="ts">
definePageMeta({ layout: 'default', ssr: false, middleware: 'auth' })

const { t } = useI18n()
useSeoMeta({ title: () => t('seo.account_title'), robots: 'noindex, nofollow' })
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="lg:flex lg:items-start lg:gap-8">
      <AccountSidebar />
      <AccountOverview class="min-w-0 flex-1" />
    </div>
  </div>
</template>
