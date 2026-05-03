<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
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
import { PROJECT_STATUS_LABELS } from '@/utils/enum-labels'
import type { Project, ProjectFilters } from '@/types/project'

const router = useRouter()
const toast = useToastStore()

const loading = ref(true)
const projects = ref<Project[]>([])
const statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))

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
    toast.error('Не вдалося завантажити проєкти')
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
    toast.success('Проєкт успішно видалено')
    if (projects.value.length === 1 && page.value > 0) page.value--
    else fetchProjects()
  } catch (err) {
    toast.error('Помилка видалення')
  } finally {
    projectToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">Мої проєкти</h1>
      <BaseButton @click="router.push('/projects/new')"><template #iconLeft><PlusIcon class="h-4 w-4" /></template>Новий проєкт</BaseButton>
    </div>

    <FilterPanel @reset="filters = { name: '', status: undefined, startDateFrom: '', startDateTo: '' }">
      <BaseInput v-model="filters.name" placeholder="Пошук за назвою..." />
      <BaseSelect v-model="filters.status" :options="statusOptions" placeholder="Всі статуси" />
      <div class="flex gap-2">
        <BaseInput v-model="filters.startDateFrom" type="date" placeholder="З дати" />
        <BaseInput v-model="filters.startDateTo" type="date" placeholder="По дату" />
      </div>
    </FilterPanel>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>
    <div v-else-if="projects.length === 0">
      <EmptyState title="Проєктів не знайдено" description="Спробуйте змінити фільтри або створіть новий проєкт." />
    </div>
    <div v-else>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <ProjectCard v-for="p in projects" :key="p.id" :project="p" showActions @edit="onEdit" @delete="askDelete" />
      </div>
      <Pagination :current-page="page" :total-pages="totalPages" @update:page="updatePage" />
    </div>

    <ConfirmDialog
      v-model="projectToDelete !== null"
      title="Видалення проєкту"
      :message="`Ви впевнені, що хочете видалити проєкт &quot;${projectToDelete?.name}&quot;? Цю дію неможливо скасувати.`"
      confirm-label="Видалити"
      @confirm="confirmDelete"
      @cancel="projectToDelete = null"
    />
  </div>
</template>
