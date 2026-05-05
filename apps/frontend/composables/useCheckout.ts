import type { DeliveryData } from '~/components/checkout/DeliveryForm.vue'

interface CheckoutState {
  isLoading: boolean
  error: string | null
  deliveryData: DeliveryData | null
  selectedChannel: 'cm.mtn' | 'cm.orange'
  shippingRate: number
  shippingZoneName: string
  isFreeShipping: boolean
  orderId: string | null
}

interface PaymentVerifyResponse {
  status: string
  amount: number
  reference: string
  order: unknown
}

export function useCheckout() {
  const config = useRuntimeConfig()
  const cartStore = useCartStore()
  const supabase = useSupabaseClient()
  const apiBase = config.public.apiBaseUrl as string

  const state = reactive<CheckoutState>({
    isLoading: false,
    error: null,
    deliveryData: null,
    selectedChannel: 'cm.mtn',
    shippingRate: 0,
    shippingZoneName: 'Standard',
    isFreeShipping: false,
    orderId: null,
  })

  async function calculateShipping(city: string): Promise<void> {
    if (!city.trim()) return
    state.isLoading = true
    state.error = null
    try {
      const result = await $fetch<{
        data: { rate: number; zoneName: string; isFree: boolean }
      }>(`${apiBase}/shipping/calculate`, {
        method: 'POST',
        body: { city, subtotal: cartStore.subtotal },
      })
      state.shippingRate = result.data.rate
      state.shippingZoneName = result.data.zoneName
      state.isFreeShipping = result.data.isFree
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to calculate shipping.'
    } finally {
      state.isLoading = false
    }
  }

  async function placeOrder(): Promise<void> {
    if (!state.deliveryData) {
      state.error = 'Please fill in your delivery details.'
      return
    }
    state.isLoading = true
    state.error = null
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const userEmail = session.data.session?.user.email ?? ''

      const orderPayload = {
        items: cartStore.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.variantPrice,
        })),
        shippingAmount: state.shippingRate,
        discountCode: cartStore.discountCode ?? undefined,
        discountAmount: cartStore.discountAmount > 0 ? cartStore.discountAmount : undefined,
        deliveryAddress: {
          fullName: state.deliveryData.fullName,
          phone: state.deliveryData.phone,
          city: state.deliveryData.city,
          address: state.deliveryData.address,
          region: state.deliveryData.region,
        },
      }

      const orderRes = await $fetch<{ data: { id: string } }>(`${apiBase}/orders`, {
        method: 'POST',
        body: orderPayload,
        headers,
      })

      state.orderId = orderRes.data.id
      const callbackUrl = `${window.location.origin}/order-confirmation`

      const paymentRes = await $fetch<{ data: { payment_url: string } }>(
        `${apiBase}/payments/initialize`,
        {
          method: 'POST',
          body: {
            orderId: state.orderId,
            channel: state.selectedChannel,
            email: userEmail,
            phone: state.deliveryData.phone,
            callbackUrl,
          },
          headers,
        },
      )

      await navigateTo(paymentRes.data.payment_url, { external: true })
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      state.isLoading = false
    }
  }

  async function verifyPayment(transactionRef: string): Promise<PaymentVerifyResponse> {
    state.isLoading = true
    state.error = null
    try {
      const result = await $fetch<{ data: PaymentVerifyResponse }>(
        `${apiBase}/payments/verify`,
        { method: 'POST', body: { reference: transactionRef } },
      )
      return result.data
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to verify payment.'
      throw err
    } finally {
      state.isLoading = false
    }
  }

  return { state, calculateShipping, placeOrder, verifyPayment }
}
