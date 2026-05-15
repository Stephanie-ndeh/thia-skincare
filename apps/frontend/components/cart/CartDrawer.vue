<script setup lang="ts">
import { X } from 'lucide-vue-next'

const uiStore = useUiStore()
const cartStore = useCartStore()
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
          class="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-brand-dark transition-colors"
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
      <div v-if="!cartStore.isEmpty" class="px-5 pt-4 pb-6 border-t border-brand-dark/10 safe-bottom">
        <DiscountCodeInput />
        <CartSummary
          :subtotal="cartStore.subtotal"
          :discount-amount="cartStore.discountAmount"
          :total="cartStore.total"
          :is-empty="cartStore.isEmpty"
          :discount-code="cartStore.discountCode"
        />
      </div>
    </SheetContent>
  </Sheet>
</template>
