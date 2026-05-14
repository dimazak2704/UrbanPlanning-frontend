<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { PhArrowsOut, PhBuildings, PhCaretRight, PhFolder, PhMapPin, PhUsers } from '@phosphor-icons/vue'
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
import { getApiErrorMessage } from '@/utils/api-error'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

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

const statusOptions = computed(() => [
  { value: 'PLANNED', label: t('enums.projectStatus.PLANNED') },
  { value: 'APPROVED', label: t('enums.projectStatus.APPROVED') },
  { value: 'UNDER_CONSTRUCTION', label: t('enums.projectStatus.UNDER_CONSTRUCTION') },
  { value: 'COMPLETED', label: t('enums.projectStatus.COMPLETED') },
  { value: 'SUSPENDED', label: t('enums.projectStatus.SUSPENDED') },
])

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null

async function fetchCity() {
  loading.value = true
  try {
    const { data } = await getCityById(cityId.value)
    city.value = data
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('cities.loadError')))
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
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap © CARTO',
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
  <div class="container-app min-h-[calc(100vh-220px)] py-10">
    <LoadingSpinner v-if="loading" size="lg" />

    <template v-else-if="city">
      <!-- Breadcrumbs -->
      <div class="sticky top-16 z-40 -mx-4 mb-6 border-b border-ink/10 bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-night-border dark:bg-night-soft/90">
        <nav class="flex items-center gap-1.5 text-sm text-ink-muted dark:text-paper/65">
          <RouterLink to="/" class="transition-colors hover:text-ink dark:hover:text-paper">{{ t('header.home') }}</RouterLink>
          <PhCaretRight :size="12" weight="light" />
          <RouterLink to="/cities" class="transition-colors hover:text-ink dark:hover:text-paper">{{ t('header.cities') }}</RouterLink>
          <PhCaretRight :size="12" weight="light" />
          <span class="font-medium text-ink dark:text-paper">{{ city.name }}</span>
        </nav>
      </div>

      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold text-ink dark:text-paper">{{ city.name }}</h1>
          <p class="mt-1 text-lg text-ink-muted dark:text-paper/65">{{ city.region }}</p>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-10">
        <div class="rounded-xl border border-ink/15 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
          <div class="mb-1 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/65">
            <PhUsers :size="14" weight="light" />
            {{ t('cities.population') }}
          </div>
          <p class="text-2xl font-bold text-ink dark:text-paper">{{ formatNumber(city.population) }}</p>
        </div>
        <div class="rounded-xl border border-ink/15 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
          <div class="mb-1 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/65">
            <PhArrowsOut :size="14" weight="light" />
            {{ t('cities.area') }}
          </div>
          <p class="text-2xl font-bold text-ink dark:text-paper">{{ formatNumber(city.area) }} {{ t('common.km2') }}</p>
        </div>
        <div class="rounded-xl border border-ink/15 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
          <div class="mb-1 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/65">
            <PhBuildings :size="14" weight="light" />
            {{ t('cities.districts') }}
          </div>
          <p class="text-2xl font-bold text-ink dark:text-paper">{{ districts.length }}</p>
        </div>
        <div class="rounded-xl border border-ink/15 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
          <div class="mb-1 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/65">
            <PhFolder :size="14" weight="light" />
            {{ t('cities.projectsCount') }}
          </div>
          <p class="text-2xl font-bold text-ink dark:text-paper">{{ projectsTotalElements }}</p>
        </div>
      </div>

      <!-- Map -->
      <div class="mb-10">
        <h2 class="mb-4 text-xl font-semibold text-ink dark:text-paper">{{ t('cities.map') }}</h2>
        <div ref="mapContainer" class="z-0 h-80 overflow-hidden rounded-xl border border-ink/15 dark:border-night-border" />
      </div>

      <!-- Districts -->
      <div class="mb-10">
        <h2 class="mb-4 text-xl font-semibold text-ink dark:text-paper">
          {{ t('cities.cityDistricts', { count: districts.length }) }}
        </h2>
        <div v-if="districts.length === 0" class="text-sm text-ink-muted dark:text-paper/65">{{ t('cities.districtsNotFound') }}</div>
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="d in districts"
            :key="d.id"
            :to="`/districts/${d.id}`"
            class="group rounded-xl border border-ink/15 bg-paper-pure p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-night-border dark:bg-night-soft dark:hover:shadow-none"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-base font-semibold text-ink transition-colors group-hover:text-primary-700 dark:text-paper">
                {{ d.name }}
              </h3>
              <BaseBadge :custom-class="getDistrictTypeColor(d.type)">
                {{ getDistrictTypeLabel(d.type) }}
              </BaseBadge>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm text-ink-muted dark:text-paper/65">
              <span>👥 {{ formatNumber(d.population) }}</span>
              <span>📐 {{ formatNumber(d.area) }} {{ t('common.km2') }}</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Projects -->
      <div>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 class="text-xl font-semibold text-ink dark:text-paper">
            {{ t('cities.cityProjects', { count: projectsTotalElements }) }}
          </h2>
          <RouterLink
            :to="`/map?cityId=${city.id}`"
            class="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <PhMapPin :size="14" weight="light" />
            {{ t('common.moreOnMap') }}
          </RouterLink>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row mb-6">
          <div class="sm:w-64">
            <BaseInput v-model="projectSearch" :placeholder="t('cities.searchProjects')" />
          </div>
          <div class="sm:w-48">
            <BaseSelect
              v-model="projectStatusFilter"
              :options="statusOptions"
              :placeholder="t('projects.allStatuses')"
            />
          </div>
        </div>

        <EmptyState v-if="projects.length === 0 && !loading" :title="t('projects.notFound')" />
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
