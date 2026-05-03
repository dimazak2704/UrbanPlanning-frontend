<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import Pagination from '@/components/tables/Pagination.vue'
import SortSelect from '@/components/tables/SortSelect.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { getProjects } from '@/api/projects.api'
import { getCities } from '@/api/cities.api'
import { getDistricts } from '@/api/districts.api'
import { getArchitects } from '@/api/architects.api'
import { usePagination } from '@/composables/usePagination'
import { useFilters } from '@/composables/useFilters'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { PROJECT_STATUS_LABELS } from '@/utils/enum-labels'
import type { Project, ProjectFilters } from '@/types/project'

const auth = useAuthStore()
const toast = useToastStore()
const defaultFilters: ProjectFilters = { name: '', cityId: undefined, districtId: undefined, architectId: undefined, status: undefined, minBudget: undefined, maxBudget: undefined, startDateFrom: '', startDateTo: '' }
const { filters, debouncedFilters, clearFilters, hasActiveFilters } = useFilters(defaultFilters)
const pagination = usePagination({ defaultSize: 12 })
const sort = ref('updatedAt,desc')
const projects = ref<Project[]>([])

const cityOptions = ref<{ value: number; label: string }[]>([])
const districtOptions = ref<{ value: number; label: string }[]>([])
const architectOptions = ref<{ value: number; label: string }[]>([])
const statusOptions = computed(() => Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))
const sortOptions = [
  { value: 'updatedAt,desc', label: 'Нові спочатку' },
  { value: 'updatedAt,asc', label: 'Старі спочатку' },
  { value: 'name,asc', label: 'Назва А → Я' },
  { value: 'name,desc', label: 'Назва Я → А' },
  { value: 'budget,desc', label: 'Бюджет ↓' },
  { value: 'budget,asc', label: 'Бюджет ↑' },
  { value: 'startDate,desc', label: 'Дата ↓' },
  { value: 'startDate,asc', label: 'Дата ↑' },
]

async function fetchProjects() {
  pagination.loading.value = true
  try {
    const f: Record<string, unknown> = {}
    const df = debouncedFilters.value
    if (df.name) f.name = df.name
    if (df.cityId) f.cityId = df.cityId
    if (df.districtId) f.districtId = df.districtId
    if (df.architectId) f.architectId = df.architectId
    if (df.status) f.status = df.status
    if (df.minBudget) f.minBudget = df.minBudget
    if (df.maxBudget) f.maxBudget = df.maxBudget
    if (df.startDateFrom) f.startDateFrom = df.startDateFrom
    if (df.startDateTo) f.startDateTo = df.startDateTo
    const { data } = await getProjects(f as ProjectFilters, { page: pagination.page.value, size: pagination.size.value, sort: sort.value })
    projects.value = data.content
    pagination.updateFromResponse(data)
  } catch (err) { toast.error(err instanceof Error ? err.message : 'Помилка') }
  finally { pagination.loading.value = false }
}

async function loadLookups() {
  const [c, a] = await Promise.allSettled([getCities(undefined, { size: 100 }), getArchitects(undefined, { size: 100 })])
  if (c.status === 'fulfilled') cityOptions.value = c.value.data.content.map((x) => ({ value: x.id, label: x.name }))
  if (a.status === 'fulfilled') architectOptions.value = a.value.data.content.map((x) => ({ value: x.id, label: x.fullName }))
}

watch(() => filters.cityId, async (cityId) => {
  filters.districtId = undefined
  districtOptions.value = []
  if (cityId) {
    try {
      const { data } = await getDistricts({ cityId: Number(cityId) }, { size: 100 })
      districtOptions.value = data.content.map((d) => ({ value: d.id, label: d.name }))
    } catch { /* ignore */ }
  }
})

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchProjects() }, { deep: true })
watch(() => pagination.page.value, fetchProjects)
watch(() => pagination.size.value, fetchProjects)
onMounted(() => { loadLookups(); fetchProjects() })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Проєкти</h1>
        <p class="mt-1 text-sm text-slate-500">{{ pagination.totalElements.value }} проєктів</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-48"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <RouterLink v-if="auth.isAuthenticated" to="/projects/new"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-all">
          <PlusIcon class="h-4 w-4" /> Створити проєкт
        </RouterLink>
      </div>
    </div>
    <div class="mb-6">
      <FilterPanel :has-active-filters="hasActiveFilters" @clear="clearFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BaseInput v-model="filters.name" label="Назва" placeholder="Пошук..." />
          <BaseSelect v-model="filters.cityId" :options="cityOptions" label="Місто" placeholder="Усі міста" />
          <BaseSelect v-model="filters.districtId" :options="districtOptions" label="Район" placeholder="Усі райони" :disabled="!filters.cityId" />
          <BaseSelect v-model="filters.status" :options="statusOptions" label="Статус" placeholder="Усі статуси" />
          <BaseSelect v-model="filters.architectId" :options="architectOptions" label="Архітектор" placeholder="Усі" />
          <BaseInput v-model="filters.minBudget" label="Бюджет від" type="number" placeholder="0" />
          <BaseInput v-model="filters.maxBudget" label="Бюджет до" type="number" placeholder="∞" />
          <BaseInput v-model="filters.startDateFrom" label="Дата від" type="date" />
        </div>
      </FilterPanel>
    </div>
    <div v-if="pagination.loading.value" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard v-for="i in 6" :key="i" /></div>
    <EmptyState v-else-if="projects.length === 0" title="Проєктів не знайдено" />
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>
    <div v-if="!pagination.loading.value && projects.length > 0" class="mt-8">
      <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value"
        :total-elements="pagination.totalElements.value" :page-size="pagination.size.value"
        @update:page="pagination.setPage" @update:size="pagination.setSize" />
    </div>
  </div>
</template>
