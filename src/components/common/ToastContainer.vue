<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'
import type { Toast } from '@/stores/toast.store'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const toastStore = useToastStore()

const iconMap: Record<Toast['type'], typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
}

const colorMap: Record<Toast['type'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-primary-200 bg-primary-50 text-primary-800',
}

const iconColorMap: Record<Toast['type'], string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-primary-500',
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-80">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="[
          'flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm',
          colorMap[toast.type],
        ]"
      >
        <component
          :is="iconMap[toast.type]"
          class="h-5 w-5 shrink-0 mt-0.5"
          :class="iconColorMap[toast.type]"
        />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          class="shrink-0 rounded-lg p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          @click="toastStore.removeToast(toast.id)"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
