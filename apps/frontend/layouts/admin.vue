<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

useSeoMeta({ robots: 'noindex, nofollow' })

const showLogoutConfirm = ref(false)

async function handleLogout() {
  showLogoutConfirm.value = false
  await authStore.logout()
  router.push('/auth/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <AdminSidebar />

    <!-- Main area (offset for sidebar on desktop) -->
    <div class="flex flex-1 flex-col md:ml-64">
      <!-- Top bar -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <!-- Page title slot or placeholder -->
        <h1 class="text-base font-semibold text-brand-dark">Admin Panel</h1>

        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-text-muted sm:block">
            {{ authStore.fullName }}
          </span>
          <button
            class="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
            @click="showLogoutConfirm = true"
          >
            <LogOut class="h-4 w-4" />
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>

  <!-- Sign out confirmation -->
  <Teleport to="body">
    <div
      v-if="showLogoutConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showLogoutConfirm = false"
    >
      <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-base font-semibold text-brand-dark">Sign out?</h3>
        <p class="mt-1 text-sm text-text-muted">You'll be redirected to the login page.</p>
        <div class="mt-4 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-gray-50"
            @click="showLogoutConfirm = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            @click="handleLogout"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
