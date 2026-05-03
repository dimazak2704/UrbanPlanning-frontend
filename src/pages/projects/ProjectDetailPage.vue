<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { ChevronRightIcon, PencilSquareIcon, TrashIcon, MapPinIcon, CalendarIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/vue/24/outline'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue'
import InfrastructureCard from '@/components/cards/InfrastructureCard.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getProjectById, deleteProject } from '@/api/projects.api'
import { getInfrastructures } from '@/api/infrastructures.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatCurrency, formatDate } from '@/utils/format'
import { getProjectStatusLabel, getProjectStatusColor } from '@/utils/enum-labels'
import type { Project } from '@/types/project'
import type { Infrastructure } from '@/types/infrastructure'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const projectId = computed(() => Number(route.params.id))
const loading = ref(true)
const project = ref<Project | null>(null)
const infras = ref<Infrastructure[]>([])
const showDeleteModal = ref(false)
const canEdit = computed(() => {
  if (!auth.user || !project.value) return false
  return auth.isAdmin || auth.user.id === project.value.architectId
})

async function fetchProject() {
  loading.value = true
  try {
    const { data } = await getProjectById(projectId.value)
    project.value = data
  } catch (err) { toast.error(err instanceof Error ? err.message : 'Помилка'); router.push('/projects') }
  finally { loading.value = false }
}

async function fetchInfras() {
  try {
    const { data } = await getInfrastructures({ projectId: projectId.value }, { size: 50 })
    infras.value = data.content
  } catch { /* ignore */ }
}

async function handleDelete() {
  try {
    await deleteProject(projectId.value)
    toast.success('Проєкт видалено')
    router.push('/projects')
  } catch (err) { toast.error(err instanceof Error ? err.message : 'Помилка видалення') }
}

onMounted(async () => { await fetchProject(); fetchInfras() })
</script>

<template>
  <div>
    <LoadingSpinner v-if="loading" size="lg" />
    <template v-else-if="project">
      <!-- Hero -->
      <div class="relative h-80 sm:h-96">
        <ImageWithFallback :src="project.imageUrl" :alt="project.name" fallback-class="h-full w-full" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8 mx-auto max-w-7xl">
          <BaseBadge :custom-class="getProjectStatusColor(project.status) + ' text-sm px-3 py-1'">{{ getProjectStatusLabel(project.status) }}</BaseBadge>
          <h1 class="mt-3 text-3xl sm:text-4xl font-bold text-white">{{ project.name }}</h1>
        </div>
      </div>

      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Breadcrumbs -->
        <div class="sticky top-16 z-40 -mx-4 px-4 py-3 bg-slate-50/90 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-slate-200">
          <nav class="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
            <RouterLink to="/" class="hover:text-slate-700">Головна</RouterLink>
            <ChevronRightIcon class="h-3.5 w-3.5" />
            <RouterLink to="/projects" class="hover:text-slate-700">Проєкти</RouterLink>
            <ChevronRightIcon class="h-3.5 w-3.5" />
            <span class="text-slate-900 font-medium">{{ project.name }}</span>
          </nav>
        </div>

        <!-- Actions -->
        <div v-if="canEdit" class="flex gap-2 mb-6">
          <RouterLink :to="`/projects/${project.id}/edit`">
            <BaseButton variant="secondary" size="sm"><template #iconLeft><PencilSquareIcon class="h-4 w-4" /></template>Редагувати</BaseButton>
          </RouterLink>
          <BaseButton variant="danger" size="sm" @click="showDeleteModal = true"><template #iconLeft><TrashIcon class="h-4 w-4" /></template>Видалити</BaseButton>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
          <div class="lg:col-span-2 space-y-6">
            <div v-if="project.description" class="rounded-xl border border-slate-200 bg-white p-6">
              <h2 class="text-lg font-semibold text-slate-900 mb-3">Опис</h2>
              <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ project.description }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><CurrencyDollarIcon class="h-4 w-4" />Бюджет</div>
                <p class="text-lg font-bold text-slate-900">{{ formatCurrency(project.budget) }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><CalendarIcon class="h-4 w-4" />Початок</div>
                <p class="text-lg font-bold text-slate-900">{{ formatDate(project.startDate) }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><CalendarIcon class="h-4 w-4" />Завершення</div>
                <p class="text-lg font-bold text-slate-900">{{ formatDate(project.endDate) }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><MapPinIcon class="h-4 w-4" />Локація</div>
                <RouterLink :to="`/cities/${project.cityId}`" class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ project.cityName }}</RouterLink>
                <span class="text-sm text-slate-500"> / </span>
                <RouterLink :to="`/districts/${project.districtId}`" class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ project.districtName }}</RouterLink>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <RouterLink :to="`/architects/${project.architectId}`" class="block rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2"><UserIcon class="h-4 w-4" />Архітектор</div>
              <p class="text-base font-semibold text-slate-900">{{ project.architectFullName }}</p>
            </RouterLink>
          </div>
        </div>

        <!-- Infrastructure -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-slate-900">Інфраструктура ({{ infras.length }})</h2>
            <RouterLink v-if="canEdit" :to="`/infrastructures/new?projectId=${project.id}`"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-all">
              + Додати
            </RouterLink>
          </div>
          <EmptyState v-if="infras.length === 0" title="Інфраструктури ще немає" />
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfrastructureCard v-for="i in infras" :key="i.id" :infrastructure="i" />
          </div>
        </div>
      </div>

      <!-- Delete modal -->
      <teleport to="body">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Видалити проєкт?</h3>
            <p class="text-sm text-slate-500 mb-6">Цю дію неможливо скасувати. Всі пов'язані дані буде видалено.</p>
            <div class="flex justify-end gap-3">
              <BaseButton variant="secondary" size="sm" @click="showDeleteModal = false">Скасувати</BaseButton>
              <BaseButton variant="danger" size="sm" @click="handleDelete">Видалити</BaseButton>
            </div>
          </div>
        </div>
      </teleport>
    </template>
  </div>
</template>
