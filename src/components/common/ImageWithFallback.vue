<script setup lang="ts">
import { ref, computed } from 'vue'
import { resolveMediaUrl } from '@/utils/media-url'

interface Props {
  src?: string | null
  alt?: string
  fallbackClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: '',
  fallbackClass: '',
})

const hasError = ref(false)
const resolvedSrc = computed(() => resolveMediaUrl(props.src))
const showFallback = computed(() => !resolvedSrc.value || hasError.value)

function onError() {
  hasError.value = true
}
</script>

<template>
  <div class="relative overflow-hidden" :class="fallbackClass">
    <img
      v-if="!showFallback"
      :src="resolvedSrc!"
      :alt="alt"
      class="h-full w-full object-cover"
      @error="onError"
    />
    <div
      v-else
      class="flex h-full w-full items-center justify-center bg-slate-100"
    >
      <svg
        class="h-1/3 w-1/3 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"
        />
      </svg>
    </div>
  </div>
</template>
