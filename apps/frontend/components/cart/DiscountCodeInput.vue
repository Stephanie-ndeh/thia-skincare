<script setup lang="ts">
import { X, ChevronDown, Check } from 'lucide-vue-next'
import { formatXAF } from '@thia/shared'

const cartStore = useCartStore()
const { code, loading, error, appliedCode, appliedAmount, applyCode, removeCode } = useDiscountCode()

const isExpanded = ref(false)

async function handleApply() {
  if (!code.value.trim()) return
  await applyCode(code.value.trim(), cartStore.subtotal)
}
</script>

<template>
  <div class="border-t border-brand-dark/10 pt-4">
    <!-- Toggle -->
    <button
      v-if="!cartStore.discountCode"
      type="button"
      class="flex items-center gap-1 font-body text-sm text-text-muted hover:text-brand-dark transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <ChevronDown
        class="w-4 h-4 transition-transform"
        :class="isExpanded ? 'rotate-180' : ''"
      />
      Have a promo code?
    </button>

    <!-- Input row -->
    <div v-if="isExpanded && !cartStore.discountCode" class="mt-2">
      <div class="flex gap-2">
        <input
          v-model="code"
          type="text"
          placeholder="Enter code"
          class="flex-1 font-body text-sm border border-brand-dark/20 rounded-lg px-3 py-2 uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          @keydown.enter="handleApply"
        />
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-brand-dark text-white font-body text-sm hover:bg-brand-accent transition-colors disabled:opacity-60"
          :disabled="loading || !code.trim()"
          @click="handleApply"
        >
          {{ loading ? '…' : 'Apply' }}
        </button>
      </div>
      <p v-if="error" class="font-body text-xs text-red-600 mt-1.5">{{ error }}</p>
    </div>

    <!-- Applied state -->
    <div v-if="cartStore.discountCode" class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Check class="w-4 h-4 text-green-600" />
        <span class="font-body text-sm text-green-700 font-medium">
          {{ cartStore.discountCode }} — −{{ formatXAF(cartStore.discountAmount) }}
        </span>
      </div>
      <button
        type="button"
        class="font-body text-xs text-text-muted hover:text-red-600 transition-colors"
        @click="removeCode"
      >
        Remove
      </button>
    </div>
  </div>
</template>
