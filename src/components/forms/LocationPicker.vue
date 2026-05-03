<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPinIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface LatLng {
  lat: number
  lng: number
}

interface Props {
  modelValue: LatLng | null
  initialCenter?: LatLng
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  initialCenter: () => ({ lat: 49.0, lng: 32.0 }),
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

onMounted(() => {
  if (!mapContainer.value) return
  const center = props.modelValue ?? props.initialCenter
  map = L.map(mapContainer.value).setView([center.lat, center.lng], props.modelValue ? 14 : 6)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map)
  map.on('click', onMapClick)
  if (props.modelValue) updateMarker(props.modelValue.lat, props.modelValue.lng)
})

onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="space-y-3">
    <div ref="mapContainer" class="h-[400px] rounded-xl border border-slate-200 overflow-hidden z-0" />
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="flex-1">
        <label class="block text-sm font-medium text-slate-700 mb-1">Широта</label>
        <input v-model="latInput" type="text" placeholder="49.000000"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          @change="onInputChange" />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-slate-700 mb-1">Довгота</label>
        <input v-model="lngInput" type="text" placeholder="32.000000"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          @change="onInputChange" />
      </div>
      <button type="button" @click="getMyLocation"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
        <MapPinIcon class="h-4 w-4" /> Моя локація
      </button>
      <button type="button" @click="clearLocation"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
        <XMarkIcon class="h-4 w-4" /> Очистити
      </button>
    </div>
  </div>
</template>
