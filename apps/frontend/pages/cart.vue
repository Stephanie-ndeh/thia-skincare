<script setup lang="ts">
definePageMeta({ layout: 'default' })

const cartStore = useCartStore()
const supabaseUser = useSupabaseUser()

const checkoutHref = computed(() =>
  supabaseUser.value ? '/checkout' : '/auth/login?redirect=/checkout'
)

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

          <div class="mt-4 pt-4 border-t border-brand-dark/10">
            <NuxtLink
              to="/categories"
              class="font-body text-sm text-text-muted hover:text-brand-dark transition-colors"
            >
              ← Continue Shopping
            </NuxtLink>
          </div>
        </div>

        <!-- Order summary sidebar (1/3) -->
        <div class="bg-white rounded-xl p-6 h-fit">
          <h2 class="font-heading text-lg font-semibold text-brand-dark mb-2">Order Summary</h2>
          <DiscountCodeInput />
          <CartSummary />

          <NuxtLink
            :to="checkoutHref"
            class="block w-full text-center rounded-lg font-body text-sm font-medium py-3 mt-4 transition-colors"
            :class="cartStore.isEmpty
              ? 'bg-brand-dark/20 text-text-muted cursor-not-allowed pointer-events-none'
              : 'bg-brand-dark text-white hover:bg-brand-accent'"
          >
            Proceed to Checkout
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
