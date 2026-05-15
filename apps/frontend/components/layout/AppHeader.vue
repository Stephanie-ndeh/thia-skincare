<script setup lang="ts">
import { ShoppingBag, Menu, User, LogOut, Settings, Package } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const cartStore = useCartStore()
const uiStore = useUiStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <CartDrawer />
  <header class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <NuxtLink to="/" class="font-heading text-2xl font-semibold text-brand-dark">
        Thia
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          to="/categories"
          class="text-sm font-medium text-text-muted transition-colors hover:text-brand-dark"
        >
          {{ $t('nav.categories') }}
        </NuxtLink>
        <NuxtLink
          to="/testimonials"
          class="text-sm font-medium text-text-muted transition-colors hover:text-brand-dark"
        >
          {{ $t('nav.testimonials') }}
        </NuxtLink>
      </nav>

      <!-- Desktop right actions -->
      <div class="hidden items-center gap-3 md:flex">
        <LanguageSwitcher />
        <SearchBar />
        <!-- Cart -->
        <button type="button" class="relative p-2" @click="uiStore.openCart()" aria-label="Open cart">
          <ShoppingBag class="h-5 w-5 text-brand-dark" />
          <span
            v-if="cartStore.itemCount > 0"
            class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-white"
          >
            {{ cartStore.itemCount }}
          </span>
        </button>

        <!-- Guest: Login link -->
        <NuxtLink
          v-if="!authStore.isAuthenticated"
          to="/auth/login"
          class="text-sm font-medium text-brand-dark hover:text-brand-accent"
        >
          {{ $t('nav.login') }}
        </NuxtLink>

        <!-- Authenticated: Account dropdown -->
        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="gap-2">
              <User class="h-4 w-4" />
              <span class="max-w-24 truncate text-sm">{{ authStore.fullName }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem as-child>
              <NuxtLink to="/account" class="flex items-center gap-2">
                <User class="h-4 w-4" /> My Account
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/account/orders" class="flex items-center gap-2">
                <Package class="h-4 w-4" /> Order History
              </NuxtLink>
            </DropdownMenuItem>
            <template v-if="authStore.isAdmin">
              <DropdownMenuSeparator />
              <DropdownMenuItem as-child>
                <NuxtLink to="/admin" class="flex items-center gap-2">
                  <Settings class="h-4 w-4" /> Admin Panel
                </NuxtLink>
              </DropdownMenuItem>
            </template>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-red-600 focus:text-red-600" @click="handleLogout">
              <LogOut class="mr-2 h-4 w-4" /> {{ $t('nav.logout') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Mobile right actions -->
      <div class="flex items-center gap-2 md:hidden">
        <SearchBar />
        <button type="button" class="relative p-2" @click="uiStore.openCart()" aria-label="Open cart">
          <ShoppingBag class="h-5 w-5 text-brand-dark" />
          <span
            v-if="cartStore.itemCount > 0"
            class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-white"
          >
            {{ cartStore.itemCount }}
          </span>
        </button>
        <button
          class="p-2 text-brand-dark"
          aria-label="Open menu"
          @click="uiStore.toggleMobileMenu()"
        >
          <Menu class="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
</template>
