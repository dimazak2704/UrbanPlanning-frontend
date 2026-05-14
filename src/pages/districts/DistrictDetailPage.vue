<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhArrowsOut, PhCaretRight, PhFolder, PhUsers } from '@phosphor-icons/vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import BaseBadge from '@/components/common/BaseBadge.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import Pagination from '@/components/tables/Pagination.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

import { getDistrictById } from '@/api/districts.api'
import { getProjects } from '@/api/projects.api'
import { useToastStore } from '@/stores/toast.store'
import { formatNumber } from '@/utils/format'
import { getDistrictTypeColor } from '@/utils/enum-labels'

import type { District } from '@/types/district'
import type { Project } from '@/types/project'
import { getApiErrorMessage } from '@/utils/api-error'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const { t } = useI18n()

const districtId = computed(() => Number(route.params.id))
const loading = ref(true)
const district = ref<District | null>(null)
const projects = ref<Project[]>([])
const projectsPage = ref(0)
const projectsTotalPages = ref(0)
const projectsTotalElements = ref(0)

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null

async function fetchDistrict() {
  loading.value = true
  try {
    const { data } = await getDistrictById(districtId.value)
    district.value = data
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('districts.loadError')))
    router.push('/cities')
  } finally {
    loading.value = false
  }
}

async function fetchProjects() {
  try {
    const { data } = await getProjects(
      { districtId: districtId.value } as never,
      { page: projectsPage.value, size: 6 },
    )
    projects.value = data.content
    projectsTotalPages.value = data.totalPages
    projectsTotalElements.value = data.totalElements
  } catch { /* ignore */ }
}

function initMap() {
  if (!mapContainer.value || !district.value) return
  if (map) { map.remove(); map = null }

  map = L.map(mapContainer.value).setView([district.value.latitude, district.value.longitude], 13)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap © CARTO',
  }).addTo(map)

  L.marker([district.value.latitude, district.value.longitude])
    .addTo(map)
    .bindPopup(`<b>${district.value.name}</b><br>${t(`enums.districtType.${district.value.type}`)}`)
}

watch(() => projectsPage.value, fetchProjects)

onMounted(async () => {
  await fetchDistrict()
  await fetchProjects()
  setTimeout(initMap, 100)
})
</script>

<template>
  <div class="container-app min-h-[calc(100vh-220px)] py-10">
    <LoadingSpinner v-if="loading" size="lg" />

    <template v-else-if="district">
      <!-- Breadcrumbs -->
      <div class="sticky top-16 z-40 -mx-4 mb-6 border-b border-ink/10 bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-night-border dark:bg-night-soft/90">
        <nav class="flex items-center gap-1.5 text-sm text-ink-muted dark:text-paper/65 flex-wrap">
          <RouterLink to="/" class="transition-colors hover:text-ink dark:hover:text-paper">{{ t('header.home') }}</RouterLink>
          <PhCaretRight :size="12" weight="light" />
          <RouterLink to="/cities" class="transition-colors hover:text-ink dark:hover:text-paper">{{ t('header.cities') }}</RouterLink>
          <PhCaretRight :size="12" weight="light" />
          <RouterLink :to="`/cities/${district.cityId}`" class="transition-colors hover:text-ink dark:hover:text-paper">
            {{ district.cityName }}
          </RouterLink>
          <PhCaretRight :size="12" weight="light" />
          <span class="font-medium text-ink dark:text-paper">{{ district.name }}</span>
        </nav>
      </div>

      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-4xl font-bold text-ink dark:text-paper">{{ district.name }}</h1>
            <BaseBadge :custom-class="getDistrictTypeColor(district.type)">
              {{ t(`enums.districtType.${district.type}`) }}
            </BaseBadge>
          </div>
          <p class="text-lg text-ink-muted dark:text-paper/65">
            {{ district.cityName }}
          </p>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-10">
        <div class="rounded-xl border border-ink/15 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
          <div class="mb-1 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/65">
            <PhUsers :size="14" weight="light" />
            {{ t('cities.population') }}
          </div>
          <p class="text-2xl font-bold text-ink dark:text-paper">{{ formatNumber(district.population) }}</p>
        </div>
        <div class="rounded-xl border border-ink/15 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
          <div class="mb-1 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/65">
            <PhArrowsOut :size="14" weight="light" />
            {{ t('cities.area') }}
          </div>
          <p class="text-2xl font-bold text-ink dark:text-paper">{{ formatNumber(district.area) }} {{ t('common.km2') }}</p>
        </div>
        <div class="rounded-xl border border-ink/15 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
          <div class="mb-1 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/65">
            <PhFolder :size="14" weight="light" />
            {{ t('architects.projectsCount') }}
          </div>
          <p class="text-2xl font-bold text-ink dark:text-paper">{{ projectsTotalElements }}</p>
        </div>
      </div>

      <!-- Map -->
      <div class="mb-10">
        <h2 class="mb-4 text-xl font-semibold text-ink dark:text-paper">{{ t('cities.map') }}</h2>
        <div ref="mapContainer" class="z-0 h-72 overflow-hidden rounded-xl border border-ink/15 dark:border-night-border" />
      </div>

      <!-- Projects -->
      <div>
        <h2 class="mb-4 text-xl font-semibold text-ink dark:text-paper">
          {{ t('districts.projects', { count: projectsTotalElements }) }}
        </h2>

        <EmptyState v-if="projects.length === 0" :title="t('projects.notFound')" />
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
        </div>

        <div v-if="projects.length > 0" class="mt-6">
          <Pagination
            :current-page="projectsPage"
            :total-pages="projectsTotalPages"
            :total-elements="projectsTotalElements"
            :page-size="6"
            @update:page="projectsPage = $event"
          />
        </div>
      </div>
    </template>
  </div>
</template>
