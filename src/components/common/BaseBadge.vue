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
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  teal: 'bg-teal-100 text-teal-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
}

const classes = computed(() =>
  props.customClass || variantClasses[props.variant] || variantClasses.slate,
)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      classes,
    ]"
  >
    <slot />
  </span>
</template>
