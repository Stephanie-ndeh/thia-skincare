<script setup lang="ts">
import { SlidersHorizontal } from 'lucide-vue-next'

interface Category {
  id: string
  name: string
  slug: string
}

interface FilterState {
  sortBy: string
  minPrice: number | null
  maxPrice: number | null
}

const props = defineProps<{
  categories: Category[]
  currentCategorySlug: string
  modelValue: FilterState
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string | number | null | undefined>]
}>()

const isSheetOpen = ref(false)

const localMin = ref(props.modelValue.minPrice?.toString() ?? '')
const localMax = ref(props.modelValue.maxPrice?.toString() ?? '')

watch(() => props.modelValue, (v) => {
  localMin.value = v.minPrice?.toString() ?? ''
  localMax.value = v.maxPrice?.toString() ?? ''
})

function applyPrice() {
  const min = localMin.value ? Number(localMin.value) : null
  const max = localMax.value ? Number(localMax.value) : null
  emit('update:modelValue', { minPrice: min, maxPrice: max })
  isSheetOpen.value = false
}

function clearPrice() {
  localMin.value = ''
  localMax.value = ''
  emit('update:modelValue', { minPrice: null, maxPrice: null })
}
</script>

<template>
  <!-- Mobile trigger -->
  <button
    type="button"
    class="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-dark/20 font-body text-sm text-brand-dark hover:border-brand-dark transition-colors"
    @click="isSheetOpen = true"
  >
    <SlidersHorizontal class="w-4 h-4" />
    Filters
  </button>

  <!-- Mobile Sheet -->
  <Sheet :open="isSheetOpen" @update:open="isSheetOpen = $event">
    <SheetContent side="left" class="w-72 p-6">
      <SheetHeader>
        <SheetTitle class="font-heading text-lg">Filters</SheetTitle>
      </SheetHeader>

      <div class="mt-6 space-y-6">
        <div>
          <p class="font-body text-sm font-semibold text-brand-dark mb-3">Price Range (XAF)</p>
          <div class="flex flex-col gap-2">
            <input
              :value="localMin"
              type="number"
              placeholder="Min price"
              class="w-full font-body text-sm border border-brand-dark/20 rounded-lg px-3 py-2 focus:outline-none"
              @input="localMin = ($event.target as HTMLInputElement).value"
            />
            <input
              :value="localMax"
              type="number"
              placeholder="Max price"
              class="w-full font-body text-sm border border-brand-dark/20 rounded-lg px-3 py-2 focus:outline-none"
              @input="localMax = ($event.target as HTMLInputElement).value"
            />
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 px-3 py-1.5 rounded-lg bg-brand-dark text-white font-body text-xs hover:bg-brand-accent transition-colors"
                @click="applyPrice"
              >
                Apply
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-brand-dark/20 font-body text-xs text-brand-dark hover:border-brand-dark transition-colors"
                @click="clearPrice"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div v-if="categories.length > 0">
          <p class="font-body text-sm font-semibold text-brand-dark mb-3">Categories</p>
          <ul class="space-y-1">
            <li v-for="cat in categories" :key="cat.id">
              <NuxtLink
                :to="`/categories/${cat.slug}`"
                class="font-body text-sm transition-colors block py-1"
                :class="cat.slug === currentCategorySlug ? 'text-brand-dark font-semibold' : 'text-text-muted hover:text-brand-dark'"
                @click="isSheetOpen = false"
              >
                {{ cat.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </SheetContent>
  </Sheet>

  <!-- Desktop sidebar -->
  <aside class="hidden lg:block w-52 shrink-0 space-y-6">
    <div>
      <p class="font-body text-sm font-semibold text-brand-dark mb-3">Price Range (XAF)</p>
      <div class="flex flex-col gap-2">
        <input
          :value="localMin"
          type="number"
          placeholder="Min price"
          class="w-full font-body text-sm border border-brand-dark/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          @input="localMin = ($event.target as HTMLInputElement).value"
        />
        <input
          :value="localMax"
          type="number"
          placeholder="Max price"
          class="w-full font-body text-sm border border-brand-dark/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          @input="localMax = ($event.target as HTMLInputElement).value"
        />
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-3 py-1.5 rounded-lg bg-brand-dark text-white font-body text-xs hover:bg-brand-accent transition-colors"
            @click="applyPrice"
          >
            Apply
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-brand-dark/20 font-body text-xs text-brand-dark hover:border-brand-dark transition-colors"
            @click="clearPrice"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <div v-if="categories.length > 0">
      <p class="font-body text-sm font-semibold text-brand-dark mb-3">Categories</p>
      <ul class="space-y-1">
        <li v-for="cat in categories" :key="cat.id">
          <NuxtLink
            :to="`/categories/${cat.slug}`"
            class="font-body text-sm transition-colors block py-1"
            :class="cat.slug === currentCategorySlug ? 'text-brand-dark font-semibold' : 'text-text-muted hover:text-brand-dark'"
          >
            {{ cat.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>
