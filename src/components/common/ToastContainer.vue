<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'
import type { Toast } from '@/stores/toast.store'
import {
  PhCheckCircle,
  PhInfo,
  PhWarningCircle,
  PhX,
} from '@phosphor-icons/vue'

const toastStore = useToastStore()

const iconMap: Record<Toast['type'], typeof PhCheckCircle> = {
  success: PhCheckCircle,
  error: PhWarningCircle,
  info: PhInfo,
}

const colorMap: Record<Toast['type'], string> = {
  success: 'border-status-completed/40 bg-paper-pure text-ink dark:bg-night-soft dark:text-paper',
  error: 'border-status-suspended/45 bg-paper-pure text-ink dark:bg-night-soft dark:text-paper',
  info: 'border-status-approved/40 bg-paper-pure text-ink dark:bg-night-soft dark:text-paper',
}

const iconColorMap: Record<Toast['type'], string> = {
  success: 'text-status-completed',
  error: 'text-status-suspended',
  info: 'text-status-approved',
}
</script>

<template>
  <div class="fixed right-4 top-4 z-[100] flex w-80 flex-col gap-3">
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
          'flex items-start gap-3 border p-4',
          colorMap[toast.type],
        ]"
      >
        <component
          :is="iconMap[toast.type]"
          class="mt-0.5 h-5 w-5 shrink-0"
          :class="iconColorMap[toast.type]"
          :size="20"
          weight="light"
        />
        <p class="flex-1 text-sm leading-relaxed">{{ toast.message }}</p>
        <button
          class="shrink-0 border border-ink/15 p-1 text-ink-muted transition-colors hover:border-ink hover:text-ink dark:border-paper/25 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper"
          @click="toastStore.removeToast(toast.id)"
        >
          <PhX :size="12" weight="light" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
