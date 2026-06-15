import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Profile } from '@thia/shared'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()

  const profile = ref<Profile | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!supabaseUser.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const fullName = computed(
    () => profile.value?.fullName ?? supabaseUser.value?.email ?? '',
  )

  interface ProfileRow {
    id: string
    full_name: string
    phone: string | null
    role: 'customer' | 'admin'
    created_at: string
    updated_at: string
  }

  async function fetchProfile() {
    if (!supabaseUser.value) return
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at, updated_at')
        .eq('id', supabaseUser.value.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        // Profile row missing (trigger didn't fire) — create it now
        const meta = supabaseUser.value.user_metadata ?? {}
        const { data: created, error: insertError } = await supabase
          .from('profiles')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert({
            id: supabaseUser.value.id,
            full_name: (meta.full_name as string) || supabaseUser.value.email?.split('@')[0] || 'User',
            phone: (meta.phone as string | null) ?? null,
            role: 'customer',
          } as any)
          .select('id, full_name, phone, role, created_at, updated_at')
          .single()

        if (insertError) throw insertError

        const row = created as unknown as ProfileRow
        profile.value = {
          id: row.id,
          fullName: row.full_name,
          phone: row.phone,
          role: row.role,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
        return
      }

      const row = data as unknown as ProfileRow
      profile.value = {
        id: row.id,
        fullName: row.full_name,
        phone: row.phone,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    } catch (err) {
      console.error('[auth] Failed to fetch profile:', err)
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      await fetchProfile()

      // Merge guest cart then load server cart
      const { useCartStore } = await import('./cart')
      const cartStore = useCartStore()
      await cartStore.mergeGuestCart()
      await cartStore.loadFromServer()
    } finally {
      loading.value = false
    }
  }

  async function register(
    email: string,
    password: string,
    metadata: { full_name: string; phone?: string },
  ) {
    loading.value = true
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })
      if (error) throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await supabase.auth.signOut()
      profile.value = null
      const { useCartStore } = await import('./cart')
      useCartStore().clearCart()
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || (import.meta.client ? window.location.origin : '')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset-password`,
    })
    if (error) throw error
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  // Auto-fetch profile when session is restored (e.g. on page reload)
  watch(
    supabaseUser,
    async (user) => {
      if (user) {
        await fetchProfile()
      } else {
        profile.value = null
      }
    },
    { immediate: true },
  )

  return {
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    fullName,
    fetchProfile,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  }
})
