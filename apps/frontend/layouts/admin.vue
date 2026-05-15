<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const { isCollapsed } = useAdminSidebar()

useSeoMeta({ robots: 'noindex, nofollow' })

async function handleLogout() {
  await authStore.logout()
  router.push('/auth/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <AdminSidebar />

    <!-- Main area — offset reacts to sidebar collapsed state -->
    <div
      :class="[
        'flex flex-1 flex-col transition-all duration-200',
        isCollapsed ? 'md:ml-12' : 'md:ml-60',
      ]"
    >
      <!-- Top bar -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <h1 class="text-base font-semibold text-brand-dark">Admin Panel</h1>

        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-text-muted sm:block">
            {{ authStore.fullName }}
          </span>
          <button
            class="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
            @click="handleLogout"
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
</template>
