import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WishlistItem, WishlistToggleResponse } from '@thia/shared'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishlistItem[]>([])
  const isLoading = ref(false)

  function isWishlisted(productId: string): boolean {
    return items.value.some((item) => item.product_id === productId)
  }

  async function fetchWishlist(): Promise<void> {
    const session = await useSupabaseClient().auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    isLoading.value = true
    try {
      const response = await $fetch<{ data: WishlistItem[] }>(
        `${useRuntimeConfig().public.apiBaseUrl}/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      items.value = response.data
    } catch {
      // preserve existing items on network error
    } finally {
      isLoading.value = false
    }
  }

  async function toggleWishlist(productId: string): Promise<void> {
    const session = await useSupabaseClient().auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return

    const wasWishlisted = isWishlisted(productId)

    // Optimistic update
    if (wasWishlisted) {
      items.value = items.value.filter((item) => item.product_id !== productId)
    } else {
      items.value.push({
        id: crypto.randomUUID(),
        user_id: '',
        product_id: productId,
        created_at: new Date().toISOString(),
        product: null,
      })
    }

    try {
      await $fetch<{ data: WishlistToggleResponse }>(
        `${useRuntimeConfig().public.apiBaseUrl}/wishlist`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: { product_id: productId },
        },
      )
      // Refresh from server so items have populated product data
      await fetchWishlist()
    } catch {
      // Revert optimistic update on error
      if (wasWishlisted) {
        items.value.push({
          id: crypto.randomUUID(),
          user_id: '',
          product_id: productId,
          created_at: new Date().toISOString(),
          product: null,
        })
      } else {
        items.value = items.value.filter((item) => item.product_id !== productId)
      }
    }
  }

  return { items, isLoading, isWishlisted, fetchWishlist, toggleWishlist }
})
