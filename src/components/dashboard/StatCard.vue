<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  label: string
  value: string | number
  trend?: string
  colorClass?: string
  to?: string
}

withDefaults(defineProps<Props>(), {
  trend: '',
  colorClass: 'bg-paper-warm text-accent dark:bg-night-elevated',
  to: '',
})
</script>

<template>
  <component
    :is="to ? 'RouterLink' : 'div'"
    :to="to || undefined"
    :class="[
      'group border border-ink/10 bg-paper-pure p-5 transition-colors duration-200 dark:border-night-border dark:bg-night-soft',
      to ? 'cursor-pointer hover:border-ink dark:hover:border-paper/70' : '',
    ]"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ label }}</p>
        <p class="mt-1.5 text-2xl font-serif font-medium text-ink dark:text-paper">{{ value }}</p>
        <p
          v-if="trend"
          class="mt-1 text-xs font-mono uppercase tracking-wider text-status-completed"
        >
          {{ trend }}
        </p>
      </div>
      <div :class="['border p-3', colorClass]">
        <component :is="icon" class="h-6 w-6" />
      </div>
    </div>
  </component>
</template>
