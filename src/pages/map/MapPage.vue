<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { getMapCities, getMapProjects, getMapInfrastructures } from '@/api/map.api'
import { getCities } from '@/api/cities.api'
import { getProjectById } from '@/api/projects.api'
import { useDebounce } from '@/composables/useDebounce'
import { PROJECT_STATUS_LABELS, INFRASTRUCTURE_TYPE_LABELS, INFRASTRUCTURE_STATUS_LABELS } from '@/utils/enum-labels'
import { formatCurrency } from '@/utils/format'
import type { CityMapMarker, ProjectMapMarker, InfrastructureMapMarker, MapBounds } from '@/types/map'
import { createCityMarker } from '@/components/map/markers/cityMarker'
import { createProjectMarker } from '@/components/map/markers/projectMarker'
import { createInfraMarker } from '@/components/map/markers/infraMarker'
import { useCompareStore } from '@/stores/compare.store'
import {
  PROJECT_STATUS_VALUES,
  INFRASTRUCTURE_TYPE_VALUES,
  INFRASTRUCTURE_STATUS_VALUES,
  type ProjectStatus,
  type InfrastructureType,
  type InfrastructureStatus,
} from '@/types/enums'

const route = useRoute()
const { t } = useI18n()
const compareStore = useCompareStore()
const mapContainer = ref<HTMLDivElement | null>(null)
const sidebarOpen = ref(true)
let map: L.Map | null = null

const cityLayer = ref(true)
const projectLayer = ref(true)
const infraLayer = ref(true)
const filterCity = ref<number | null>(route.query.cityId ? Number(route.query.cityId) : null)
const filterProjectStatus = ref<ProjectStatus | ''>('')
const filterInfraType = ref<InfrastructureType | ''>('')
const filterInfraStatus = ref<InfrastructureStatus | ''>('')

const bounds = ref<MapBounds | null>(null)
const boundsJson = ref('')
const debouncedBounds = useDebounce(boundsJson, 500)

const cities = ref<CityMapMarker[]>([])
const projectMarkers = ref<ProjectMapMarker[]>([])
const infraMarkers = ref<InfrastructureMapMarker[]>([])
const cityOptions = ref<{ value: number; label: string }[]>([])
const statusOptions = computed(() =>
  PROJECT_STATUS_VALUES.map((value) => ({ value, label: PROJECT_STATUS_LABELS[value] })),
)
const infraTypeOptions = computed(() =>
  INFRASTRUCTURE_TYPE_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_TYPE_LABELS[value] })),
)
const infraStatusOptions = computed(() =>
  INFRASTRUCTURE_STATUS_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_STATUS_LABELS[value] })),
)

let cityLayerGroup: L.LayerGroup | null = null
let projectLayerGroup: L.LayerGroup | null = null
let infraLayerGroup: L.LayerGroup | null = null

let voyagerTiles: L.TileLayer | null = null

const PROJECT_COLORS: Record<ProjectStatus, string> = {
  PLANNED: '#6B6B6B',
  APPROVED: '#2D5F8B',
  UNDER_CONSTRUCTION: '#B8533A',
  COMPLETED: '#3A6B3A',
  SUSPENDED: '#8B2D2D',
}

