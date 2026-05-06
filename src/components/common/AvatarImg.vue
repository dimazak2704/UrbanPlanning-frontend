<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhUser } from '@phosphor-icons/vue'
import { resolveMediaUrl } from '@/utils/media-url'

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
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
}

const sizeClass = computed(() => sizeClasses[props.size])

const imgError = ref(false)
const resolvedSrc = computed(() => resolveMediaUrl(props.src))
const showImage = computed(() => !!resolvedSrc.value && !imgError.value)

// Reset error state when src changes
import { watch } from 'vue'
watch(() => props.src, () => { imgError.value = false })

const initials = computed(() => {
  const safeName = props.name.trim()
  if (!safeName) {
    return ''
  }

  const parts = safeName.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return safeName.slice(0, 2).toUpperCase()
})

</script>

<template>
  <div :class="['relative shrink-0 overflow-hidden border border-ink/15 bg-paper-warm dark:border-night-border dark:bg-night-elevated', sizeClass]">
    <img
      v-if="showImage"
      :src="resolvedSrc!"
      :alt="name"
      class="h-full w-full object-cover"
      @error="imgError = true"
    />
    <div
      v-if="!showImage"
      :class="[
        'flex h-full w-full items-center justify-center bg-paper-warm font-mono text-ink-muted dark:bg-night-elevated dark:text-paper/60',
      ]"
    >
      <span v-if="initials">{{ initials }}</span>
      <PhUser v-else :size="16" weight="light" />
    </div>
  </div>
</template>
