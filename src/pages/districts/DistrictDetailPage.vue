<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ChevronRightIcon,
  UsersIcon,
  ArrowsPointingOutIcon,
  FolderIcon,
} from '@heroicons/vue/24/outline'
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
    toast.error(err instanceof Error ? err.message : t('districts.loadError'))
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
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
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
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <LoadingSpinner v-if="loading" size="lg" />

    <template v-else-if="district">
      <!-- Breadcrumbs -->
      <div class="sticky top-16 z-40 -mx-4 px-4 py-3 bg-slate-50/90 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-slate-200">
        <nav class="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
          <RouterLink to="/" class="hover:text-slate-700 transition-colors">{{ t('header.home') }}</RouterLink>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <RouterLink to="/cities" class="hover:text-slate-700 transition-colors">{{ t('header.cities') }}</RouterLink>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <RouterLink :to="`/cities/${district.cityId}`" class="hover:text-slate-700 transition-colors">
            {{ district.cityName }}
          </RouterLink>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <span class="text-slate-900 font-medium">{{ district.name }}</span>
        </nav>
      </div>

      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-4xl font-bold text-slate-900">{{ district.name }}</h1>
            <BaseBadge :custom-class="getDistrictTypeColor(district.type)">
              {{ t(`enums.districtType.${district.type}`) }}
            </BaseBadge>
          </div>
          <p class="text-lg text-slate-500">
            {{ district.cityName }}
          </p>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-10">
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <UsersIcon class="h-4 w-4" />
            {{ t('cities.population') }}
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ formatNumber(district.population) }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <ArrowsPointingOutIcon class="h-4 w-4" />
            {{ t('cities.area') }}
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ formatNumber(district.area) }} {{ t('common.km2') }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <FolderIcon class="h-4 w-4" />
            {{ t('architects.projectsCount') }}
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ projectsTotalElements }}</p>
        </div>
      </div>

      <!-- Map -->
      <div class="mb-10">
        <h2 class="text-xl font-semibold text-slate-900 mb-4">{{ t('cities.map') }}</h2>
        <div ref="mapContainer" class="h-72 rounded-xl border border-slate-200 overflow-hidden z-0" />
      </div>

      <!-- Projects -->
      <div>
        <h2 class="text-xl font-semibold text-slate-900 mb-4">
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
