interface DiscountCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  is_active: boolean
  expires_at: string | null
  usage_count: number
  usage_limit: number | null
  minimum_order: number
}

export function useDiscountCode() {
  const supabase = useSupabaseClient()
  const cartStore = useCartStore()

  const code = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const appliedCode = ref<string | null>(null)
  const appliedAmount = ref(0)

  async function applyCode(inputCode: string, subtotal: number) {
    error.value = null
    loading.value = true

    try {
      const { data, error: dbError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('is_active', true)
        .ilike('code', inputCode)
        .single()

      if (dbError || !data) {
        error.value = 'Invalid discount code.'
        return
      }

      const dc = data as DiscountCode

      if (dc.expires_at && new Date(dc.expires_at) < new Date()) {
        error.value = 'This discount code has expired.'
        return
      }

      if (dc.usage_limit !== null && dc.usage_count >= dc.usage_limit) {
        error.value = 'This discount code has reached its usage limit.'
        return
      }

      if (subtotal < dc.minimum_order) {
        error.value = `A minimum order of ${dc.minimum_order.toLocaleString()} XAF is required for this code.`
        return
      }

      await cartStore.applyDiscount(dc.code.toUpperCase())
      appliedCode.value = cartStore.discountCode
      appliedAmount.value = cartStore.discountAmount
      code.value = ''
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to apply discount code.'
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
