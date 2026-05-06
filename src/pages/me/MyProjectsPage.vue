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
import { PlusIcon } from '@heroicons/vue/24/outline'

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

const { page, totalPages, totalElements, updatePage, setTotal } = usePagination(0)
const debouncedFilters = useDebounce(filters.value, 500)

const projectToDelete = ref<Project | null>(null)

async function fetchProjects() {
  loading.value = true
  try {
    const { data } = await getMyProjects(debouncedFilters.value, { page: page.value, size: 9, sort: 'updatedAt,desc' })
    projects.value = data.content
    setTotal(data.totalElements, data.totalPages)
  } catch (err) {
    toast.error(t('projects.loadError'))
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters, page], fetchProjects)

function onFilterChange() {
  page.value = 0
}

watch(filters, onFilterChange, { deep: true })

onMounted(() => {
  fetchProjects()
})

function onEdit(project: Project) {
  router.push(`/projects/${project.id}/edit`)
}

function askDelete(project: Project) {
  projectToDelete.value = project
}

async function confirmDelete() {
  if (!projectToDelete.value) return
  try {
    await deleteProject(projectToDelete.value.id)
    toast.success(t('projects.deleteSuccess'))
    if (projects.value.length === 1 && page.value > 0) page.value--
    else fetchProjects()
  } catch (err) {
    toast.error(t('projects.deleteError'))
  } finally {
    projectToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('me.myProjects') }}</h1>
      <BaseButton @click="router.push('/projects/new')"><template #iconLeft><PlusIcon class="h-4 w-4" /></template>{{ t('projects.newProject') }}</BaseButton>
    </div>

    <FilterPanel @reset="filters = { name: '', status: undefined, startDateFrom: '', startDateTo: '' }">
      <BaseInput v-model="filters.name" :placeholder="t('projects.searchByName')" />
      <BaseSelect v-model="filters.status" :options="statusOptions" :placeholder="t('common.all')" />
      <div class="flex gap-2">
        <BaseInput v-model="filters.startDateFrom" type="date" :placeholder="t('common.from')" />
        <BaseInput v-model="filters.startDateTo" type="date" :placeholder="t('common.to')" />
      </div>
    </FilterPanel>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>
    <div v-else-if="projects.length === 0">
      <EmptyState :title="t('projects.notFound')" :description="t('projects.notFoundDescription')" />
    </div>
    <div v-else>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <ProjectCard v-for="p in projects" :key="p.id" :project="p" showActions @edit="onEdit" @delete="askDelete" />
      </div>
      <Pagination :current-page="page" :total-pages="totalPages" :total-elements="totalElements" :page-size="9" @update:page="updatePage" />
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
