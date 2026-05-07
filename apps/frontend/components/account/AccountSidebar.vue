<script setup lang="ts">
import { Home, Package, Heart, User, MapPin, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const supabaseUser = useSupabaseUser()
const route = useRoute()

const navItems = [
  { label: 'Overview',   to: '/account',           icon: Home },
  { label: 'Orders',     to: '/account/orders',    icon: Package },
  { label: 'Wishlist',   to: '/account/wishlist',  icon: Heart },
  { label: 'Profile',    to: '/account/profile',   icon: User },
  { label: 'Addresses',  to: '/account/addresses', icon: MapPin },
]

const initials = computed(() => {
  const name = authStore.fullName
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

function isActive(to: string): boolean {
  if (to === '/account') return route.path === '/account'
  return route.path.startsWith(to)
}

async function handleLogout() {
  await authStore.logout()
  await navigateTo('/auth/login')
}
</script>

<template>
  <!-- Desktop sidebar (lg+) -->
  <aside class="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col">
    <!-- User avatar + info -->
    <div class="mb-6 flex items-center gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-semibold text-white"
      >
        {{ initials }}
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-brand-dark">{{ authStore.fullName }}</p>
        <p class="truncate text-xs text-text-muted">{{ supabaseUser?.email }}</p>
      </div>
    </div>

    <!-- Nav links -->
    <nav class="flex flex-col gap-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
          isActive(item.to)
            ? 'bg-brand-secondary text-brand-dark'
            : 'text-text-muted hover:bg-gray-100 hover:text-brand-dark',
        ]"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- Logout -->
    <div class="mt-auto pt-6">
      <button
        class="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-brand-dark"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4 shrink-0" />
        Log out
      </button>
    </div>
  </aside>

  <!-- Mobile tab bar (< lg) -->
  <nav class="mb-6 flex overflow-x-auto border-b border-gray-200 lg:hidden">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :class="[
        'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
        isActive(item.to)
          ? 'border-brand-dark text-brand-dark'
          : 'border-transparent text-text-muted hover:text-brand-dark',
      ]"
    >
      <component :is="item.icon" class="h-4 w-4" />
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>
