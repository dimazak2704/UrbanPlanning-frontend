<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { getMapCities, getMapProjects, getMapInfrastructures } from '@/api/map.api'
import { getCities } from '@/api/cities.api'
import { useDebounce } from '@/composables/useDebounce'
import { PROJECT_STATUS_LABELS, INFRASTRUCTURE_TYPE_LABELS, INFRASTRUCTURE_STATUS_LABELS } from '@/utils/enum-labels'
import { formatCurrency } from '@/utils/format'
import type { CityMarker, ProjectMarker, InfrastructureMarker, MapBounds } from '@/types/map'
import type { ProjectStatus, InfrastructureType, InfrastructureStatus } from '@/types/enums'

const route = useRoute()
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
const debouncedBounds = useDebounce(ref(boundsJson.value), 500)

const cities = ref<CityMarker[]>([])
const projectMarkers = ref<ProjectMarker[]>([])
const infraMarkers = ref<InfrastructureMarker[]>([])
const cityOptions = ref<{ value: number; label: string }[]>([])
const statusOptions = computed(() => Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))
const infraTypeOptions = computed(() => Object.entries(INFRASTRUCTURE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })))
const infraStatusOptions = computed(() => Object.entries(INFRASTRUCTURE_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))

const selectedItem = ref<{ type: string; name: string; html: string } | null>(null)

let cityLayerGroup: L.LayerGroup | null = null
let projectLayerGroup: L.LayerGroup | null = null
let infraLayerGroup: L.LayerGroup | null = null

const PROJECT_COLORS: Record<string, string> = { PLANNED: '#94a3b8', APPROVED: '#3b82f6', UNDER_CONSTRUCTION: '#f59e0b', COMPLETED: '#10b981', SUSPENDED: '#ef4444' }
const INFRA_COLORS: Record<string, string> = { TRANSPORT: '#3b82f6', SOCIAL: '#14b8a6', UTILITY: '#f59e0b', RECREATIONAL: '#10b981', OTHER: '#94a3b8' }

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
    const m = L.circleMarker([c.latitude, c.longitude], { radius: 10, fillColor: '#6366f1', color: '#4f46e5', weight: 2, fillOpacity: 0.8 })
    m.bindPopup(`<div class="text-sm"><b>${c.name}</b><br>${c.region}<br>Населення: ${c.population?.toLocaleString()}<br><a href="/cities/${c.id}" class="text-indigo-600 font-medium">Детальніше →</a></div>`)
    cityLayerGroup?.addLayer(m)
  })
}

function renderProjects() {
  projectLayerGroup?.clearLayers()
  if (!projectLayer.value || !map) return
  projectMarkers.value.forEach((p) => {
    const color = PROJECT_COLORS[p.status] || '#94a3b8'
    const m = L.circleMarker([p.latitude, p.longitude], { radius: 7, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9 })
    m.bindPopup(`<div class="text-sm"><b>${p.name}</b><br>${p.architectFullName}<br>${formatCurrency(p.budget)}<br><a href="/projects/${p.id}" class="text-indigo-600 font-medium">Детальніше →</a></div>`)
    projectLayerGroup?.addLayer(m)
  })
}

function renderInfra() {
  infraLayerGroup?.clearLayers()
  if (!infraLayer.value || !map) return
  infraMarkers.value.forEach((i) => {
    const color = INFRA_COLORS[i.type] || '#94a3b8'
    const m = L.circleMarker([i.latitude, i.longitude], { radius: 5, fillColor: color, color: '#fff', weight: 1.5, fillOpacity: 0.8 })
    m.bindPopup(`<div class="text-sm"><b>${i.name}</b><br>${i.projectName}<br><a href="/infrastructures/${i.id}" class="text-indigo-600 font-medium">Детальніше →</a></div>`)
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

onMounted(async () => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView([49.0, 32.0], 6)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
  cityLayerGroup = L.layerGroup().addTo(map)
  projectLayerGroup = L.layerGroup().addTo(map)
  infraLayerGroup = L.layerGroup().addTo(map)
  map.on('moveend', updateBounds)
  updateBounds()
  try { const { data } = await getCities(undefined, { size: 100 }); cityOptions.value = data.content.map((c) => ({ value: c.id, label: c.name })) } catch { /* ignore */ }
  fetchCities()
})

onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="relative flex" style="height: calc(100vh - 64px)">
    <!-- Sidebar -->
    <transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-x-full opacity-0" enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-150 ease-in" leave-from-class="translate-x-0 opacity-100" leave-to-class="-translate-x-full opacity-0">
      <div v-if="sidebarOpen" class="absolute left-0 top-0 bottom-0 z-20 w-80 bg-white border-r border-slate-200 overflow-y-auto shadow-lg">
        <div class="p-4 border-b border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900">Карта</h2>
            <button @click="sidebarOpen = false" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">✕</button>
          </div>
          <!-- Layers -->
          <div class="space-y-2 mb-4">
            <label class="flex items-center gap-2 text-sm cursor-pointer"><input v-model="cityLayer" type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" /><span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded-full bg-indigo-500 inline-block" /> Міста</span></label>
            <label class="flex items-center gap-2 text-sm cursor-pointer"><input v-model="projectLayer" type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" /><span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded-full bg-blue-500 inline-block" /> Проєкти</span></label>
            <label class="flex items-center gap-2 text-sm cursor-pointer"><input v-model="infraLayer" type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" /><span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded-full bg-teal-500 inline-block" /> Інфраструктура</span></label>
          </div>
        </div>
        <!-- Filters -->
        <div class="p-4 space-y-3">
          <BaseSelect v-model="filterCity" :options="cityOptions" label="Місто" placeholder="Усі міста" />
          <BaseSelect v-model="filterProjectStatus" :options="statusOptions" label="Статус проєкту" placeholder="Усі" />
          <BaseSelect v-model="filterInfraType" :options="infraTypeOptions" label="Тип інфраструктури" placeholder="Усі" />
          <BaseSelect v-model="filterInfraStatus" :options="infraStatusOptions" label="Статус інфра." placeholder="Усі" />
        </div>
        <!-- Legend -->
        <div class="p-4 border-t border-slate-100">
          <h3 class="text-xs font-semibold text-slate-500 uppercase mb-2">Легенда проєктів</h3>
          <div class="space-y-1">
            <div v-for="(color, status) in PROJECT_COLORS" :key="status" class="flex items-center gap-2 text-xs text-slate-600">
              <span class="h-2.5 w-2.5 rounded-full inline-block" :style="{ backgroundColor: color }" />
              {{ (PROJECT_STATUS_LABELS as Record<string, string>)[status] || status }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toggle sidebar -->
    <button v-if="!sidebarOpen" @click="sidebarOpen = true"
      class="absolute left-3 top-3 z-20 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50 transition-colors">
      ☰ Фільтри
    </button>

    <!-- Map -->
    <div ref="mapContainer" class="flex-1 z-0" />
  </div>
</template>
