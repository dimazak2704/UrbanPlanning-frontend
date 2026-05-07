<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { PhCalendar, PhCaretRight, PhCurrencyCircleDollar, PhMapPin, PhPencilSimple, PhTrash, PhUser } from '@phosphor-icons/vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import CompareCheckbox from '@/components/compare/CompareCheckbox.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue'
import InfrastructureCard from '@/components/cards/InfrastructureCard.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getProjectById, deleteProject } from '@/api/projects.api'
import { getInfrastructures } from '@/api/infrastructures.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatCurrency, formatDate } from '@/utils/format'
import { getProjectStatusColor } from '@/utils/enum-labels'
import type { Project } from '@/types/project'
import type { Infrastructure } from '@/types/infrastructure'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()
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
  } catch (err) { toast.error(err instanceof Error ? err.message : t('projects.loadError')); router.push('/projects') }
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
    toast.success(t('projects.deleteSuccess'))
    router.push('/projects')
  } catch (err) { toast.error(err instanceof Error ? err.message : t('projects.deleteError')) }
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
        <div class="container-app absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <BaseBadge :custom-class="getProjectStatusColor(project.status) + ' text-sm px-3 py-1'">{{ t(`enums.projectStatus.${project.status}`) }}</BaseBadge>
          <h1 class="mt-3 text-3xl sm:text-4xl font-bold text-white">{{ project.name }}</h1>
        </div>
      </div>

      <div class="container-app min-h-[calc(100vh-220px)] py-10">
        <!-- Breadcrumbs -->
        <div class="sticky top-16 z-40 -mx-4 mb-6 border-b border-ink/10 bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-night-border dark:bg-night-soft/90">
          <nav class="flex items-center gap-1.5 text-sm text-ink-muted dark:text-paper/65 flex-wrap">
            <RouterLink to="/" class="hover:text-ink dark:hover:text-paper">{{ t('header.home') }}</RouterLink>
            <PhCaretRight :size="12" weight="light" />
            <RouterLink to="/projects" class="hover:text-ink dark:hover:text-paper">{{ t('header.projects') }}</RouterLink>
            <PhCaretRight :size="12" weight="light" />
            <span class="font-medium text-ink dark:text-paper">{{ project.name }}</span>
          </nav>
        </div>

        <!-- Actions -->
        <div class="mb-6 flex flex-wrap gap-2">
          <CompareCheckbox :project="project" />
          <template v-if="canEdit">
          <RouterLink :to="`/projects/${project.id}/edit`">
            <BaseButton variant="secondary" size="sm"><template #iconLeft><PhPencilSimple :size="14" weight="light" /></template>{{ t('common.edit') }}</BaseButton>
          </RouterLink>
          <BaseButton variant="danger" size="sm" @click="showDeleteModal = true"><template #iconLeft><PhTrash :size="14" weight="light" /></template>{{ t('common.delete') }}</BaseButton>
          </template>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
          <div class="lg:col-span-2 space-y-6">
            <div v-if="project.description" class="rounded-xl border border-ink/15 bg-paper-pure p-6 dark:border-night-border dark:bg-night-soft">
              <h2 class="mb-3 text-lg font-semibold text-ink dark:text-paper">{{ t('projects.form.description') }}</h2>
              <p class="whitespace-pre-line text-sm leading-relaxed text-ink-muted dark:text-paper/70">{{ project.description }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div class="rounded-xl border border-ink/15 bg-paper-pure p-4 dark:border-night-border dark:bg-night-soft">
                <div class="mb-1 flex items-center gap-1.5 text-xs text-ink-muted dark:text-paper/65"><PhCurrencyCircleDollar :size="14" weight="light" />{{ t('projects.form.budget') }}</div>
                <p class="text-lg font-bold text-ink dark:text-paper">{{ formatCurrency(project.budget) }}</p>
              </div>
              <div class="rounded-xl border border-ink/15 bg-paper-pure p-4 dark:border-night-border dark:bg-night-soft">
                <div class="mb-1 flex items-center gap-1.5 text-xs text-ink-muted dark:text-paper/65"><PhCalendar :size="14" weight="light" />{{ t('projects.form.startDate') }}</div>
                <p class="text-lg font-bold text-ink dark:text-paper">{{ formatDate(project.startDate) }}</p>
              </div>
              <div class="rounded-xl border border-ink/15 bg-paper-pure p-4 dark:border-night-border dark:bg-night-soft">
                <div class="mb-1 flex items-center gap-1.5 text-xs text-ink-muted dark:text-paper/65"><PhCalendar :size="14" weight="light" />{{ t('projects.form.endDate') }}</div>
                <p class="text-lg font-bold text-ink dark:text-paper">{{ formatDate(project.endDate) }}</p>
              </div>
              <div class="rounded-xl border border-ink/15 bg-paper-pure p-4 dark:border-night-border dark:bg-night-soft">
                <div class="mb-1 flex items-center gap-1.5 text-xs text-ink-muted dark:text-paper/65"><PhMapPin :size="14" weight="light" />{{ t('projects.location') }}</div>
                <RouterLink :to="`/cities/${project.cityId}`" class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ project.cityName }}</RouterLink>
                <span class="text-sm text-ink-muted dark:text-paper/65"> / </span>
                <RouterLink :to="`/districts/${project.districtId}`" class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ project.districtName }}</RouterLink>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <RouterLink :to="`/architects/${project.architectId}`" class="block rounded-xl border border-ink/15 bg-paper-pure p-5 transition-shadow hover:shadow-md dark:border-night-border dark:bg-night-soft dark:hover:shadow-none">
              <div class="mb-2 flex items-center gap-1.5 text-xs text-ink-muted dark:text-paper/65"><PhUser :size="14" weight="light" />{{ t('projects.form.architect') }}</div>
              <p class="text-base font-semibold text-ink dark:text-paper">{{ project.architectFullName }}</p>
            </RouterLink>
          </div>
        </div>

        <!-- Infrastructure -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-ink dark:text-paper">{{ t('projects.infrastructures', { count: infras.length }) }}</h2>
            <RouterLink v-if="canEdit" :to="`/infrastructures/new?projectId=${project.id}`"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-all">
              + {{ t('common.add') }}
            </RouterLink>
          </div>
          <EmptyState v-if="infras.length === 0" :title="t('infrastructures.notFound')" />
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfrastructureCard v-for="i in infras" :key="i.id" :infrastructure="i" />
          </div>
        </div>
      </div>

      <!-- Delete modal -->
      <teleport to="body">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="mx-4 w-full max-w-md rounded-2xl border border-ink/10 bg-paper p-6 shadow-xl dark:border-night-border dark:bg-night-soft">
            <h3 class="mb-2 text-lg font-semibold text-ink dark:text-paper">{{ t('projects.deleteConfirmTitle') }}</h3>
            <p class="mb-6 text-sm text-ink-muted dark:text-paper/65">{{ t('projects.deleteConfirmDesc') }}</p>
            <div class="flex justify-end gap-3">
              <BaseButton variant="secondary" size="sm" @click="showDeleteModal = false">{{ t('common.cancel') }}</BaseButton>
              <BaseButton variant="danger" size="sm" @click="handleDelete">{{ t('common.delete') }}</BaseButton>
            </div>
          </div>
        </div>
      </teleport>
    </template>
  </div>
</template>
