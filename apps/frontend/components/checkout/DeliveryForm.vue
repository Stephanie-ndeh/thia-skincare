<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { isValidCameroonPhone, CAMEROON_REGIONS } from '@thia/shared'

export interface DeliveryData {
  fullName: string
  phone: string
  city: string
  address: string
  region: string
}

const props = defineProps<{ modelValue: DeliveryData }>()
const emit = defineEmits<{
  'update:modelValue': [value: DeliveryData]
  'city-changed': [city: string]
}>()

const phoneError = ref<string | null>(null)

function update(field: keyof DeliveryData, value: string) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function onPhoneBlur() {
  if (props.modelValue.phone && !isValidCameroonPhone(props.modelValue.phone)) {
    phoneError.value = 'Please enter a valid Cameroonian phone number (e.g. 677000000)'
  } else {
    phoneError.value = null
  }
}

const emitCityChanged = useDebounceFn((city: string) => {
  emit('city-changed', city)
}, 500)

function onCityInput(value: string) {
  update('city', value)
  emitCityChanged(value)
}
</script>

<template>
  <div class="space-y-4">
    <div class="scroll-mt-4">
      <label class="block text-sm font-medium text-text-dark">Full Name</label>
      <input
        type="text"
        :value="modelValue.fullName"
        @input="update('fullName', ($event.target as HTMLInputElement).value)"
        placeholder="e.g. Marie Nguele"
        inputmode="text"
        class="mt-1 w-full rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-dark"
      />
    </div>

    <div class="scroll-mt-4">
      <label class="block text-sm font-medium text-text-dark">Phone Number</label>
      <input
        type="tel"
        :value="modelValue.phone"
        @input="update('phone', ($event.target as HTMLInputElement).value)"
        @blur="onPhoneBlur"
        placeholder="677000000"
        inputmode="tel"
        pattern="[0-9]*"
        class="mt-1 w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-dark"
        :class="phoneError ? 'border-red-400' : 'border-border'"
      />
      <p v-if="phoneError" class="mt-1 text-xs text-red-500">{{ phoneError }}</p>
    </div>

    <div class="scroll-mt-4">
      <label class="block text-sm font-medium text-text-dark">Region</label>
      <select
        :value="modelValue.region"
        @change="update('region', ($event.target as HTMLSelectElement).value)"
        class="mt-1 w-full rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-dark"
      >
        <option value="" disabled>Select a region</option>
        <option v-for="r in CAMEROON_REGIONS" :key="r.name" :value="r.name">
          {{ r.name }}
        </option>
      </select>
    </div>

    <div class="scroll-mt-4">
      <label class="block text-sm font-medium text-text-dark">City</label>
      <input
        type="text"
        :value="modelValue.city"
        @input="onCityInput(($event.target as HTMLInputElement).value)"
        placeholder="e.g. Douala"
        inputmode="text"
        class="mt-1 w-full rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-dark"
      />
    </div>

    <div class="scroll-mt-4">
      <label class="block text-sm font-medium text-text-dark">Address</label>
      <input
        type="text"
        :value="modelValue.address"
        @input="update('address', ($event.target as HTMLInputElement).value)"
        placeholder="Street address"
        inputmode="text"
        class="mt-1 w-full rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-dark"
      />
    </div>
  </div>
</template>
