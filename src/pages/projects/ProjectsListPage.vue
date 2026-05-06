<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhPlus } from '@phosphor-icons/vue'
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
const { t } = useI18n()
const defaultFilters: ProjectFilters = { name: '', cityId: undefined, districtId: undefined, architectId: undefined, status: undefined, minBudget: undefined, maxBudget: undefined, startDateFrom: '', startDateTo: '' }
const { filters, debouncedFilters, clearFilters, hasActiveFilters } = useFilters(defaultFilters)
const pagination = usePagination({ defaultSize: 12 })
const sort = ref('updatedAt,desc')
const projects = ref<Project[]>([])

const cityOptions = ref<{ value: number; label: string }[]>([])
const districtOptions = ref<{ value: number; label: string }[]>([])
const architectOptions = ref<{ value: number; label: string }[]>([])
const statusOptions = computed(() => Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))
const sortOptions = computed(() => [
  { value: 'updatedAt,desc', label: t('projects.sortNewest') },
  { value: 'updatedAt,asc', label: t('projects.sortOldest') },
  { value: 'name,asc', label: t('cities.sortNameAsc') },
  { value: 'name,desc', label: t('cities.sortNameDesc') },
  { value: 'budget,desc', label: t('projects.sortBudgetDesc') },
  { value: 'budget,asc', label: t('projects.sortBudgetAsc') },
  { value: 'startDate,desc', label: t('projects.sortDateDesc') },
  { value: 'startDate,asc', label: t('projects.sortDateAsc') },
])

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
  } catch (err) { toast.error(err instanceof Error ? err.message : t('projects.loadError')) }
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
  <div class="container-app py-12 md:py-16">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">— 04 PROJECTS</p>
        <h1 class="mt-2 text-4xl font-serif font-medium tracking-tight">{{ t('projects.title') }}</h1>
        <p class="mt-2 text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('projects.totalCount', { count: pagination.totalElements.value }) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-48"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <RouterLink v-if="auth.isAuthenticated" to="/projects/new"
          class="inline-flex items-center gap-2 border border-ink bg-ink px-6 py-3 text-xs font-mono uppercase tracking-wider text-paper transition-colors hover:border-accent hover:bg-accent dark:border-paper dark:bg-paper dark:text-night">
          <PhPlus :size="14" weight="light" /> {{ t('projects.createProject') }}
        </RouterLink>
      </div>
    </div>
    <div class="mb-8">
      <FilterPanel :has-active-filters="hasActiveFilters" @clear="clearFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BaseInput v-model="filters.name" :label="t('projects.form.name')" :placeholder="t('cities.searchByName')" />
          <BaseSelect v-model="filters.cityId" :options="cityOptions" :label="t('cities.cityName')" :placeholder="t('projects.allCities')" />
          <BaseSelect v-model="filters.districtId" :options="districtOptions" :label="t('cities.region')" :placeholder="t('projects.allDistricts')" :disabled="!filters.cityId" />
          <BaseSelect v-model="filters.status" :options="statusOptions" :label="t('projects.form.status')" :placeholder="t('projects.allStatuses')" />
          <BaseSelect v-model="filters.architectId" :options="architectOptions" :label="t('projects.form.architect')" :placeholder="t('common.all')" />
          <BaseInput v-model="filters.minBudget" :label="t('projects.budgetFrom')" type="number" min="1" placeholder="1" />
          <BaseInput v-model="filters.maxBudget" :label="t('projects.budgetTo')" type="number" min="1" placeholder="∞" />
          <BaseInput v-model="filters.startDateFrom" :label="t('projects.dateFrom')" type="date" />
          <BaseInput v-model="filters.startDateTo" :label="t('projects.dateTo')" type="date" />
        </div>
      </FilterPanel>
    </div>
    <div v-if="pagination.loading.value" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard v-for="i in 6" :key="i" /></div>
    <EmptyState v-else-if="projects.length === 0" :title="t('projects.notFound')" />
    <div v-else class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>
    <div v-if="!pagination.loading.value && projects.length > 0" class="mt-8">
      <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value"
        :total-elements="pagination.totalElements.value" :page-size="pagination.size.value"
        @update:page="pagination.setPage" @update:size="pagination.setSize" />
    </div>
  </div>
</template>
