import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface UseLeafletMapOptions {
  container: () => HTMLElement | null
  center?: [number, number]
  zoom?: number
  onBoundsChange?: (bounds: { swLat: number; swLng: number; neLat: number; neLng: number }) => void
}

export function useLeafletMap(options: UseLeafletMapOptions) {
  const { center = [49.0, 32.0], zoom = 6, onBoundsChange } = options
  const map = ref<L.Map | null>(null)
  const markers = ref<L.Layer[]>([])
  const layerGroup = ref<L.LayerGroup | null>(null)

  function init() {
    const el = options.container()
    if (!el) return
    map.value = L.map(el).setView(center, zoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map.value)
    layerGroup.value = L.layerGroup().addTo(map.value)

    if (onBoundsChange) {
      const emitBounds = () => {
        if (!map.value) return
        const b = map.value.getBounds()
        onBoundsChange({
          swLat: b.getSouthWest().lat,
          swLng: b.getSouthWest().lng,
          neLat: b.getNorthEast().lat,
          neLng: b.getNorthEast().lng,
        })
      }
      map.value.on('moveend', emitBounds)
      emitBounds()
    }
  }

  function addMarker(lat: number, lng: number, popupHtml: string, options?: L.CircleMarkerOptions) {
    if (!layerGroup.value) return null
    const m = options
      ? L.circleMarker([lat, lng], options).bindPopup(popupHtml)
      : L.marker([lat, lng]).bindPopup(popupHtml)
    layerGroup.value.addLayer(m)
    return m
  }

  function addCircleMarker(lat: number, lng: number, popupHtml: string, color: string, radius = 8) {
    if (!layerGroup.value) return null
    const m = L.circleMarker([lat, lng], {
      radius, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.85,
    }).bindPopup(popupHtml)
    layerGroup.value.addLayer(m)
    return m
  }

  function clearMarkers() {
    layerGroup.value?.clearLayers()
  }

  function setView(lat: number, lng: number, z?: number) {
    map.value?.setView([lat, lng], z ?? map.value.getZoom())
  }

  function fitBounds(bounds: L.LatLngBoundsExpression) {
    map.value?.fitBounds(bounds)
  }

  function getBounds() {
    if (!map.value) return null
    const b = map.value.getBounds()
    return {
      swLat: b.getSouthWest().lat,
      swLng: b.getSouthWest().lng,
      neLat: b.getNorthEast().lat,
      neLng: b.getNorthEast().lng,
    }
  }

  onMounted(() => { init() })
  onBeforeUnmount(() => { if (map.value) { map.value.remove(); map.value = null } })

  return {
    map,
    addMarker,
    addCircleMarker,
    clearMarkers,
    setView,
    fitBounds,
    getBounds,
  }
}
