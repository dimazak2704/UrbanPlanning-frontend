<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const variantClasses: Record<string, string> = {
  primary: 'border border-ink bg-ink text-paper hover:bg-accent hover:border-accent dark:border-paper dark:bg-paper dark:text-night dark:hover:bg-accent dark:hover:text-paper dark:hover:border-accent',
  secondary: 'border border-ink text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper dark:hover:bg-paper dark:hover:text-night',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper dark:hover:bg-paper dark:hover:text-night',
  danger: 'border border-status-suspended bg-status-suspended text-paper hover:opacity-90',
  ghost: 'bg-transparent text-ink underline-offset-4 hover:underline dark:text-paper',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-5 py-2.5 text-xs gap-2',
  md: 'px-8 py-4 text-sm gap-2.5',
  lg: 'px-10 py-5 text-sm gap-3',
}

const classes = computed(() => [
  'inline-flex items-center justify-center font-mono uppercase tracking-wider rounded-sm transition-colors duration-300',
  'focus:outline-none focus-visible:ring-1 focus-visible:ring-ink dark:focus-visible:ring-paper',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  variantClasses[props.variant],
  sizeClasses[props.size],
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
  >
    <template v-if="loading">
      <span class="text-xs tracking-[0.16em]">LOADING...</span>
    </template>
    <template v-else>
      <slot name="iconLeft" />
      <slot />
      <slot name="iconRight" />
    </template>
  </button>
</template>
