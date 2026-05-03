<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { ChevronRightIcon, BriefcaseIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/vue/24/outline'
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

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
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
  catch (err) { toast.error(err instanceof Error ? err.message : 'Помилка'); router.push('/architects') }
  finally { loading.value = false }
}

async function fetchProjects() {
  try {
    const { data } = await getProjects({ architectId: archId.value }, { page: projPage.value, size: 6 })
    projects.value = data.content; projTotalPages.value = data.totalPages; projTotalElements.value = data.totalElements
  } catch { /* ignore */ }
}

import { watch } from 'vue'
watch(() => projPage.value, fetchProjects)
onMounted(async () => { await fetchArchitect(); fetchProjects() })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <LoadingSpinner v-if="loading" size="lg" />
    <template v-else-if="architect">
      <div class="sticky top-16 z-40 -mx-4 px-4 py-3 bg-slate-50/90 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-slate-200">
        <nav class="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
          <RouterLink to="/" class="hover:text-slate-700">Головна</RouterLink>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <RouterLink to="/architects" class="hover:text-slate-700">Архітектори</RouterLink>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <span class="text-slate-900 font-medium">{{ architect.fullName }}</span>
        </nav>
      </div>

      <!-- Profile -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 mb-8">
        <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <AvatarImg :src="architect.avatarUrl" :name="architect.fullName" size="xl" />
          <div class="text-center sm:text-left flex-1">
            <h1 class="text-3xl font-bold text-slate-900">{{ architect.fullName }}</h1>
            <p class="mt-1 text-lg text-slate-500">{{ architect.specialization }}</p>
            <div class="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <BriefcaseIcon class="h-4 w-4 text-slate-400" /> {{ architect.experienceYears }} років досвіду
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <EnvelopeIcon class="h-4 w-4 text-slate-400" /> {{ architect.email }}
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <CalendarIcon class="h-4 w-4 text-slate-400" /> З {{ formatDate(architect.createdAt) }}
              </div>
            </div>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-600">{{ architect.projectsCount }}</p>
            <p class="text-sm text-slate-500">проєктів</p>
          </div>
        </div>
      </div>

      <!-- Projects -->
      <div>
        <h2 class="text-xl font-semibold text-slate-900 mb-4">Проєкти ({{ projTotalElements }})</h2>
        <EmptyState v-if="projects.length === 0" title="Проєктів не знайдено" />
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
