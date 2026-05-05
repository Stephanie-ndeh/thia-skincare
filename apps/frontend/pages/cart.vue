<script setup lang="ts">
definePageMeta({
  layout: 'default',
  ssr: false,
})

const cartStore = useCartStore()

useHead({ title: 'Cart — Thia' })
</script>

<template>
  <div class="min-h-screen bg-brand-light">
    <div class="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <h1 class="font-heading text-2xl sm:text-3xl font-semibold text-brand-dark mb-8">
        Your Cart
      </h1>

      <!-- Empty state -->
      <EmptyCartState v-if="cartStore.isEmpty" />

      <!-- Cart content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Items list (2/3) -->
        <div class="lg:col-span-2 bg-white rounded-xl p-6">
          <CartItem
            v-for="item in cartStore.items"
            :key="item.id"
            :item="item"
          />

        </div>

        <!-- Order summary sidebar (1/3) -->
        <div class="bg-white rounded-xl p-6 h-fit">
          <h2 class="font-heading text-lg font-semibold text-brand-dark mb-2">Order Summary</h2>
          <DiscountCodeInput />
          <CartSummary
            :subtotal="cartStore.subtotal"
            :discount-amount="cartStore.discountAmount"
            :total="cartStore.total"
            :is-empty="cartStore.isEmpty"
            :discount-code="cartStore.discountCode"
          />
        </div>
      </div>
    </div>
  </div>
</template>
