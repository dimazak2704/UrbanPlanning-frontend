<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PhMapPin, PhX } from '@phosphor-icons/vue'

interface LatLng {
  lat: number
  lng: number
}

interface Props {
  modelValue: LatLng | null
  initialCenter?: LatLng
  focusLocation?: LatLng | null
  focusZoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  initialCenter: () => ({ lat: 49.0, lng: 32.0 }),
  focusLocation: null,
  focusZoom: 13,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: LatLng | null): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const latInput = ref(props.modelValue?.lat?.toString() ?? '')
const lngInput = ref(props.modelValue?.lng?.toString() ?? '')

let map: L.Map | null = null
let marker: L.Marker | null = null

function updateMarker(lat: number, lng: number) {
  if (!map) return
  if (marker) { marker.setLatLng([lat, lng]) }
  else { marker = L.marker([lat, lng]).addTo(map) }
  latInput.value = lat.toFixed(6)
  lngInput.value = lng.toFixed(6)
}

function onMapClick(e: L.LeafletMouseEvent) {
  updateMarker(e.latlng.lat, e.latlng.lng)
  emit('update:modelValue', { lat: e.latlng.lat, lng: e.latlng.lng })
}

function onInputChange() {
  const lat = parseFloat(latInput.value)
  const lng = parseFloat(lngInput.value)
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    updateMarker(lat, lng)
    map?.setView([lat, lng], map.getZoom())
    emit('update:modelValue', { lat, lng })
  }
}

function clearLocation() {
  if (marker && map) { map.removeLayer(marker); marker = null }
  latInput.value = ''
  lngInput.value = ''
  emit('update:modelValue', null)
}

function getMyLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      updateMarker(lat, lng)
      map?.setView([lat, lng], 14)
      emit('update:modelValue', { lat, lng })
    },
    () => { /* ignore */ },
  )
}

watch(() => props.modelValue, (val) => {
  if (val) { updateMarker(val.lat, val.lng) }
}, { deep: true })

watch(() => props.focusLocation, (val) => {
  if (!map || !val) return
  map.setView([val.lat, val.lng], props.focusZoom)
}, { deep: true })

onMounted(() => {
  if (!mapContainer.value) return
  const center = props.modelValue ?? props.initialCenter
  map = L.map(mapContainer.value).setView([center.lat, center.lng], props.modelValue ? 14 : 6)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap © CARTO',
  }).addTo(map)
  map.on('click', onMapClick)
  if (props.modelValue) updateMarker(props.modelValue.lat, props.modelValue.lng)
})

onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="space-y-3">
    <div ref="mapContainer" class="z-0 h-[420px] overflow-hidden border border-ink/10 dark:border-night-border" />
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="flex-1">
        <label class="mb-2 block text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">Широта</label>
        <input v-model="latInput" type="text" placeholder="49.000000"
          class="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-base text-ink focus:border-ink focus:outline-none dark:border-paper/30 dark:text-paper dark:focus:border-paper"
          @change="onInputChange" />
      </div>
      <div class="flex-1">
        <label class="mb-2 block text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">Довгота</label>
        <input v-model="lngInput" type="text" placeholder="32.000000"
          class="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-base text-ink focus:border-ink focus:outline-none dark:border-paper/30 dark:text-paper dark:focus:border-paper"
          @change="onInputChange" />
      </div>
      <button type="button" @click="getMyLocation"
        class="inline-flex items-center gap-2 border border-ink px-5 py-3 text-xs font-mono uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper dark:border-paper dark:text-paper dark:hover:bg-paper dark:hover:text-night">
        <PhMapPin :size="14" weight="light" /> Моя локація
      </button>
      <button type="button" @click="clearLocation"
        class="inline-flex items-center gap-2 border border-ink/20 px-5 py-3 text-xs font-mono uppercase tracking-wider text-ink-muted transition-colors hover:border-ink hover:text-ink dark:border-paper/30 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper">
        <PhX :size="14" weight="light" /> Очистити
      </button>
    </div>
  </div>
</template>
