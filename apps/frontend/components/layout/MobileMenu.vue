<script setup lang="ts">
import { X, User, Package, LogOut, Settings } from 'lucide-vue-next'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

function close() {
  uiStore.closeMobileMenu()
}

async function handleLogout() {
  close()
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <Sheet :open="uiStore.isMobileMenuOpen" @update:open="(v) => !v && close()">
    <SheetContent side="left" class="w-72 p-0">
      <!-- Header -->
      <div class="flex items-center justify-between border-b px-6 py-4">
        <NuxtLink to="/" class="font-heading text-xl font-semibold text-brand-dark" @click="close">
          Thia
        </NuxtLink>
        <button class="p-1 text-text-muted hover:text-brand-dark" @click="close">
          <X class="h-5 w-5" />
        </button>
      </div>

      <nav class="flex flex-col px-4 py-4 safe-bottom">
        <!-- Main nav -->
        <NuxtLink
          to="/"
          class="flex h-11 items-center rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
          @click="close"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/categories"
          class="flex h-11 items-center rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
          @click="close"
        >
          Categories
        </NuxtLink>
        <NuxtLink
          to="/testimonials"
          class="flex h-11 items-center rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
          @click="close"
        >
          Testimonials
        </NuxtLink>

        <Separator class="my-3" />

        <!-- Guest links -->
        <template v-if="!authStore.isAuthenticated">
          <NuxtLink
            to="/auth/login"
            class="flex h-11 items-center rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
            @click="close"
          >
            Login
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="flex h-11 items-center rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
            @click="close"
          >
            Register
          </NuxtLink>
        </template>

        <!-- Authenticated links -->
        <template v-else>
          <NuxtLink
            to="/account"
            class="flex h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
            @click="close"
          >
            <User class="h-4 w-4" /> My Account
          </NuxtLink>
          <NuxtLink
            to="/account/orders"
            class="flex h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
            @click="close"
          >
            <Package class="h-4 w-4" /> Order History
          </NuxtLink>
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="flex h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-brand-dark hover:bg-brand-secondary"
            @click="close"
          >
            <Settings class="h-4 w-4" /> Admin Panel
          </NuxtLink>
          <button
            class="flex h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-red-600 hover:bg-red-50"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" /> Logout
          </button>
        </template>

        <Separator class="my-3" />

        <!-- Contact -->
        <div class="px-2 text-xs text-text-muted">
          <p class="mb-1 font-medium text-brand-dark">Contact</p>
          <p>+237 670 076 224</p>
          <p>+237 676 328 226</p>
        </div>
      </nav>
    </SheetContent>
  </Sheet>
</template>
