<script setup lang="ts">
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Ticket,
  Star,
  MessageSquare,
  Truck,
  Users,
  BarChart2,
  Settings,
  Store,
  Menu,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const isOpen = ref(false)

const navItems = [
  { label: 'Dashboard',    to: '/admin',              icon: LayoutDashboard },
  { label: 'Products',     to: '/admin/products',     icon: Package },
  { label: 'Categories',   to: '/admin/categories',   icon: Tag },
  { label: 'Orders',       to: '/admin/orders',       icon: ShoppingCart },
  { label: 'Discount Codes', to: '/admin/discount-codes', icon: Ticket },
  { label: 'Reviews',        to: '/admin/reviews',        icon: Star },
  { label: 'Client Photos',  to: '/admin/client-photos',  icon: MessageSquare },
  { label: 'Shipping',     to: '/admin/shipping',     icon: Truck },
  { label: 'Customers',    to: '/admin/customers',    icon: Users },
  { label: 'Analytics',    to: '/admin/analytics',    icon: BarChart2 },
  { label: 'Settings',     to: '/admin/settings',     icon: Settings },
]

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<template>
  <!-- Mobile toggle button -->
  <button
    class="fixed left-4 top-4 z-50 rounded-md bg-brand-dark p-2 text-white md:hidden"
    @click="isOpen = !isOpen"
  >
    <component :is="isOpen ? X : Menu" class="h-5 w-5" />
  </button>

  <!-- Overlay (mobile) -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      @click="isOpen = false"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-dark text-white transition-transform duration-200',
      'md:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div class="flex h-16 items-center border-b border-white/10 px-6">
      <span class="font-heading text-xl font-semibold">Thia Admin</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
          isActive(item.to)
            ? 'bg-white/15 text-white'
            : 'text-gray-400 hover:bg-white/10 hover:text-white',
        ]"
        @click="isOpen = false"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- Back to store -->
    <div class="border-t border-white/10 px-3 py-4">
      <NuxtLink
        to="/"
        class="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white"
      >
        <Store class="h-4 w-4" />
        Back to Store
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