const INFRA_STATUS_COLORS: Record<InfrastructureStatus, string> = {
  PLANNED: '#6B6B6B',
  UNDER_CONSTRUCTION: '#B8533A',
  OPERATIONAL: '#3A6B3A',
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function cityPopupHtml(city: CityMapMarker): string {
  return `
    <div class="map-popup">
      <div class="map-popup__body">
        <div class="map-popup__meta">${escapeHtml(t('header.cities'))}</div>
        <h4 class="map-popup__title">${escapeHtml(city.name)}</h4>
        <p class="map-popup__description">${escapeHtml(city.region)}</p>
        <p class="map-popup__description">${escapeHtml(t('cities.population'))}: ${(city.population ?? 0).toLocaleString()}</p>
        <a href="/cities/${city.id}" class="map-popup__link">${escapeHtml(t('common.details'))} →</a>
      </div>
    </div>
  `
}

function projectPopupHtml(project: ProjectMapMarker): string {
  const meta = `${t('header.projects')} · ${PROJECT_STATUS_LABELS[project.status]}`
  const isSelected = compareStore.has(project.id)
  const isDisabled = compareStore.isFull && !isSelected
  const compareLabel = isSelected ? t('compare.selected') : t('compare.add')
  return `
    <div class="map-popup">
      ${project.imageUrl ? `<img src="${escapeHtml(project.imageUrl)}" alt="${escapeHtml(project.name)}" class="map-popup__image" />` : ''}
      <div class="map-popup__body">
        <div class="map-popup__meta">${escapeHtml(meta)}</div>
        <h4 class="map-popup__title">${escapeHtml(project.name)}</h4>
        <p class="map-popup__description">${escapeHtml(project.cityName)} · ${escapeHtml(project.districtName)}</p>
        <p class="map-popup__description">${escapeHtml(formatCurrency(project.budget ?? 0))}</p>
        <div class="map-popup__actions">
          <a href="/projects/${project.id}" class="map-popup__link">${escapeHtml(t('common.details'))} →</a>
          <button
            type="button"
            class="map-popup__compare"
            data-compare-project-id="${project.id}"
            ${isDisabled ? 'disabled' : ''}
            title="${escapeHtml(isDisabled ? t('compare.tooltipMax') : isSelected ? t('compare.tooltipRemove') : t('compare.tooltipAdd'))}"
          >${escapeHtml(compareLabel)}</button>
        </div>
      </div>
    </div>
  `
}

function infraPopupHtml(infra: InfrastructureMapMarker): string {
  const meta = `${t('header.infrastructures')} · ${INFRASTRUCTURE_STATUS_LABELS[infra.status]}`
  return `
    <div class="map-popup">
      ${infra.imageUrl ? `<img src="${escapeHtml(infra.imageUrl)}" alt="${escapeHtml(infra.name)}" class="map-popup__image" />` : ''}
      <div class="map-popup__body">
        <div class="map-popup__meta">${escapeHtml(meta)}</div>
        <h4 class="map-popup__title">${escapeHtml(infra.name)}</h4>
        <p class="map-popup__description">${escapeHtml(infra.projectName)}</p>
        <a href="/infrastructures/${infra.id}" class="map-popup__link">${escapeHtml(t('common.details'))} →</a>
      </div>
    </div>
  `
}

function updateBounds() {
  if (!map) return
  const b = map.getBounds()
  bounds.value = { swLat: b.getSouthWest().lat, swLng: b.getSouthWest().lng, neLat: b.getNorthEast().lat, neLng: b.getNorthEast().lng }
  boundsJson.value = JSON.stringify(bounds.value)
}

async function fetchCities() {
  try { const { data } = await getMapCities(); cities.value = data } catch { /* ignore */ }
}

async function fetchProjects() {
  if (!bounds.value) return
  try {
    const filters: Record<string, unknown> = {}
    if (filterCity.value) filters.cityId = filterCity.value
    if (filterProjectStatus.value) filters.status = filterProjectStatus.value
    const { data } = await getMapProjects(filters as never, bounds.value)
    projectMarkers.value = data
  } catch { /* ignore */ }
}

async function fetchInfra() {
  if (!bounds.value) return
  try {
    const filters: Record<string, unknown> = {}
    if (filterCity.value) filters.cityId = filterCity.value
    if (filterInfraType.value) filters.type = filterInfraType.value
    if (filterInfraStatus.value) filters.status = filterInfraStatus.value
    const { data } = await getMapInfrastructures(filters as never, bounds.value)
    infraMarkers.value = data
  } catch { /* ignore */ }
}

function renderCities() {
  cityLayerGroup?.clearLayers()
  if (!cityLayer.value || !map) return
  cities.value.forEach((c) => {
    if (c.latitude === null || c.longitude === null) return
    const m = L.marker([c.latitude, c.longitude], {
      icon: createCityMarker(escapeHtml(c.name), c.projectsCount),
      pane: 'cityPane',
    })
    m.bindPopup(cityPopupHtml(c))
    cityLayerGroup?.addLayer(m)
  })
}

function renderProjects() {
  projectLayerGroup?.clearLayers()
  if (!projectLayer.value || !map) return
  projectMarkers.value.forEach((p) => {
    if (p.latitude === null || p.longitude === null) return
    const m = L.marker([p.latitude, p.longitude], {
      icon: createProjectMarker(p.status),
    })
    m.bindPopup(projectPopupHtml(p))
    projectLayerGroup?.addLayer(m)
  })
}

function renderInfra() {
  infraLayerGroup?.clearLayers()
  if (!infraLayer.value || !map) return
  infraMarkers.value.forEach((i) => {
    if (i.latitude === null || i.longitude === null) return
    const m = L.marker([i.latitude, i.longitude], {
      icon: createInfraMarker(i.type, i.status),
    })
    m.bindPopup(infraPopupHtml(i))
    infraLayerGroup?.addLayer(m)
  })
}

watch(debouncedBounds, () => { fetchProjects(); fetchInfra() })
watch([() => filterCity.value, () => filterProjectStatus.value], () => { fetchProjects() })
watch([() => filterCity.value, () => filterInfraType.value, () => filterInfraStatus.value], () => { fetchInfra() })
watch(cities, renderCities)
watch(projectMarkers, renderProjects)
watch(infraMarkers, renderInfra)
watch(cityLayer, renderCities)
watch(projectLayer, renderProjects)
watch(infraLayer, renderInfra)
watch(() => compareStore.projects, renderProjects, { deep: true })

onMounted(async () => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView([49.0, 32.0], 6)
  const attribution = '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  voyagerTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution })
  voyagerTiles.addTo(map)
  map.createPane('cityPane')
  map.getPane('cityPane')!.style.zIndex = '680'
  cityLayerGroup = L.layerGroup().addTo(map)
  projectLayerGroup = L.layerGroup().addTo(map)
  infraLayerGroup = L.layerGroup().addTo(map)
  map.on('moveend', updateBounds)
  map.on('popupopen', (event) => {
    const popupElement = event.popup.getElement()
    if (!popupElement) return
    const compareButton = popupElement.querySelector<HTMLButtonElement>('[data-compare-project-id]')
    if (!compareButton) return
    compareButton.addEventListener('click', (buttonEvent) => {
      buttonEvent.preventDefault()
      buttonEvent.stopPropagation()
      const rawProjectId = compareButton.getAttribute('data-compare-project-id')
      const projectId = rawProjectId ? Number(rawProjectId) : NaN
      if (!Number.isFinite(projectId)) return
      const project = projectMarkers.value.find((item) => item.id === projectId)
      if (!project) return
      getProjectById(project.id)
        .then(({ data }) => {
          compareStore.toggle(data)
          event.popup.setContent(projectPopupHtml(project))
        })
        .catch(() => {
          // ignore compare fetch errors in map popup
        })
    })
  })
  updateBounds()
  try { const { data } = await getCities(undefined, { size: 100 }); cityOptions.value = data.content.map((c) => ({ value: c.id, label: c.name })) } catch { /* ignore */ }
  fetchCities()
})

onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="relative flex" style="height: calc(100vh - 80px)">
    <transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-x-full opacity-0" enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-150 ease-in" leave-from-class="translate-x-0 opacity-100" leave-to-class="-translate-x-full opacity-0">
      <aside v-if="sidebarOpen" class="absolute bottom-0 left-0 top-0 z-20 w-80 overflow-y-auto border-r border-ink/10 bg-paper/90 p-4 backdrop-blur-md dark:border-night-border dark:bg-night-soft/95">
        <header class="mb-6">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-serif text-2xl font-medium tracking-tight text-ink dark:text-paper">{{ t('map.title') }}</h2>
            <button @click="sidebarOpen = false" class="border border-ink/20 p-1.5 text-ink-muted hover:border-ink hover:text-ink dark:border-paper/25 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper">✕</button>
          </div>
          <div class="space-y-2">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-muted dark:text-paper/70"><input v-model="cityLayer" type="checkbox" class="rounded border-ink/30 text-accent focus:ring-accent" /><span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-full bg-indigo-500" /> {{ t('header.cities') }}</span></label>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-muted dark:text-paper/70"><input v-model="projectLayer" type="checkbox" class="rounded border-ink/30 text-accent focus:ring-accent" /><span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-full bg-blue-500" /> {{ t('header.projects') }}</span></label>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-muted dark:text-paper/70"><input v-model="infraLayer" type="checkbox" class="rounded border-ink/30 text-accent focus:ring-accent" /><span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-full bg-teal-500" /> {{ t('header.infrastructures') }}</span></label>
          </div>
        </header>

        <hr class="map-filters__divider" />

        <section v-if="cityLayer" class="map-filters__section">
          <h3 class="map-filters__section-title">— {{ t('map.filtersCities') }}</h3>
          <BaseSelect v-model="filterCity" class="map-filter-select" :options="cityOptions" :label="t('map.filterCityName')" :placeholder="t('projects.allCities')" />
        </section>

        <hr v-if="projectLayer || infraLayer" class="map-filters__divider" />

        <section v-if="projectLayer" class="map-filters__section">
          <h3 class="map-filters__section-title">— {{ t('map.filtersProjects') }}</h3>
          <BaseSelect v-model="filterProjectStatus" class="map-filter-select" :options="statusOptions" :label="t('map.filterProjectStatus')" :placeholder="t('common.all')" />
        </section>

        <hr v-if="infraLayer" class="map-filters__divider" />

        <section v-if="infraLayer" class="map-filters__section">
          <h3 class="map-filters__section-title">— {{ t('map.filtersInfrastructures') }}</h3>
          <BaseSelect v-model="filterInfraType" class="map-filter-select" :options="infraTypeOptions" :label="t('map.filterInfraType')" :placeholder="t('common.all')" />
          <BaseSelect v-model="filterInfraStatus" class="map-filter-select mt-5" :options="infraStatusOptions" :label="t('map.filterInfraStatus')" :placeholder="t('common.all')" />
        </section>

        <hr class="map-filters__divider" />

        <section class="map-filters__section">
          <h3 class="map-filters__section-title">— {{ t('map.legendProjects') }}</h3>
          <ul class="space-y-2">
            <li v-for="(color, status) in PROJECT_COLORS" :key="status" class="flex items-center gap-2 text-xs text-ink-muted dark:text-paper/70">
              <span class="h-2.5 w-2.5 inline-block" :style="{ backgroundColor: color }" />
              {{ (PROJECT_STATUS_LABELS as Record<string, string>)[status] || status }}
            </li>
          </ul>
        </section>

        <section class="map-filters__section">
          <h3 class="map-filters__section-title">— {{ t('map.legendInfrastructures') }}</h3>
          <ul class="space-y-2">
            <li v-for="(color, status) in INFRA_STATUS_COLORS" :key="status" class="flex items-center gap-2 text-xs text-ink-muted dark:text-paper/70">
              <span class="h-2.5 w-2.5 rounded-full inline-block" :style="{ backgroundColor: color }" />
              {{ (INFRASTRUCTURE_STATUS_LABELS as Record<string, string>)[status] || status }}
            </li>
          </ul>
        </section>
      </aside>
    </transition>

    <button v-if="!sidebarOpen" @click="sidebarOpen = true"
      class="absolute left-3 top-3 z-20 border border-ink/15 bg-paper/90 px-3 py-2 text-xs font-mono uppercase tracking-wider text-ink backdrop-blur-sm transition-colors hover:border-ink hover:bg-paper dark:border-paper/25 dark:bg-night-soft/90 dark:text-paper dark:hover:border-paper">
      ☰ {{ t('map.filters') }}
    </button>

    <div ref="mapContainer" class="flex-1 z-0" />
  </div>
</template>
