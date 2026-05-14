<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhPlus } from '@phosphor-icons/vue'
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
import { INFRASTRUCTURE_STATUS_VALUES, INFRASTRUCTURE_TYPE_VALUES } from '@/types/enums'
import { getApiErrorMessage } from '@/utils/api-error'

const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()
const defaultFilters: InfrastructureFilters = { name: '', type: undefined, status: undefined, cityId: undefined, projectId: undefined }
const { filters, debouncedFilters, clearFilters, hasActiveFilters } = useFilters(defaultFilters)
const pagination = usePagination({ defaultSize: 12 })
const sort = ref('name,asc')
const items = ref<Infrastructure[]>([])
const cityOptions = ref<{ value: number; label: string }[]>([])
const typeOptions = computed(() =>
  INFRASTRUCTURE_TYPE_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_TYPE_LABELS[value] })),
)
const statusOptions = computed(() =>
  INFRASTRUCTURE_STATUS_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_STATUS_LABELS[value] })),
)
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
  } catch (err) { toast.error(getApiErrorMessage(err, t('infrastructures.loadError'))) }
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
  <div class="container-app py-12 md:py-16">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">— 05 INFRASTRUCTURE</p>
        <h1 class="mt-2 text-4xl font-serif font-medium tracking-tight">{{ t('infrastructures.title') }}</h1>
        <p class="mt-2 text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('infrastructures.totalCount', { count: pagination.totalElements.value }) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-48"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <RouterLink v-if="auth.isAuthenticated" to="/infrastructures/new"
          class="inline-flex items-center gap-2 border border-ink bg-ink px-6 py-3 text-xs font-mono uppercase tracking-wider text-paper transition-colors hover:border-accent hover:bg-accent dark:border-paper dark:bg-paper dark:text-night">
          <PhPlus :size="14" weight="light" /> {{ t('infrastructures.addInfrastructure') }}
        </RouterLink>
      </div>
    </div>
    <div class="mb-8">
      <FilterPanel :has-active-filters="hasActiveFilters" @clear="clearFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BaseInput v-model="filters.name" :label="t('infrastructures.form.name')" :placeholder="t('cities.searchByName')" />
          <BaseSelect v-model="filters.type" :options="typeOptions" :label="t('infrastructures.form.type')" :placeholder="t('infrastructures.allTypes')" />
          <BaseSelect v-model="filters.status" :options="statusOptions" :label="t('infrastructures.form.status')" :placeholder="t('projects.allStatuses')" />
          <BaseSelect v-model="filters.cityId" :options="cityOptions" :label="t('cities.cityName')" :placeholder="t('projects.allCities')" />
        </div>
      </FilterPanel>
    </div>
    <div v-if="pagination.loading.value" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard v-for="i in 6" :key="i" /></div>
    <EmptyState v-else-if="items.length === 0" :title="t('infrastructures.notFound')" />
    <div v-else class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <InfrastructureCard v-for="item in items" :key="item.id" :infrastructure="item" />
    </div>
    <div v-if="!pagination.loading.value && items.length > 0" class="mt-8">
      <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value"
        :total-elements="pagination.totalElements.value" :page-size="pagination.size.value"
        @update:page="pagination.setPage" @update:size="pagination.setSize" />
    </div>
  </div>
</template>
