<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FunnelIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline'

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
  <div class="rounded-xl border border-slate-200 bg-white">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <button
        class="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
        @click="toggle"
      >
        <FunnelIcon class="h-4 w-4 text-slate-400" />
        {{ t('map.filters') }}
        <span
          v-if="hasActiveFilters"
          class="flex h-2 w-2 rounded-full bg-primary-500"
        />
        <component
          :is="expanded ? ChevronUpIcon : ChevronDownIcon"
          class="h-4 w-4 text-slate-400"
        />
      </button>
      <button
        v-if="hasActiveFilters"
        class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        @click="emit('clear')"
      >
        <XMarkIcon class="h-3.5 w-3.5" />
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
      <div v-if="expanded" class="p-4">
        <slot />
      </div>
    </transition>
  </div>
</template>
