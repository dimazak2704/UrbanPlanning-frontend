<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Project } from '@/types/project'
import { useCompareStore } from '@/stores/compare.store'

interface Props {
  project: Project
}

const props = defineProps<Props>()
const compareStore = useCompareStore()
const { t } = useI18n()

const isSelected = computed(() => compareStore.has(props.project.id))
const isDisabled = computed(() => compareStore.isFull && !isSelected.value)

const buttonLabel = computed(() => (isSelected.value ? t('compare.selected') : t('compare.add')))
const tooltip = computed(() => {
  if (isDisabled.value) return t('compare.tooltipMax')
  return isSelected.value ? t('compare.tooltipRemove') : t('compare.tooltipAdd')
})

function onToggle(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  if (isDisabled.value) return
  compareStore.toggle(props.project)
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    :class="[
      isSelected
        ? 'border-accent bg-accent text-paper'
        : 'border-ink/20 text-ink hover:border-ink dark:border-paper/35 dark:text-paper dark:hover:border-paper',
      isDisabled ? 'cursor-not-allowed opacity-45 hover:border-ink/20 dark:hover:border-paper/35' : '',
    ]"
    :aria-pressed="isSelected"
    :aria-label="tooltip"
    :title="tooltip"
    :disabled="isDisabled"
    @click="onToggle"
    @keydown.enter.prevent="onToggle"
    @keydown.space.prevent="onToggle"
  >
    {{ buttonLabel }}
  </button>
</template>
