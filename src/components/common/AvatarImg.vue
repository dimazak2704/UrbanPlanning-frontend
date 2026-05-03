<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  size: 'md',
})

const sizeClasses: Record<string, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const sizeClass = computed(() => sizeClasses[props.size])

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return props.name.slice(0, 2).toUpperCase()
})

const gradientColors = [
  'from-primary-500 to-primary-600',
  'from-accent-500 to-accent-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-violet-500 to-violet-600',
  'from-cyan-500 to-cyan-600',
  'from-fuchsia-500 to-fuchsia-600',
]

const gradientClass = computed(() => {
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradientColors[Math.abs(hash) % gradientColors.length]
})

const hasImage = computed(() => !!props.src)
</script>

<template>
  <div :class="['relative shrink-0 rounded-full overflow-hidden', sizeClass]">
    <img
      v-if="hasImage"
      :src="src!"
      :alt="name"
      class="h-full w-full object-cover"
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    />
    <div
      v-if="!hasImage"
      :class="[
        'flex h-full w-full items-center justify-center bg-gradient-to-br font-semibold text-white',
        gradientClass,
      ]"
    >
      {{ initials }}
    </div>
  </div>
</template>
