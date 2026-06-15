<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'

const query = ref('')
const isMobileOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const { results, loading, debouncedQuery } = useSearch(query)

const showDropdown = computed(() => debouncedQuery.value.length >= 2)
const previewItems = computed(() => results.value.slice(0, 5))

onClickOutside(containerRef, () => {
  query.value = ''
  isMobileOpen.value = false
})

function clear() {
  query.value = ''
  isMobileOpen.value = false
}

function openMobile() {
  isMobileOpen.value = true
  nextTick(() => inputRef.value?.focus())
}

function onEnter() {
  if (query.value.trim().length >= 2) {
    navigateTo(`/search?q=${encodeURIComponent(query.value.trim())}`)
    query.value = ''
    isMobileOpen.value = false
  }
}

function onEscape() {
  query.value = ''
  isMobileOpen.value = false
  inputRef.value?.blur()
}
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Desktop: always-visible input -->
    <div class="hidden md:flex items-center relative">
      <Search class="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        :placeholder="$t('nav.search')"
        class="font-body text-sm pl-9 pr-8 py-2 rounded-lg border border-brand-dark/20 bg-white w-52 lg:w-64 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark/40 transition-colors"
        @keydown.enter="onEnter"
        @keydown.escape="onEscape"
      />
      <button
        v-if="query"
        type="button"
        class="absolute right-2.5 text-text-muted hover:text-brand-dark"
        @click="clear"
        aria-label="Clear search"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Mobile: icon triggers full-width bar -->
    <button
      type="button"
      class="md:hidden p-2 text-brand-dark"
      @click="openMobile"
      aria-label="Search"
    >
      <Search class="w-5 h-5" />
    </button>

    <!-- Mobile expanded input -->
    <div
      v-if="isMobileOpen"
      class="md:hidden fixed inset-x-0 top-0 z-[60] flex items-center gap-3 bg-white border-b border-brand-dark/20 px-4 py-3 shadow-md"
    >
      <Search class="shrink-0 w-4 h-4 text-text-muted" />
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        :placeholder="$t('nav.search')"
        class="flex-1 font-body text-sm focus:outline-none bg-transparent"
        @keydown.enter="onEnter"
        @keydown.escape="onEscape"
      />
      <button type="button" class="text-text-muted" @click="clear" aria-label="Close search">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Dropdown preview -->
    <div
      v-if="showDropdown"
      class="absolute top-full mt-1.5 left-0 right-0 min-w-[280px] bg-white border border-brand-dark/10 rounded-xl shadow-lg z-50 overflow-hidden"
    >
      <!-- Loading -->
      <div v-if="loading" class="px-4 py-3">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 py-1.5">
          <div class="w-10 h-10 rounded-lg bg-brand-light animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-3/4 bg-brand-light rounded animate-pulse" />
            <div class="h-2.5 w-1/3 bg-brand-light rounded animate-pulse" />
          </div>
        </div>
      </div>

      <template v-else>
        <SearchPreviewItem
          v-for="product in previewItems"
          :key="product.id"
          :product="product"
          @click="clear"
        />

        <div v-if="previewItems.length === 0" class="px-4 py-3 font-body text-sm text-text-muted">
          {{ $t('nav.search_no_results', { query: debouncedQuery }) }}
        </div>

        <NuxtLink
          v-if="previewItems.length > 0"
          :to="`/search?q=${encodeURIComponent(debouncedQuery)}`"
          class="flex items-center justify-between px-4 py-2.5 border-t border-brand-dark/10 font-body text-sm text-brand-dark hover:bg-brand-light transition-colors"
          @click="clear"
        >
          {{ $t('nav.search_see_all', { count: results.length, query: debouncedQuery }) }}
          <span class="text-text-muted">→</span>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
