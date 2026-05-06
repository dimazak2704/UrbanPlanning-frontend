<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/common/BaseInput.vue'
import ArchitectCard from '@/components/cards/ArchitectCard.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import Pagination from '@/components/tables/Pagination.vue'
import SortSelect from '@/components/tables/SortSelect.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { getArchitects } from '@/api/architects.api'
import { usePagination } from '@/composables/usePagination'
import { useFilters } from '@/composables/useFilters'
import { useToastStore } from '@/stores/toast.store'
import type { Architect, ArchitectFilters } from '@/types/architect'

const toast = useToastStore()
const { t } = useI18n()
const defaultFilters: ArchitectFilters = { fullName: '', specialization: '', minExperience: undefined, maxExperience: undefined }
const { filters, debouncedFilters, clearFilters, hasActiveFilters } = useFilters(defaultFilters)
const pagination = usePagination({ defaultSize: 12 })
const sort = ref('lastName,asc')
const architects = ref<Architect[]>([])
const sortOptions = computed(() => [
  { value: 'lastName,asc', label: t('architects.sortNameAsc') }, { value: 'lastName,desc', label: t('architects.sortNameDesc') },
  { value: 'experienceYears,desc', label: t('architects.sortExpDesc') }, { value: 'experienceYears,asc', label: t('architects.sortExpAsc') },
])

async function fetchArchitects() {
  pagination.loading.value = true
  try {
    const { data } = await getArchitects(debouncedFilters.value, { page: pagination.page.value, size: pagination.size.value, sort: sort.value })
    architects.value = data.content
    pagination.updateFromResponse(data)
  } catch (err) { toast.error(err instanceof Error ? err.message : t('architects.loadError')) }
  finally { pagination.loading.value = false }
}

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchArchitects() }, { deep: true })
watch(() => pagination.page.value, fetchArchitects)
watch(() => pagination.size.value, fetchArchitects)
onMounted(fetchArchitects)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">{{ t('architects.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ t('architects.totalCount', { count: pagination.totalElements.value }) }}</p>
      </div>
      <div class="w-48"><SortSelect v-model="sort" :options="sortOptions" /></div>
    </div>
    <div class="mb-6">
      <FilterPanel :has-active-filters="hasActiveFilters" @clear="clearFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BaseInput v-model="filters.fullName" :label="t('architects.form.name')" :placeholder="t('architects.searchByName')" />
          <BaseInput v-model="filters.specialization" :label="t('architects.form.specialization')" :placeholder="t('cities.searchByName')" />
          <BaseInput v-model="filters.minExperience" :label="t('architects.expFrom')" type="number" placeholder="0" />
          <BaseInput v-model="filters.maxExperience" :label="t('architects.expTo')" type="number" placeholder="50" />
        </div>
      </FilterPanel>
    </div>
    <div v-if="pagination.loading.value" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard v-for="i in 6" :key="i" /></div>
    <EmptyState v-else-if="architects.length === 0" :title="t('architects.notFound')" />
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ArchitectCard v-for="a in architects" :key="a.id" :architect="a" />
    </div>
    <div v-if="!pagination.loading.value && architects.length > 0" class="mt-8">
      <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value"
        :total-elements="pagination.totalElements.value" :page-size="pagination.size.value"
        @update:page="pagination.setPage" @update:size="pagination.setSize" />
    </div>
  </div>
</template>
