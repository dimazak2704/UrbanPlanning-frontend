<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  latitude?: number | null
  longitude?: number | null
  heading?: number
  pitch?: number
  fov?: number
  sectionNumber?: string
}

const props = withDefaults(defineProps<Props>(), {
  heading: 210,
  pitch: 0,
  fov: 80,
  sectionNumber: '04'
})

const { t } = useI18n()
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const hasCoordinates = computed(() => {
  return props.latitude != null && props.longitude != null && !Number.isNaN(props.latitude) && !Number.isNaN(props.longitude)
})

const iframeSrc = computed(() => {
  if (!hasCoordinates.value || !apiKey) return ''
  return `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${props.latitude},${props.longitude}&heading=${props.heading}&pitch=${props.pitch}&fov=${props.fov}`
})

const openInMapsUrl = computed(() => {
  if (!hasCoordinates.value) return ''
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${props.latitude},${props.longitude}`
})

const formattedCoordinates = computed(() => {
  if (!hasCoordinates.value) return ''
  const lat = props.latitude!
  const lng = props.longitude!
  return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`
})
</script>

<template>
  <section v-if="hasCoordinates" class="mt-14">
    <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">— {{ sectionNumber }} {{ t('streetView.sectionMeta') }}</p>
    <h2 class="mt-3 font-serif text-4xl font-light tracking-tight">{{ t('streetView.title') }}</h2>
    <p class="mt-3 max-w-4xl text-sm text-ink-muted dark:text-paper/70">{{ t('streetView.hint') }}</p>
    
    <div v-if="apiKey" class="mt-8 border border-ink/20 dark:border-paper/20">
      <div class="w-full aspect-[4/3] md:aspect-[21/9]">
        <iframe
          :src="iframeSrc"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          :title="t('streetView.iframeTitle')"
          class="block w-full h-full"
        ></iframe>
      </div>
    </div>
    
    <div v-else class="mt-8 border border-ink/20 dark:border-paper/20 bg-paper-warm dark:bg-night-elevated p-8 flex flex-col items-center justify-center text-center aspect-[4/3] md:aspect-[21/9]">
      <p class="font-mono text-xs font-bold tracking-widest text-ink-muted dark:text-paper/50 mb-2">STREET VIEW · UNAVAILABLE</p>
      <h3 class="font-serif text-2xl text-ink dark:text-paper mb-3">{{ t('streetView.unavailable.title') }}</h3>
      <p class="text-sm text-ink-muted dark:text-paper/60 max-w-md">{{ t('streetView.unavailable.description') }}</p>
    </div>
    
    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <p class="font-mono text-xs text-ink-muted dark:text-paper/65 uppercase tracking-wider">
        {{ formattedCoordinates }}
      </p>
      <a :href="openInMapsUrl" target="_blank" rel="noopener noreferrer" class="font-mono text-xs uppercase tracking-[0.14em] text-ink hover:text-accent dark:text-paper dark:hover:text-accent transition-colors flex items-center gap-2 underline underline-offset-4 decoration-ink/20 hover:decoration-accent dark:decoration-paper/20 dark:hover:decoration-accent">
        {{ t('streetView.openInMaps') }} →
      </a>
    </div>
  </section>
</template>
