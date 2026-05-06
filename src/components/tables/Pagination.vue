<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

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
    class="flex flex-col items-center justify-between gap-4 sm:flex-row"
  >
    <!-- Info -->
    <div class="text-sm text-slate-500">
      {{ t('common.showingFromTo', { from: showingFrom, to: showingTo, total: totalElements }) }}
    </div>

    <!-- Page buttons -->
    <div class="flex items-center gap-1">
      <button
        :disabled="currentPage === 0"
        class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
        @click="emit('update:page', currentPage - 1)"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>

      <button
        v-for="(page, idx) in visiblePages"
        :key="idx"
        :disabled="page === '...'"
        :class="[
          'min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-primary-600 text-white shadow-sm'
            : page === '...'
              ? 'cursor-default text-slate-400'
              : 'text-slate-600 hover:bg-slate-100',
        ]"
        @click="goToPage(page)"
      >
        {{ page === '...' ? '…' : (page as number) + 1 }}
      </button>

      <button
        :disabled="currentPage >= totalPages - 1"
        class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
        @click="emit('update:page', currentPage + 1)"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>
    </div>

    <!-- Page size -->
    <div class="flex items-center gap-2 text-sm text-slate-500">
      <span>{{ t('common.perPage') }}</span>
      <select
        :value="pageSize"
        class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
