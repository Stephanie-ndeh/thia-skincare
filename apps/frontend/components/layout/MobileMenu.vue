<script setup lang="ts">
import { X } from 'lucide-vue-next'

const { t } = useI18n()
const uiStore = useUiStore()
const authStore = useAuthStore()
const router = useRouter()

function close() {
  uiStore.closeMobileMenu()
}

async function handleLogout() {
  close()
  await authStore.logout()
  router.push('/')
}

const navLinks = computed(() => [
  { to: '/', label: t('nav.home') },
  { to: '/categories', label: t('nav.categories') },
  { to: '/about', label: t('nav.our_story') },
  { to: '/testimonials', label: t('nav.testimonials') },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: t('nav.contact') },
])
</script>

<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div
      v-if="uiStore.isMobileMenuOpen"
      class="fixed inset-0 bg-black/30 z-40 md:hidden"
      @click="close()"
    />
  </Transition>

  <!-- Menu panel (slides from left) -->
  <Transition name="menu">
    <div
      v-if="uiStore.isMobileMenuOpen"
      class="fixed top-0 left-0 h-full w-[280px] bg-[#F5F0E8] z-50 md:hidden flex flex-col overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-black/10">
        <span class="font-heading text-2xl font-semibold text-[#2C1810]">
          Thia<span class="text-[#C9622F]">.</span>
        </span>
        <button
          class="w-10 h-10 flex items-center justify-center text-[#2C1810]"
          aria-label="Close menu"
          @click="close()"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-6 py-6">
        <ul class="space-y-1">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="block py-3 text-sm uppercase tracking-widest text-[#2C1810] border-b border-black/10 hover:text-[#C9622F] transition-colors"
              @click="close()"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <!-- Auth links -->
        <div class="mt-8 space-y-1">
          <template v-if="!authStore.isAuthenticated">
            <NuxtLink
              to="/auth/login"
              class="block py-3 text-sm uppercase tracking-widest text-[#2C1810] border-b border-black/10 hover:text-[#C9622F] transition-colors"
              @click="close()"
            >
              {{ $t('nav.login') }}
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="block py-3 text-sm uppercase tracking-widest text-[#2C1810] border-b border-black/10 hover:text-[#C9622F] transition-colors"
              @click="close()"
            >
              {{ $t('nav.register') }}
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              to="/account"
              class="block py-3 text-sm uppercase tracking-widest text-[#2C1810] border-b border-black/10 hover:text-[#C9622F] transition-colors"
              @click="close()"
            >
              {{ $t('account.title') }}
            </NuxtLink>
            <NuxtLink
              to="/account/orders"
              class="block py-3 text-sm uppercase tracking-widest text-[#2C1810] border-b border-black/10 hover:text-[#C9622F] transition-colors"
              @click="close()"
            >
              {{ $t('nav.order_history') }}
            </NuxtLink>
            <NuxtLink
              v-if="authStore.isAdmin"
              to="/admin"
              class="block py-3 text-sm uppercase tracking-widest text-[#2C1810] border-b border-black/10 hover:text-[#C9622F] transition-colors"
              @click="close()"
            >
              {{ $t('nav.admin_panel') }}
            </NuxtLink>
            <button
              class="block w-full text-left py-3 text-sm uppercase tracking-widest text-red-600 border-b border-black/10"
              @click="handleLogout"
            >
              {{ $t('nav.logout') }}
            </button>
          </template>
        </div>
      </nav>

      <!-- Bottom: contact info -->
      <div class="px-6 py-6 border-t border-black/10">
        <p class="text-xs uppercase tracking-widest text-[#2C1810]/50 mb-3">
          {{ $t('nav.contact') }}
        </p>
        <p class="text-sm text-[#2C1810]/70">+237 670 076 224</p>
        <p class="text-sm text-[#2C1810]/70">+237 676 328 226</p>
        <div class="flex gap-2 mt-4">
          <span class="bg-[#FFCB05] text-black text-xs font-bold px-2 py-1">MTN</span>
          <span class="bg-[#F05A28] text-white text-xs font-bold px-2 py-1">Orange</span>
        </div>
      </div>
    </div>
  </Transition>
</template>
