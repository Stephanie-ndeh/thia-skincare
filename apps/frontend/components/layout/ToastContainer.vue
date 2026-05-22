<script setup lang="ts">
import { X, CheckCircle, AlertCircle, Info } from 'lucide-vue-next'

const uiStore = useUiStore()

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          :class="[
            'flex w-72 items-start gap-3 rounded-lg border px-4 py-3 shadow-md',
            colorMap[toast.type],
          ]"
          role="alert"
        >
          <component :is="icons[toast.type]" class="mt-0.5 h-4 w-4 shrink-0" />
          <p class="flex-1 text-sm">{{ toast.message }}</p>
          <button
            class="shrink-0 opacity-60 hover:opacity-100"
            @click="uiStore.removeToast(toast.id)"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

