<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhCaretDown, PhCaretUp, PhFunnelSimple, PhX } from '@phosphor-icons/vue'

interface Props {
  hasActiveFilters?: boolean
}

withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
})

const emit = defineEmits<{
  (e: 'clear'): void
}>()

const expanded = ref(true)
const { t } = useI18n()

function toggle() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="border border-ink/10 bg-paper-pure dark:border-night-border dark:bg-night-soft">
    <div class="flex items-center justify-between border-b border-ink/10 px-5 py-4 dark:border-night-border">
      <button
        class="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink dark:text-paper/65 dark:hover:text-paper"
        @click="toggle"
      >
        <PhFunnelSimple :size="14" weight="light" />
        {{ t('map.filters') }}
        <span
          v-if="hasActiveFilters"
          class="flex h-1.5 w-1.5 bg-accent"
        />
        <component
          :is="expanded ? PhCaretUp : PhCaretDown"
          :size="14"
          weight="light"
        />
      </button>
      <button
        v-if="hasActiveFilters"
        class="flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-muted transition-colors hover:border-ink hover:text-ink dark:border-paper/30 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper"
        @click="emit('clear')"
      >
        <PhX :size="12" weight="light" />
        {{ t('forms.filterReset') }}
      </button>
    </div>
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="expanded" class="p-5">
        <slot />
      </div>
    </transition>
  </div>
</template>
