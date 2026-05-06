<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import InfrastructureCard from '@/components/cards/InfrastructureCard.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import Pagination from '@/components/tables/Pagination.vue'
import SortSelect from '@/components/tables/SortSelect.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { getInfrastructures } from '@/api/infrastructures.api'
import { getCities } from '@/api/cities.api'
import { usePagination } from '@/composables/usePagination'
import { useFilters } from '@/composables/useFilters'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { INFRASTRUCTURE_TYPE_LABELS, INFRASTRUCTURE_STATUS_LABELS } from '@/utils/enum-labels'
import type { Infrastructure, InfrastructureFilters } from '@/types/infrastructure'

const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()
const defaultFilters: InfrastructureFilters = { name: '', type: undefined, status: undefined, cityId: undefined, projectId: undefined }
const { filters, debouncedFilters, clearFilters, hasActiveFilters } = useFilters(defaultFilters)
const pagination = usePagination({ defaultSize: 12 })
const sort = ref('name,asc')
const items = ref<Infrastructure[]>([])
const cityOptions = ref<{ value: number; label: string }[]>([])
const typeOptions = computed(() => Object.entries(INFRASTRUCTURE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })))
const statusOptions = computed(() => Object.entries(INFRASTRUCTURE_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))
const sortOptions = computed(() => [
  { value: 'name,asc', label: t('cities.sortNameAsc') }, { value: 'name,desc', label: t('cities.sortNameDesc') },
  { value: 'budget,desc', label: t('projects.sortBudgetDesc') }, { value: 'budget,asc', label: t('projects.sortBudgetAsc') },
])

async function fetchItems() {
  pagination.loading.value = true
  try {
    const { data } = await getInfrastructures(debouncedFilters.value, { page: pagination.page.value, size: pagination.size.value, sort: sort.value })
    items.value = data.content
    pagination.updateFromResponse(data)
  } catch (err) { toast.error(err instanceof Error ? err.message : t('infrastructures.loadError')) }
  finally { pagination.loading.value = false }
}

onMounted(async () => {
  try { const { data } = await getCities(undefined, { size: 100 }); cityOptions.value = data.content.map((c) => ({ value: c.id, label: c.name })) } catch { /* ignore */ }
  fetchItems()
})

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchItems() }, { deep: true })
watch(() => pagination.page.value, fetchItems)
watch(() => pagination.size.value, fetchItems)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">{{ t('infrastructures.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ t('infrastructures.totalCount', { count: pagination.totalElements.value }) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-48"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <RouterLink v-if="auth.isAuthenticated" to="/infrastructures/new"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-all">
          <PlusIcon class="h-4 w-4" /> {{ t('infrastructures.addInfrastructure') }}
        </RouterLink>
      </div>
    </div>
    <div class="mb-6">
      <FilterPanel :has-active-filters="hasActiveFilters" @clear="clearFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BaseInput v-model="filters.name" :label="t('infrastructures.form.name')" :placeholder="t('cities.searchByName')" />
          <BaseSelect v-model="filters.type" :options="typeOptions" :label="t('infrastructures.form.type')" :placeholder="t('infrastructures.allTypes')" />
          <BaseSelect v-model="filters.status" :options="statusOptions" :label="t('infrastructures.form.status')" :placeholder="t('projects.allStatuses')" />
          <BaseSelect v-model="filters.cityId" :options="cityOptions" :label="t('cities.cityName')" :placeholder="t('projects.allCities')" />
        </div>
      </FilterPanel>
    </div>
    <div v-if="pagination.loading.value" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard v-for="i in 6" :key="i" /></div>
    <EmptyState v-else-if="items.length === 0" :title="t('infrastructures.notFound')" />
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <InfrastructureCard v-for="item in items" :key="item.id" :infrastructure="item" />
    </div>
    <div v-if="!pagination.loading.value && items.length > 0" class="mt-8">
      <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value"
        :total-elements="pagination.totalElements.value" :page-size="pagination.size.value"
        @update:page="pagination.setPage" @update:size="pagination.setSize" />
    </div>
  </div>
</template>
