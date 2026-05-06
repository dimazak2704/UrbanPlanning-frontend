<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import Pagination from '@/components/tables/Pagination.vue'
import SortSelect from '@/components/tables/SortSelect.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { getDistricts } from '@/api/districts.api'
import { getCities } from '@/api/cities.api'
import { useFilters } from '@/composables/useFilters'
import { usePagination } from '@/composables/usePagination'
import { getDistrictTypeColor } from '@/utils/enum-labels'
import { DISTRICT_TYPE_VALUES, type DistrictType } from '@/types/enums'
import type { District, DistrictFilters } from '@/types/district'

const { t } = useI18n()
const defaultFilters: DistrictFilters = { name: '', cityId: undefined, type: undefined }
const { filters, debouncedFilters, clearFilters, hasActiveFilters } = useFilters(defaultFilters)
const pagination = usePagination({ defaultSize: 12 })
const sort = ref('name,asc')
const items = ref<District[]>([])
const cityOptions = ref<{ value: number; label: string }[]>([])
const typeOptions = computed(() =>
  DISTRICT_TYPE_VALUES.map((value) => ({ value, label: t(`enums.districtType.${value}`) })),
)
const sortOptions = computed(() => [
  { value: 'name,asc', label: t('cities.sortNameAsc') },
  { value: 'name,desc', label: t('cities.sortNameDesc') },
  { value: 'population,desc', label: t('cities.sortPopDesc') },
  { value: 'population,asc', label: t('cities.sortPopAsc') },
])

async function fetchItems() {
  pagination.loading.value = true
  try {
    const { data } = await getDistricts(debouncedFilters.value, { page: pagination.page.value, size: pagination.size.value, sort: sort.value })
    items.value = data.content
    pagination.updateFromResponse(data)
  } finally {
    pagination.loading.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await getCities(undefined, { size: 100 })
    cityOptions.value = data.content.map((city) => ({ value: city.id, label: city.name }))
  } catch {
    cityOptions.value = []
  }
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
        <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">— 03 DISTRICTS</p>
        <h1 class="mt-2 text-4xl font-serif font-medium tracking-tight">{{ t('districts.title') }}</h1>
      </div>
      <div class="w-48"><SortSelect v-model="sort" :options="sortOptions" /></div>
    </div>

    <div class="mb-8">
      <FilterPanel :has-active-filters="hasActiveFilters" @clear="clearFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BaseInput v-model="filters.name" :placeholder="t('cities.searchByName')" />
          <BaseSelect v-model="filters.cityId" :options="cityOptions" :placeholder="t('projects.allCities')" />
          <BaseSelect v-model="filters.type as DistrictType | null" :options="typeOptions" :placeholder="t('common.all')" />
        </div>
      </FilterPanel>
    </div>

    <div v-if="pagination.loading.value" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>
    <EmptyState v-else-if="items.length === 0" :title="t('cities.notFound')" />
    <div v-else class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink v-for="district in items" :key="district.id" :to="`/districts/${district.id}`" class="card-unified">
        <div class="mb-3 flex items-start justify-between gap-3">
          <h3 class="font-serif text-xl font-medium text-ink dark:text-paper">{{ district.name }}</h3>
          <BaseBadge :custom-class="getDistrictTypeColor(district.type)">{{ t(`enums.districtType.${district.type}`) }}</BaseBadge>
        </div>
        <p class="text-sm text-ink-muted dark:text-paper/70">{{ district.cityName }}</p>
      </RouterLink>
    </div>
    <div v-if="!pagination.loading.value && items.length > 0" class="mt-8">
      <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value" :total-elements="pagination.totalElements.value" :page-size="pagination.size.value" @update:page="pagination.setPage" @update:size="pagination.setSize" />
    </div>
  </div>
</template>
