export function useDiscountCode() {
  const cartStore = useCartStore()

  const code = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const appliedCode = ref<string | null>(null)
  const appliedAmount = ref(0)

  async function applyCode(inputCode: string, _subtotal: number) {
    error.value = null
    loading.value = true
    try {
      await cartStore.applyDiscount(inputCode.toUpperCase())
      appliedCode.value = cartStore.discountCode
      appliedAmount.value = cartStore.discountAmount
      code.value = ''
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Invalid discount code.'
    } finally {
      loading.value = false
    }
  }

  function removeCode() {
    cartStore.removeDiscount()
    appliedCode.value = null
    appliedAmount.value = 0
    error.value = null
  }

  return { code, loading, error, appliedCode, appliedAmount, applyCode, removeCode }
}
