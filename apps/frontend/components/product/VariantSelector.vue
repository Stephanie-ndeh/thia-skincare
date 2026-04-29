<script setup lang="ts">
interface Variant {
  id: string
  size_label: string | null
  scent_label: string | null
  price: number
  stock_quantity: number
}

const props = defineProps<{
  variants: Variant[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const uniqueSizes = computed(() => {
  const seen = new Set<string>()
  const sizes: string[] = []
  for (const v of props.variants) {
    if (v.size_label && !seen.has(v.size_label)) {
      seen.add(v.size_label)
      sizes.push(v.size_label)
    }
  }
  return sizes
})

const uniqueScents = computed(() => {
  const seen = new Set<string>()
  const scents: string[] = []
  for (const v of props.variants) {
    if (v.scent_label && !seen.has(v.scent_label)) {
      seen.add(v.scent_label)
      scents.push(v.scent_label)
    }
  }
  return scents
})

const showSizeSelector = computed(() => uniqueSizes.value.length > 1)
const showScentSelector = computed(() => uniqueScents.value.length > 1)

const selectedVariant = computed(() =>
  props.variants.find(v => v.id === props.modelValue) ?? props.variants[0] ?? null
)

const selectedSize = computed(() => selectedVariant.value?.size_label ?? null)
const selectedScent = computed(() => selectedVariant.value?.scent_label ?? null)

function selectSize(size: string) {
  const match = props.variants.find(v =>
    v.size_label === size && (selectedScent.value === null || v.scent_label === selectedScent.value)
  ) ?? props.variants.find(v => v.size_label === size)
  if (match) emit('update:modelValue', match.id)
}

function selectScent(scent: string) {
  const match = props.variants.find(v =>
    v.scent_label === scent && (selectedSize.value === null || v.size_label === selectedSize.value)
  ) ?? props.variants.find(v => v.scent_label === scent)
  if (match) emit('update:modelValue', match.id)
}

function isActive(value: string, type: 'size' | 'scent'): boolean {
  return type === 'size' ? selectedSize.value === value : selectedScent.value === value
}
</script>

<template>
  <div class="space-y-4">
    <!-- Size selector -->
    <div v-if="showSizeSelector">
      <p class="font-body text-sm font-medium text-brand-dark mb-2">Size</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in uniqueSizes"
          :key="size"
          type="button"
          class="px-4 py-2 rounded-lg border text-sm font-body transition-colors"
          :class="isActive(size, 'size')
            ? 'bg-brand-dark text-white border-brand-dark'
            : 'border-brand-dark/20 text-brand-dark hover:border-brand-dark'"
          @click="selectSize(size)"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <!-- Scent selector -->
    <div v-if="showScentSelector">
      <p class="font-body text-sm font-medium text-brand-dark mb-2">Scent</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="scent in uniqueScents"
          :key="scent"
          type="button"
          class="px-4 py-2 rounded-lg border text-sm font-body transition-colors"
          :class="isActive(scent, 'scent')
            ? 'bg-brand-dark text-white border-brand-dark'
            : 'border-brand-dark/20 text-brand-dark hover:border-brand-dark'"
          @click="selectScent(scent)"
        >
          {{ scent }}
        </button>
      </div>
    </div>
  </div>
</template>
