<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'

import BaseInput from '@/components/common/BaseInput.vue'
import CityCard from '@/components/cards/CityCard.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import Pagination from '@/components/tables/Pagination.vue'
import SortSelect from '@/components/tables/SortSelect.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

import { getCities } from '@/api/cities.api'
import { usePagination } from '@/composables/usePagination'
import { useFilters } from '@/composables/useFilters'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import type { City } from '@/types/city'
import type { CityFilters } from '@/types/city'

const auth = useAuthStore()
const toast = useToastStore()

const defaultFilters: CityFilters = {
  name: '',
  region: '',
  minPopulation: undefined,
  maxPopulation: undefined,
}

const { filters, debouncedFilters, clearFilters, hasActiveFilters } = useFilters(defaultFilters)
const pagination = usePagination({ defaultSize: 12 })

const sort = ref('name,asc')
const cities = ref<City[]>([])

const sortOptions = [
  { value: 'name,asc', label: 'Назва А → Я' },
  { value: 'name,desc', label: 'Назва Я → А' },
  { value: 'population,desc', label: 'Населення ↓' },
  { value: 'population,asc', label: 'Населення ↑' },
  { value: 'area,desc', label: 'Площа ↓' },
  { value: 'area,asc', label: 'Площа ↑' },
]

async function fetchCities() {
  pagination.loading.value = true
  try {
    const { data } = await getCities(debouncedFilters.value, {
      page: pagination.page.value,
      size: pagination.size.value,
      sort: sort.value,
    })
    cities.value = data.content
    pagination.updateFromResponse(data)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Помилка завантаження міст')
  } finally {
    pagination.loading.value = false
  }
}

watch([debouncedFilters, sort], () => {
  pagination.page.value = 0
  fetchCities()
}, { deep: true })

watch(() => pagination.page.value, fetchCities)
watch(() => pagination.size.value, fetchCities)

onMounted(fetchCities)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Міста України</h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ pagination.totalElements.value }} міст у базі
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-48">
          <SortSelect v-model="sort" :options="sortOptions" />
        </div>
        <RouterLink
          v-if="auth.isAdmin"
          to="/admin/cities?action=new"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700"
        >
          <PlusIcon class="h-4 w-4" />
          Додати місто
        </RouterLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6">
      <FilterPanel :has-active-filters="hasActiveFilters" @clear="clearFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BaseInput
            v-model="filters.name"
            label="Назва міста"
            placeholder="Пошук за назвою..."
          />
          <BaseInput
            v-model="filters.region"
            label="Регіон"
            placeholder="Київська область..."
          />
          <BaseInput
            v-model="filters.minPopulation"
            label="Населення від"
            type="number"
            placeholder="0"
          />
          <BaseInput
            v-model="filters.maxPopulation"
            label="Населення до"
            type="number"
            placeholder="10 000 000"
          />
        </div>
      </FilterPanel>
    </div>

    <!-- Loading -->
    <div v-if="pagination.loading.value" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="cities.length === 0"
      title="Міст не знайдено"
      description="Спробуйте змінити параметри пошуку або фільтри"
    />

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <CityCard v-for="city in cities" :key="city.id" :city="city" />
    </div>

    <!-- Pagination -->
    <div v-if="!pagination.loading.value && cities.length > 0" class="mt-8">
      <Pagination
        :current-page="pagination.page.value"
        :total-pages="pagination.totalPages.value"
        :total-elements="pagination.totalElements.value"
        :page-size="pagination.size.value"
        @update:page="pagination.setPage"
        @update:size="pagination.setSize"
      />
    </div>
  </div>
</template>
