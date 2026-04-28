import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

export const useUiStore = defineStore('ui', () => {
  const isMobileMenuOpen = ref(false)
  const toasts = ref<Toast[]>([])
  const isGlobalLoading = ref(false)

  // ── Mobile menu ────────────────────────────────────────────────────────────

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false
  }

  // ── Toasts ─────────────────────────────────────────────────────────────────

  function addToast(
    message: string,
    type: Toast['type'] = 'info',
    duration = 3000,
  ) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type, duration })

    if (import.meta.client) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  function removeToast(id: string) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  // ── Global loading ─────────────────────────────────────────────────────────

  function setGlobalLoading(loading: boolean) {
    isGlobalLoading.value = loading
  }

  return {
    isMobileMenuOpen,
    toasts,
    isGlobalLoading,
    toggleMobileMenu,
    closeMobileMenu,
    addToast,
    removeToast,
    setGlobalLoading,
  }
})
