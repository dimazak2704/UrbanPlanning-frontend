<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue'

interface Props {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:size', value: number): void
}>()

const pageSizeOptions = [10, 25, 50, 100]

const showingFrom = computed(() =>
  props.totalElements === 0 ? 0 : props.currentPage * props.pageSize + 1,
)
const showingTo = computed(() =>
  Math.min((props.currentPage + 1) * props.pageSize, props.totalElements),
)

const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const maxVisible = 7
  const pages: (number | '...')[] = []

  if (total <= maxVisible) {
    for (let i = 0; i < total; i++) pages.push(i)
    return pages
  }

  pages.push(0)

  if (current > 2) pages.push('...')

  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 3) pages.push('...')

  pages.push(total - 1)

  return pages
})

function goToPage(page: number | '...') {
  if (page === '...') return
  emit('update:page', page)
}
</script>

<template>
  <div
    v-if="totalPages > 0"
    class="flex flex-col items-start justify-between gap-6 border-t border-ink/10 pt-6 sm:flex-row sm:items-center dark:border-night-border"
  >
    <div class="text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">
      {{ t('common.showingFromTo', { from: showingFrom, to: showingTo, total: totalElements }) }}
    </div>

    <div class="flex items-center gap-2">
      <button
        :disabled="currentPage === 0"
        class="border border-ink/20 p-2 text-ink-muted transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40 dark:border-paper/30 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper"
        @click="emit('update:page', currentPage - 1)"
      >
        <PhCaretLeft :size="14" weight="light" />
      </button>

      <button
        v-for="(page, idx) in visiblePages"
        :key="idx"
        :disabled="page === '...'"
        :class="[
          'min-w-[38px] border px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
          page === currentPage
            ? 'border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-night'
            : page === '...'
              ? 'cursor-default border-transparent text-ink-subtle dark:text-paper/45'
              : 'border-ink/20 text-ink-muted hover:border-ink hover:text-ink dark:border-paper/30 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper',
        ]"
        @click="goToPage(page)"
      >
        {{ page === '...' ? '…' : (page as number) + 1 }}
      </button>

      <button
        :disabled="currentPage >= totalPages - 1"
        class="border border-ink/20 p-2 text-ink-muted transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40 dark:border-paper/30 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper"
        @click="emit('update:page', currentPage + 1)"
      >
        <PhCaretRight :size="14" weight="light" />
      </button>
    </div>

    <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">
      <span>{{ t('common.perPage') }}</span>
      <select
        :value="pageSize"
        class="border border-ink/20 bg-transparent px-2 py-1.5 text-xs text-ink focus:border-ink focus:outline-none dark:border-paper/30 dark:text-paper dark:focus:border-paper"
        @change="emit('update:size', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
      <span>{{ t('common.onPage') }}</span>
    </div>
  </div>
</template>
