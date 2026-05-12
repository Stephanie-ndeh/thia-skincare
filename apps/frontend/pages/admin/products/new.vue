<script setup lang="ts">
definePageMeta({ layout: 'admin', ssr: false, middleware: 'admin' })

const uiStore = useUiStore()

function onSuccess() {
  uiStore.addToast('Product created successfully.', 'success')
  navigateTo('/admin/products')
}
</script>

<template>
  <div class="space-y-5">
    <h2 class="font-heading text-2xl font-semibold text-brand-dark">Add Product</h2>
    <ProductForm mode="create" @success="onSuccess" />
  </div>
</template>
