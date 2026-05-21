<script setup lang="ts">
import { ShoppingBag, Menu, User, LogOut, Settings, Package } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  <header class="fixed top-0 inset-x-0 z-50 w-full bg-cream border-b border-brand-dark/10">

    <!-- Utility bar (desktop only) -->
    <div class="hidden sm:flex items-center justify-between px-6 lg:px-10 py-2 border-b border-brand-dark/[0.08]">
      <p class="font-body text-[10px] tracking-[0.2em] uppercase text-text-muted">
        Yaoundé · Cameroon · Est. 2023
      </p>
      <div class="flex items-center gap-5">
        <p class="font-body text-[10px] tracking-[0.15em] uppercase text-text-muted">
          Free delivery above 15,000 XAF
        </p>
        <LanguageSwitcher />
      </div>
    </div>

    <!-- Logo bar -->
    <div class="grid grid-cols-3 items-center px-4 sm:px-6 py-4">
      <!-- Left: mobile hamburger -->
      <div class="flex items-center">
        <button
          class="p-1 text-brand-dark md:hidden"
          aria-label="Open menu"
          @click="uiStore.toggleMobileMenu()"
        >
          <Menu class="h-5 w-5" />
        </button>
      </div>

      <!-- Center: wordmark -->
      <div class="flex justify-center">
        <NuxtLink to="/" class="font-heading text-3xl font-semibold text-brand-dark tracking-tight leading-none">
          Thia<span class="text-terracotta">.</span>
        </NuxtLink>
      </div>

      <!-- Right: actions -->
      <div class="flex items-center justify-end gap-3">
        <div class="hidden md:block">
          <SearchBar />
        </div>

        <!-- Cart -->
        <button
          type="button"
          class="relative p-1"
          aria-label="Open cart"
          @click="uiStore.openCart()"
        >
          <ShoppingBag class="h-5 w-5 text-brand-dark" />
          <span
            v-if="cartStore.itemCount > 0"
            class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white"
          >
            {{ cartStore.itemCount }}
          </span>
        </button>

        <!-- Guest: login -->
        <NuxtLink
          v-if="!authStore.isAuthenticated"
          to="/auth/login"
          class="hidden md:flex font-body text-[11px] tracking-[0.15em] uppercase text-brand-dark hover:text-terracotta transition-colors"
        >
          {{ $t('nav.login') }}
        </NuxtLink>

        <!-- Authenticated: account dropdown -->
        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="p-1 h-auto hover:bg-transparent">
              <User class="h-5 w-5 text-brand-dark" />
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

        <!-- Mobile search + hamburger -->
        <div class="flex items-center gap-1 md:hidden">
          <SearchBar />
          <button
            class="p-1 text-brand-dark"
            aria-label="Open menu"
            @click="uiStore.toggleMobileMenu()"
          >
            <Menu class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Editorial nav (desktop only) -->
    <nav class="hidden md:flex items-center justify-center gap-10 px-6 py-3 border-t border-brand-dark/[0.08]">
      <NuxtLink
        to="/categories"
        class="animated-link font-body text-[11px] tracking-[0.18em] uppercase text-brand-dark/60 hover:text-brand-dark transition-colors"
        exact-active-class="text-brand-dark nav-link-active"
      >
        {{ $t('nav.categories') }}
      </NuxtLink>
      <!-- Best Sellers link — re-enable when the page is ready -->
      <!-- <NuxtLink
        to="/categories"
        class="animated-link font-body text-[11px] tracking-[0.18em] uppercase text-brand-dark/60 hover:text-brand-dark transition-colors"
      >
        Best Sellers
      </NuxtLink> -->
      <NuxtLink
        to="/about"
        class="animated-link font-body text-[11px] tracking-[0.18em] uppercase text-brand-dark/60 hover:text-brand-dark transition-colors"
        exact-active-class="text-brand-dark nav-link-active"
      >
        {{ $t('nav.our_story') }}
      </NuxtLink>
      <NuxtLink
        to="/faq"
        class="animated-link font-body text-[11px] tracking-[0.18em] uppercase text-brand-dark/60 hover:text-brand-dark transition-colors"
        exact-active-class="text-brand-dark nav-link-active"
      >
        {{ $t('nav.journal') }}
      </NuxtLink>
      <NuxtLink
        to="/testimonials"
        class="animated-link font-body text-[11px] tracking-[0.18em] uppercase text-brand-dark/60 hover:text-brand-dark transition-colors"
        exact-active-class="text-brand-dark nav-link-active"
      >
        {{ $t('nav.testimonials') }}
      </NuxtLink>
      <NuxtLink
        to="/contact"
        class="animated-link font-body text-[11px] tracking-[0.18em] uppercase text-brand-dark/60 hover:text-brand-dark transition-colors"
        exact-active-class="text-brand-dark nav-link-active"
      >
        {{ $t('nav.contact') }}
      </NuxtLink>
    </nav>
  </header>
</template>
