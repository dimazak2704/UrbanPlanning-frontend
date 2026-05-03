<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import {
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  UsersIcon,
  ArrowsPointingOutIcon,
  FolderIcon,
  BuildingLibraryIcon,
} from '@heroicons/vue/24/outline'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import Pagination from '@/components/tables/Pagination.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

import { getCityById } from '@/api/cities.api'
import { getDistricts } from '@/api/districts.api'
import { getProjects } from '@/api/projects.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatNumber, formatCurrency } from '@/utils/format'
import { getDistrictTypeLabel, getDistrictTypeColor, getProjectStatusLabel } from '@/utils/enum-labels'

import type { City } from '@/types/city'
import type { District } from '@/types/district'
import type { Project } from '@/types/project'
import type { ProjectStatus } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const cityId = computed(() => Number(route.params.id))
const loading = ref(true)
const city = ref<City | null>(null)
const districts = ref<District[]>([])
const projects = ref<Project[]>([])
const projectsPage = ref(0)
const projectsTotalPages = ref(0)
const projectsTotalElements = ref(0)
const projectStatusFilter = ref<ProjectStatus | ''>('')
const projectSearch = ref('')

const statusOptions = [
  { value: 'PLANNED', label: 'Запланований' },
  { value: 'APPROVED', label: 'Затверджений' },
  { value: 'UNDER_CONSTRUCTION', label: 'Будується' },
  { value: 'COMPLETED', label: 'Завершений' },
  { value: 'SUSPENDED', label: 'Призупинений' },
]

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null

async function fetchCity() {
  loading.value = true
  try {
    const { data } = await getCityById(cityId.value)
    city.value = data
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Помилка завантаження міста')
    router.push('/cities')
  } finally {
    loading.value = false
  }
}

async function fetchDistricts() {
  try {
    const { data } = await getDistricts({ cityId: cityId.value }, { page: 0, size: 100 })
    districts.value = data.content
  } catch { /* ignore */ }
}

async function fetchProjects() {
  try {
    const filters: Record<string, unknown> = { cityId: cityId.value }
    if (projectStatusFilter.value) filters.status = projectStatusFilter.value
    if (projectSearch.value) filters.name = projectSearch.value

    const { data } = await getProjects(filters as never, { page: projectsPage.value, size: 6 })
    projects.value = data.content
    projectsTotalPages.value = data.totalPages
    projectsTotalElements.value = data.totalElements
  } catch { /* ignore */ }
}

function initMap() {
  if (!mapContainer.value || !city.value) return
  if (map) { map.remove(); map = null }

  map = L.map(mapContainer.value).setView([city.value.latitude, city.value.longitude], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map)

  L.marker([city.value.latitude, city.value.longitude])
    .addTo(map)
    .bindPopup(`<b>${city.value.name}</b><br>${city.value.region}`)

  districts.value.forEach((d) => {
    if (d.latitude && d.longitude && map) {
      L.circleMarker([d.latitude, d.longitude], {
        radius: 6, fillColor: '#6366f1', color: '#4f46e5', weight: 2, fillOpacity: 0.7,
      })
        .addTo(map!)
        .bindPopup(`<b>${d.name}</b><br>${getDistrictTypeLabel(d.type)}`)
    }
  })
}

watch([() => projectStatusFilter.value, () => projectSearch.value], () => {
  projectsPage.value = 0
  fetchProjects()
})

watch(() => projectsPage.value, fetchProjects)

onMounted(async () => {
  await fetchCity()
  await Promise.all([fetchDistricts(), fetchProjects()])
  setTimeout(initMap, 100)
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <LoadingSpinner v-if="loading" size="lg" />

    <template v-else-if="city">
      <!-- Breadcrumbs -->
      <div class="sticky top-16 z-40 -mx-4 px-4 py-3 bg-slate-50/90 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-slate-200">
        <nav class="flex items-center gap-1.5 text-sm text-slate-500">
          <RouterLink to="/" class="hover:text-slate-700 transition-colors">Головна</RouterLink>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <RouterLink to="/cities" class="hover:text-slate-700 transition-colors">Міста</RouterLink>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <span class="text-slate-900 font-medium">{{ city.name }}</span>
        </nav>
      </div>

      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold text-slate-900">{{ city.name }}</h1>
          <p class="mt-1 text-lg text-slate-500">{{ city.region }}</p>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-10">
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <UsersIcon class="h-4 w-4" />
            Населення
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ formatNumber(city.population) }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <ArrowsPointingOutIcon class="h-4 w-4" />
            Площа
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ formatNumber(city.area) }} км²</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <BuildingLibraryIcon class="h-4 w-4" />
            Районів
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ districts.length }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <FolderIcon class="h-4 w-4" />
            Проєктів
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ projectsTotalElements }}</p>
        </div>
      </div>

      <!-- Map -->
      <div class="mb-10">
        <h2 class="text-xl font-semibold text-slate-900 mb-4">Карта</h2>
        <div ref="mapContainer" class="h-80 rounded-xl border border-slate-200 overflow-hidden z-0" />
      </div>

      <!-- Districts -->
      <div class="mb-10">
        <h2 class="text-xl font-semibold text-slate-900 mb-4">
          Райони міста ({{ districts.length }})
        </h2>
        <div v-if="districts.length === 0" class="text-sm text-slate-500">Районів не знайдено</div>
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="d in districts"
            :key="d.id"
            :to="`/districts/${d.id}`"
            class="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-base font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                {{ d.name }}
              </h3>
              <BaseBadge :custom-class="getDistrictTypeColor(d.type)">
                {{ getDistrictTypeLabel(d.type) }}
              </BaseBadge>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm text-slate-500">
              <span>👥 {{ formatNumber(d.population) }}</span>
              <span>📐 {{ formatNumber(d.area) }} км²</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Projects -->
      <div>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 class="text-xl font-semibold text-slate-900">
            Проєкти в місті ({{ projectsTotalElements }})
          </h2>
          <RouterLink
            :to="`/map?cityId=${city.id}`"
            class="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <MapPinIcon class="h-4 w-4" />
            На карті
          </RouterLink>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row mb-6">
          <div class="sm:w-64">
            <BaseInput v-model="projectSearch" placeholder="Пошук проєктів..." />
          </div>
          <div class="sm:w-48">
            <BaseSelect
              v-model="projectStatusFilter"
              :options="statusOptions"
              placeholder="Усі статуси"
            />
          </div>
        </div>

        <EmptyState v-if="projects.length === 0 && !loading" title="Проєктів не знайдено" />
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
