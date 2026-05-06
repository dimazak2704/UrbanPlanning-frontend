<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}
withDefaults(defineProps<Props>(), { size: 'md' })
const sizeClasses = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <p :class="['animate-pulse font-mono uppercase tracking-[0.24em] text-ink-muted dark:text-paper/65', sizeClasses[size]]">
      Loading...
    </p>
  </div>
</template>
