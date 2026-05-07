<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import Pagination from '@/components/tables/Pagination.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import { PhPlus } from '@phosphor-icons/vue'

import { getMyProjects, deleteProject } from '@/api/projects.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import type { Project, ProjectFilters } from '@/types/project'

const router = useRouter()
const toast = useToastStore()
const { t } = useI18n()

const loading = ref(true)
const projects = ref<Project[]>([])
const statusOptions = computed(() => [
  { value: 'PLANNED', label: t('enums.projectStatus.PLANNED') },
  { value: 'APPROVED', label: t('enums.projectStatus.APPROVED') },
  { value: 'UNDER_CONSTRUCTION', label: t('enums.projectStatus.UNDER_CONSTRUCTION') },
  { value: 'COMPLETED', label: t('enums.projectStatus.COMPLETED') },
  { value: 'SUSPENDED', label: t('enums.projectStatus.SUSPENDED') },
])

const filters = ref<ProjectFilters>({
  name: '',
  status: undefined,
  startDateFrom: '',
  startDateTo: '',
})

const pagination = usePagination({ defaultSize: 9 })
const debouncedFilters = useDebounce(filters, 500)

const projectToDelete = ref<Project | null>(null)

async function fetchProjects() {
  loading.value = true
  try {
    const preparedFilters: ProjectFilters = {
      ...debouncedFilters.value,
      startDateFrom: debouncedFilters.value.startDateFrom || undefined,
      startDateTo: debouncedFilters.value.startDateTo || undefined,
      name: debouncedFilters.value.name?.trim() || undefined,
    }
    const { data } = await getMyProjects(preparedFilters, { page: pagination.page.value, size: pagination.size.value, sort: 'updatedAt,desc' })
    projects.value = data.content
    pagination.updateFromResponse(data)
  } catch (err) {
    toast.error(t('projects.loadError'))
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters], () => { pagination.page.value = 0; fetchProjects() }, { deep: true })
watch(() => pagination.page.value, fetchProjects)
watch(() => pagination.size.value, fetchProjects)

function onFilterChange() {
  pagination.page.value = 0
}

watch(filters, onFilterChange, { deep: true })

onMounted(() => {
  fetchProjects()
})

function onEdit(project: Project) {
  router.push(`/projects/${project.id}/edit`)
}

function onAddInfrastructure(project: Project) {
  router.push(`/infrastructures/new?projectId=${project.id}`)
}

function askDelete(project: Project) {
  projectToDelete.value = project
}

async function confirmDelete() {
  if (!projectToDelete.value) return
  try {
    await deleteProject(projectToDelete.value.id)
    toast.success(t('projects.deleteSuccess'))
    if (projects.value.length === 1 && pagination.page.value > 0) pagination.page.value--
    else fetchProjects()
  } catch (err) {
    toast.error(t('projects.deleteError'))
  } finally {
    projectToDelete.value = null
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-260px)] space-y-8 pb-10">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('me.myProjects') }}</h1>
      <BaseButton @click="router.push('/projects/new')"><template #iconLeft><PhPlus :size="14" weight="light" /></template>{{ t('projects.newProject') }}</BaseButton>
    </div>

    <FilterPanel
      :has-active-filters="Boolean(filters.name || filters.status || filters.startDateFrom || filters.startDateTo)"
      @clear="filters = { name: '', status: undefined, startDateFrom: '', startDateTo: '' }"
    >
      <BaseInput v-model="filters.name" :placeholder="t('projects.searchByName')" />
      <BaseSelect v-model="filters.status" :options="statusOptions" :placeholder="t('common.all')" />
      <div class="mt-1 flex gap-2">
        <BaseInput v-model="filters.startDateFrom" type="date" :label="t('projects.dateFrom')" />
        <BaseInput v-model="filters.startDateTo" type="date" :label="t('projects.dateTo')" />
      </div>
    </FilterPanel>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>
    <div v-else-if="projects.length === 0">
      <EmptyState :title="t('projects.notFound')" :description="t('projects.notFoundDescription')" />
    </div>
    <div v-else>
      <div class="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="p in projects"
          :key="p.id"
          :project="p"
          show-actions
          show-add-infrastructure-action
          @edit="onEdit"
          @delete="askDelete"
          @add-infrastructure="onAddInfrastructure"
        />
      </div>
      <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value" :total-elements="pagination.totalElements.value" :page-size="pagination.size.value" @update:page="pagination.setPage" @update:size="pagination.setSize" />
    </div>

    <ConfirmDialog
      :model-value="projectToDelete !== null"
      @update:model-value="(val: boolean) => { if (!val) projectToDelete = null }"
      :title="t('projects.deleteConfirmTitle')"
      :message="t('projects.deleteConfirmDesc')"
      :confirm-label="t('common.delete')"
      @confirm="confirmDelete"
      @cancel="projectToDelete = null"
    />
  </div>
</template>
