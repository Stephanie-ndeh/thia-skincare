<script setup lang="ts">
import { X } from 'lucide-vue-next'

const uiStore = useUiStore()
const cartStore = useCartStore()
const supabaseUser = useSupabaseUser()

const checkoutHref = computed(() =>
  supabaseUser.value ? '/checkout' : '/auth/login?redirect=/checkout'
)
</script>

<template>
  <Sheet :open="uiStore.isCartOpen" @update:open="(v) => !v && uiStore.closeCart()">
    <SheetContent side="right" class="flex flex-col w-full max-w-sm p-0">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-brand-dark/10">
        <h2 class="font-heading text-lg font-semibold text-brand-dark">
          Your Cart ({{ cartStore.itemCount }})
        </h2>
        <button
          type="button"
          class="text-text-muted hover:text-brand-dark transition-colors"
          @click="uiStore.closeCart()"
          aria-label="Close cart"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body — scrollable items -->
      <div class="flex-1 overflow-y-auto px-5">
        <EmptyCartState v-if="cartStore.isEmpty" />

        <div v-else>
          <CartItem
            v-for="item in cartStore.items"
            :key="item.id"
            :item="item"
          />
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!cartStore.isEmpty" class="px-5 pb-6 border-t border-brand-dark/10">
        <DiscountCodeInput />
        <CartSummary />

        <NuxtLink
          :to="checkoutHref"
          class="block w-full text-center rounded-lg font-body text-sm font-medium py-3 transition-colors mt-3"
          :class="cartStore.isEmpty
            ? 'bg-brand-dark/20 text-text-muted cursor-not-allowed pointer-events-none'
            : 'bg-brand-dark text-white hover:bg-brand-accent'"
          @click="uiStore.closeCart()"
        >
          Proceed to Checkout
        </NuxtLink>
      </div>
    </SheetContent>
  </Sheet>
</template>
