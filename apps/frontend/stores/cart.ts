import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { CartItemWithProduct, DiscountValidateResponse } from '@thia/shared'

const STORAGE_KEY = 'thia-cart'

type AddItemInput = Omit<CartItemWithProduct, 'id' | 'userId' | 'createdAt' | 'updatedAt'>

// ── localStorage helpers ────────────────────────────────────────────────────

function saveCartToStorage(items: CartItemWithProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

function loadCartFromStorage(): CartItemWithProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CartItemWithProduct[]
  } catch {
    return []
  }
}

function clearCartStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Fail silently
  }
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useCartStore = defineStore('cart', () => {
  const supabaseUser = useSupabaseUser()

  const items = ref<CartItemWithProduct[]>([])
  const discountCode = ref<string | null>(null)
  const discountAmount = ref(0)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!supabaseUser.value)

  // ── Getters ────────────────────────────────────────────────────────────────

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const subtotal = computed(() =>
    items.value.reduce(
      (sum, item) => sum + item.variantPrice * item.quantity,
      0,
    ),
  )

  const total = computed(() =>
    Math.max(0, subtotal.value - discountAmount.value),
  )

  const isEmpty = computed(() => items.value.length === 0)

  // ── Actions ────────────────────────────────────────────────────────────────

  function addItem(input: AddItemInput) {
    const existing = items.value.find((i) => i.variantId === input.variantId)
    if (existing) {
      existing.quantity += input.quantity
    } else {
      items.value.push({
        ...input,
        id: crypto.randomUUID(),
        userId: supabaseUser.value?.id ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    const item = items.value.find((i) => i.id === itemId)
    if (item) item.quantity = quantity
  }

  function removeItem(itemId: string) {
    const idx = items.value.findIndex((i) => i.id === itemId)
    if (idx !== -1) items.value.splice(idx, 1)
  }

  function clearCart() {
    items.value = []
    discountCode.value = null
    discountAmount.value = 0
    if (import.meta.client) clearCartStorage()
  }

  async function applyDiscount(code: string) {
    const apiBase = useRuntimeConfig().public.apiBaseUrl
    const result = await $fetch<DiscountValidateResponse>(
      `${apiBase}/discount-codes/validate`,
      { method: 'POST', body: { code } },
    )
    if (!result.valid) throw new Error(result.message)
    if (result.type === 'percentage') {
      discountAmount.value = Math.floor(subtotal.value * (result.value / 100))
    } else {
      discountAmount.value = Math.min(result.value, subtotal.value)
    }
    discountCode.value = result.code
  }

  function removeDiscount() {
    discountCode.value = null
    discountAmount.value = 0
  }

  async function loadFromServer() {
    // TODO Story 3.7 — implement when GET /cart backend route is built
    // if (!isAuthenticated.value) return
    // const session = await useSupabaseClient().auth.getSession()
    // const token = session.data.session?.access_token
    // if (!token) return
    // isLoading.value = true
    // try {
    //   const data = await $fetch<CartItemWithProduct[]>(
    //     `${useRuntimeConfig().public.apiBaseUrl}/cart`,
    //     { headers: { Authorization: `Bearer ${token}` } },
    //   )
    //   items.value = data
    // } finally {
    //   isLoading.value = false
    // }
  }

  async function syncToServer() {
    if (!isAuthenticated.value) return
    const session = await useSupabaseClient().auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return
    isLoading.value = true
    try {
      await $fetch(`${useRuntimeConfig().public.apiBaseUrl}/cart/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { items: items.value },
      })
    } catch {
      // Cart API not yet available — local state is preserved
    } finally {
      isLoading.value = false
    }
  }

  async function mergeGuestCart() {
    if (!isAuthenticated.value) return

    const guestItems = import.meta.client ? loadCartFromStorage() : []
    if (guestItems.length === 0) return

    // Merge: for matching variant IDs, keep the higher quantity
    for (const guestItem of guestItems) {
      const serverItem = items.value.find((i) => i.variantId === guestItem.variantId)
      if (serverItem) {
        serverItem.quantity = Math.max(serverItem.quantity, guestItem.quantity)
      } else {
        items.value.push({
          ...guestItem,
          userId: supabaseUser.value?.id ?? '',
        })
      }
    }

    // TODO: syncToServer() — push merged cart to DB once API is ready
    await syncToServer()

    if (import.meta.client) clearCartStorage()
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  // Load from localStorage on client init (guest mode)
  if (import.meta.client && !isAuthenticated.value) {
    items.value = loadCartFromStorage()
  }

  // Persist to localStorage on every change (guest only)
  if (import.meta.client) {
    watch(
      items,
      (newItems) => {
        if (!isAuthenticated.value) {
          saveCartToStorage(newItems)
        }
      },
      { deep: true },
    )
  }

  return {
    items,
    discountCode,
    discountAmount,
    isLoading,
    itemCount,
    subtotal,
    total,
    isEmpty,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscount,
    removeDiscount,
    loadFromServer,
    syncToServer,
    mergeGuestCart,
  }
})
