<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'slate' | 'blue' | 'amber' | 'emerald' | 'red' | 'indigo' | 'teal' | 'orange' | 'purple'
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'slate',
  customClass: '',
})

const variantClasses: Record<string, string> = {
  slate: 'border-ink/20 text-ink-muted dark:border-paper/25 dark:text-paper/65',
  blue: 'border-status-approved/35 text-status-approved',
  amber: 'border-status-construction/35 text-status-construction',
  emerald: 'border-status-completed/35 text-status-completed',
  red: 'border-status-suspended/35 text-status-suspended',
  indigo: 'border-ink/20 text-ink-muted dark:border-paper/25 dark:text-paper/65',
  teal: 'border-status-approved/35 text-status-approved',
  orange: 'border-status-construction/35 text-status-construction',
  purple: 'border-ink/20 text-ink-muted dark:border-paper/25 dark:text-paper/65',
}

const classes = computed(() =>
  props.customClass || variantClasses[props.variant] || variantClasses.slate,
)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center border px-2.5 py-1 text-xs font-mono uppercase tracking-widest',
      classes,
    ]"
  >
    <slot />
  </span>
</template>
