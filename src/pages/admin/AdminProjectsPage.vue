<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhPencilSimple, PhPlus, PhTrash } from '@phosphor-icons/vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import Pagination from '@/components/tables/Pagination.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SortSelect from '@/components/tables/SortSelect.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { getProjects, deleteProject } from '@/api/projects.api'
import { getCities } from '@/api/cities.api'
import { getArchitects } from '@/api/architects.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import { formatCurrency, formatDate } from '@/utils/format'
import { PROJECT_STATUS_LABELS, getProjectStatusColor } from '@/utils/enum-labels'
import { PROJECT_STATUS_VALUES, type ProjectStatus } from '@/types/enums'
import type { Project, ProjectFilters } from '@/types/project'

const { t } = useI18n()
const toast = useToastStore()
const loading = ref(true)
const projects = ref<Project[]>([])
const sort = ref('updatedAt,desc')
const pagination = usePagination({ defaultSize: 10 })
const filters = ref<{ name: string; cityId: number | null; architectId: number | null; status: ProjectStatus | null }>({
  name: '',
  cityId: null,
  architectId: null,
  status: null,
})
const debouncedFilters = useDebounce(filters, 500)

const cityOptions = ref<{ value: number; label: string }[]>([])
const architectOptions = ref<{ value: number; label: string }[]>([])
const statusOptions = computed(() =>
  PROJECT_STATUS_VALUES.map((value) => ({ value, label: PROJECT_STATUS_LABELS[value] })),
)
const sortOptions = computed(() => [
  { value: 'updatedAt,desc', label: t('projects.sortNewest') },
  { value: 'updatedAt,asc', label: t('projects.sortOldest') },
  { value: 'name,asc', label: t('cities.sortNameAsc') },
  { value: 'name,desc', label: t('cities.sortNameDesc') },
  { value: 'budget,desc', label: t('projects.sortBudgetDesc') },
  { value: 'budget,asc', label: t('projects.sortBudgetAsc') },
])

const projectToDelete = ref<Project | null>(null)

function resetFilters() {
  filters.value = { name: '', cityId: null, architectId: null, status: null }
}

async function fetchProjects() {
  loading.value = true
  try {
    const f = debouncedFilters.value
    const payload: ProjectFilters = {
      name: f.name || undefined,
      cityId: f.cityId ?? undefined,
      architectId: f.architectId ?? undefined,
      status: f.status ?? undefined,
    }
    const { data } = await getProjects(payload, {
      page: pagination.page.value,
      size: pagination.size.value,
      sort: sort.value,
    })
    projects.value = data.content
    pagination.updateFromResponse(data)
  } catch {
    toast.error(t('projects.loadError'))
  } finally {
    loading.value = false
  }
}

async function loadLookups() {
  const [citiesRes, architectsRes] = await Promise.allSettled([
    getCities(undefined, { size: 200 }),
    getArchitects(undefined, { size: 200, sort: 'lastName,asc' }),
  ])
  if (citiesRes.status === 'fulfilled') {
    cityOptions.value = citiesRes.value.data.content.map((x) => ({ value: x.id, label: x.name }))
  }
  if (architectsRes.status === 'fulfilled') {
    architectOptions.value = architectsRes.value.data.content.map((x) => ({ value: x.id, label: x.fullName }))
  }
}

async function confirmDelete() {
  if (!projectToDelete.value) return
  try {
    await deleteProject(projectToDelete.value.id)
    toast.success(t('projects.deleteSuccess'))
    if (projects.value.length === 1 && pagination.page.value > 0) pagination.page.value--
    else fetchProjects()
  } catch {
    toast.error(t('projects.deleteError'))
  } finally {
    projectToDelete.value = null
  }
}

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchProjects() }, { deep: true })
watch(() => pagination.page.value, fetchProjects)
watch(() => pagination.size.value, fetchProjects)

onMounted(async () => {
  await loadLookups()
  await fetchProjects()
})
</script>

<template>
  <div class="min-h-[calc(100vh-260px)] space-y-8 pb-10">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('admin.projectsManagement') }}</h1>
      <div class="flex items-center gap-3">
        <div class="w-52"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <RouterLink to="/projects/new">
          <BaseButton><template #iconLeft><PhPlus :size="14" weight="light" /></template>{{ t('projects.createProject') }}</BaseButton>
        </RouterLink>
      </div>
    </div>

    <FilterPanel :has-active-filters="Boolean(filters.name || filters.cityId || filters.architectId || filters.status)" @clear="resetFilters">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BaseInput v-model="filters.name" :placeholder="t('projects.searchByName')" />
        <BaseSelect v-model="filters.cityId" :options="cityOptions" :placeholder="t('projects.allCities')" />
        <BaseSelect v-model="filters.architectId" :options="architectOptions" :placeholder="t('projects.form.architect')" />
        <BaseSelect v-model="filters.status" :options="statusOptions" :placeholder="t('projects.allStatuses')" />
      </div>
    </FilterPanel>

    <div class="card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="border-b border-ink/10 bg-paper-warm dark:border-night-border dark:bg-night-elevated">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('projects.form.name') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('cities.cityName') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('projects.form.architect') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('projects.form.status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('projects.form.budget') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('common.updatedAt') }}</th>
              <th class="px-6 py-3" />
            </tr>
          </thead>
          <tbody class="bg-paper-pure dark:bg-night-soft">
            <tr v-if="loading">
              <td colspan="8" class="px-6 py-12 text-center"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="projects.length === 0">
              <td colspan="8" class="px-6 py-12 text-center">
                <EmptyState :title="t('projects.notFound')" />
              </td>
            </tr>
            <tr v-for="project in projects" :key="project.id" class="border-b border-ink/10 transition-colors hover:bg-paper-warm dark:border-night-border dark:hover:bg-night-elevated">
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ project.id }}</td>
              <td class="px-6 py-4 text-sm font-medium text-ink dark:text-paper">
                <RouterLink :to="`/projects/${project.id}`" class="hover:text-accent">{{ project.name }}</RouterLink>
              </td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ project.cityName }} / {{ project.districtName }}</td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ project.architectFullName }}</td>
              <td class="px-6 py-4"><BaseBadge :custom-class="getProjectStatusColor(project.status)">{{ t(`enums.projectStatus.${project.status}`) }}</BaseBadge></td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ formatCurrency(project.budget) }}</td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ formatDate(project.updatedAt) }}</td>
              <td class="px-6 py-4 text-right">
                <RouterLink :to="`/projects/${project.id}/edit`" class="mr-3 inline-flex text-ink-muted hover:text-accent dark:text-paper/65"><PhPencilSimple :size="18" weight="light" /></RouterLink>
                <button class="inline-flex text-status-suspended" @click="projectToDelete = project"><PhTrash :size="18" weight="light" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && projects.length > 0" class="border-t border-ink/10 bg-paper-warm px-6 py-4 dark:border-night-border dark:bg-night-elevated">
        <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value" :total-elements="pagination.totalElements.value" :page-size="pagination.size.value" @update:page="pagination.setPage" @update:size="pagination.setSize" />
      </div>
    </div>

    <ConfirmDialog :model-value="projectToDelete !== null" :title="t('projects.deleteConfirmTitle')" :message="t('projects.deleteConfirmDesc')" @update:model-value="(val: boolean) => { if (!val) projectToDelete = null }" @confirm="confirmDelete" @cancel="projectToDelete = null" />
  </div>
</template>
