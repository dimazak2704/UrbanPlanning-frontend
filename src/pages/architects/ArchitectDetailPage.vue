<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhBriefcase, PhCalendar, PhCaretRight, PhEnvelopeSimple } from '@phosphor-icons/vue'
import AvatarImg from '@/components/common/AvatarImg.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import Pagination from '@/components/tables/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getArchitectById } from '@/api/architects.api'
import { getProjects } from '@/api/projects.api'
import { useToastStore } from '@/stores/toast.store'
import { formatDate } from '@/utils/format'
import type { Architect } from '@/types/architect'
import type { Project } from '@/types/project'
import { getApiErrorMessage } from '@/utils/api-error'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const { t } = useI18n()
const archId = computed(() => Number(route.params.id))
const loading = ref(true)
const architect = ref<Architect | null>(null)
const projects = ref<Project[]>([])
const projPage = ref(0)
const projTotalPages = ref(0)
const projTotalElements = ref(0)

async function fetchArchitect() {
  loading.value = true
  try { const { data } = await getArchitectById(archId.value); architect.value = data }
  catch (err) { toast.error(getApiErrorMessage(err, t('architects.loadError'))); router.push('/architects') }
  finally { loading.value = false }
}

async function fetchProjects() {
  try {
    const { data } = await getProjects({ architectId: archId.value }, { page: projPage.value, size: 6 })
    projects.value = data.content; projTotalPages.value = data.totalPages; projTotalElements.value = data.totalElements
  } catch { /* ignore */ }
}

watch(() => projPage.value, fetchProjects)
onMounted(async () => { await fetchArchitect(); fetchProjects() })
</script>

<template>
  <div class="container-app min-h-[calc(100vh-220px)] py-10">
    <LoadingSpinner v-if="loading" size="lg" />
    <template v-else-if="architect">
      <div class="sticky top-16 z-40 -mx-4 mb-6 border-b border-ink/10 bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-night-border dark:bg-night-soft/90">
        <nav class="flex items-center gap-1.5 text-sm text-ink-muted dark:text-paper/65 flex-wrap">
          <RouterLink to="/" class="hover:text-ink dark:hover:text-paper">{{ t('header.home') }}</RouterLink>
          <PhCaretRight :size="12" weight="light" />
          <RouterLink to="/architects" class="hover:text-ink dark:hover:text-paper">{{ t('header.architects') }}</RouterLink>
          <PhCaretRight :size="12" weight="light" />
          <span class="font-medium text-ink dark:text-paper">{{ architect.fullName }}</span>
        </nav>
      </div>

      <!-- Profile -->
      <div class="mb-8 rounded-xl border border-ink/15 bg-paper-pure p-6 sm:p-8 dark:border-night-border dark:bg-night-soft">
        <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <AvatarImg :src="architect.avatarUrl" :name="architect.fullName" size="xl" />
          <div class="text-center sm:text-left flex-1">
            <h1 class="text-3xl font-bold text-ink dark:text-paper">{{ architect.fullName }}</h1>
            <p class="mt-1 text-lg text-ink-muted dark:text-paper/65">{{ architect.specialization }}</p>
            <div class="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
              <div class="flex items-center gap-2 text-sm text-ink-muted dark:text-paper/70">
                <PhBriefcase :size="14" weight="light" class="text-ink-subtle dark:text-paper/45" /> {{ architect.experienceYears }} {{ t('common.years') }}
              </div>
              <div class="flex items-center gap-2 text-sm text-ink-muted dark:text-paper/70">
                <PhEnvelopeSimple :size="14" weight="light" class="text-ink-subtle dark:text-paper/45" /> {{ architect.email }}
              </div>
              <div class="flex items-center gap-2 text-sm text-ink-muted dark:text-paper/70">
                <PhCalendar :size="14" weight="light" class="text-ink-subtle dark:text-paper/45" /> {{ t('common.from') }} {{ formatDate(architect.createdAt) }}
              </div>
            </div>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-600">{{ architect.projectsCount }}</p>
            <p class="text-sm text-ink-muted dark:text-paper/65">{{ t('architects.projectsCount') }}</p>
          </div>
        </div>
      </div>

      <!-- Projects -->
      <div>
        <h2 class="mb-4 text-xl font-semibold text-ink dark:text-paper">{{ t('architects.projects', { count: projTotalElements }) }}</h2>
        <EmptyState v-if="projects.length === 0" :title="t('projects.notFound')" />
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
        </div>
        <div v-if="projects.length > 0" class="mt-6">
          <Pagination :current-page="projPage" :total-pages="projTotalPages" :total-elements="projTotalElements" :page-size="6" @update:page="projPage = $event" />
        </div>
      </div>
    </template>
  </div>
</template>
