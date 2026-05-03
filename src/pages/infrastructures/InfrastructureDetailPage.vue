<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { ChevronRightIcon, PencilSquareIcon, TrashIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getInfrastructureById, deleteInfrastructure } from '@/api/infrastructures.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatCurrency } from '@/utils/format'
import { getInfrastructureTypeLabel, getInfrastructureStatusLabel, getInfrastructureStatusColor } from '@/utils/enum-labels'
import type { Infrastructure } from '@/types/infrastructure'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const itemId = computed(() => Number(route.params.id))
const loading = ref(true)
const item = ref<Infrastructure | null>(null)
const showDelete = ref(false)
const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null

async function fetchItem() {
  loading.value = true
  try { const { data } = await getInfrastructureById(itemId.value); item.value = data }
  catch (err) { toast.error(err instanceof Error ? err.message : 'Помилка'); router.push('/infrastructures') }
  finally { loading.value = false }
}

function initMap() {
  if (!mapContainer.value || !item.value) return
  map = L.map(mapContainer.value).setView([item.value.latitude, item.value.longitude], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
  L.marker([item.value.latitude, item.value.longitude]).addTo(map).bindPopup(`<b>${item.value.name}</b>`)
}

async function handleDelete() {
  try { await deleteInfrastructure(itemId.value); toast.success('Видалено'); router.push('/infrastructures') }
  catch (err) { toast.error(err instanceof Error ? err.message : 'Помилка') }
}

onMounted(async () => { await fetchItem(); setTimeout(initMap, 100) })
</script>

<template>
  <div>
    <LoadingSpinner v-if="loading" size="lg" />
    <template v-else-if="item">
      <div class="relative h-72 sm:h-80">
        <ImageWithFallback :src="item.imageUrl" :alt="item.name" fallback-class="h-full w-full" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8 mx-auto max-w-7xl">
          <div class="flex gap-2 mb-2">
            <BaseBadge variant="teal">{{ getInfrastructureTypeLabel(item.type) }}</BaseBadge>
            <BaseBadge :custom-class="getInfrastructureStatusColor(item.status)">{{ getInfrastructureStatusLabel(item.status) }}</BaseBadge>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-white">{{ item.name }}</h1>
        </div>
      </div>
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="sticky top-16 z-40 -mx-4 px-4 py-3 bg-slate-50/90 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 border-b border-slate-200">
          <nav class="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
            <RouterLink to="/" class="hover:text-slate-700">Головна</RouterLink>
            <ChevronRightIcon class="h-3.5 w-3.5" />
            <RouterLink to="/infrastructures" class="hover:text-slate-700">Інфраструктура</RouterLink>
            <ChevronRightIcon class="h-3.5 w-3.5" />
            <span class="text-slate-900 font-medium">{{ item.name }}</span>
          </nav>
        </div>
        <div v-if="auth.isAuthenticated" class="flex gap-2 mb-6">
          <RouterLink :to="`/infrastructures/${item.id}/edit`">
            <BaseButton variant="secondary" size="sm"><template #iconLeft><PencilSquareIcon class="h-4 w-4" /></template>Редагувати</BaseButton>
          </RouterLink>
          <BaseButton variant="danger" size="sm" @click="showDelete = true"><template #iconLeft><TrashIcon class="h-4 w-4" /></template>Видалити</BaseButton>
        </div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <div class="lg:col-span-2 space-y-6">
            <div v-if="item.description" class="rounded-xl border border-slate-200 bg-white p-6">
              <h2 class="text-lg font-semibold text-slate-900 mb-3">Опис</h2>
              <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ item.description }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><CurrencyDollarIcon class="h-4 w-4" />Вартість</div>
                <p class="text-lg font-bold text-slate-900">{{ formatCurrency(item.cost) }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><MapPinIcon class="h-4 w-4" />Проєкт</div>
                <RouterLink :to="`/projects/${item.projectId}`" class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ item.projectName }}</RouterLink>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-white p-5">
              <p class="text-xs text-slate-500 mb-1">Місто / Район</p>
              <RouterLink :to="`/cities/${item.cityId}`" class="text-sm font-medium text-primary-600">{{ item.cityName }}</RouterLink>
              <span class="text-sm text-slate-400"> / </span>
              <RouterLink :to="`/districts/${item.districtId}`" class="text-sm font-medium text-primary-600">{{ item.districtName }}</RouterLink>
            </div>
          </div>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-slate-900 mb-4">Карта</h2>
          <div ref="mapContainer" class="h-72 rounded-xl border border-slate-200 overflow-hidden z-0" />
        </div>
      </div>
      <teleport to="body">
        <div v-if="showDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Видалити об'єкт?</h3>
            <p class="text-sm text-slate-500 mb-6">Цю дію неможливо скасувати.</p>
            <div class="flex justify-end gap-3">
              <BaseButton variant="secondary" size="sm" @click="showDelete = false">Скасувати</BaseButton>
              <BaseButton variant="danger" size="sm" @click="handleDelete">Видалити</BaseButton>
            </div>
          </div>
        </div>
      </teleport>
    </template>
  </div>
</template>
