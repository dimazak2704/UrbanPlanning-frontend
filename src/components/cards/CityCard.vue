<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { City } from '@/types/city'
import { formatNumber } from '@/utils/format'
import {
  MapPinIcon,
  UsersIcon,
  ArrowsPointingOutIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  city: City
}

defineProps<Props>()
</script>

<template>
  <RouterLink
    :to="`/cities/${city.id}`"
    class="group block rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-200 hover:-translate-y-0.5"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="text-base font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
          {{ city.name }}
        </h3>
        <p class="mt-0.5 text-sm text-slate-500">{{ city.region }}</p>
      </div>
      <div class="rounded-lg bg-primary-50 p-2 text-primary-600">
        <MapPinIcon class="h-5 w-5" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mt-4">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <UsersIcon class="h-4 w-4 text-slate-400" />
        <span>{{ formatNumber(city.population) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <ArrowsPointingOutIcon class="h-4 w-4 text-slate-400" />
        <span>{{ formatNumber(city.area) }} км²</span>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
      <span class="flex items-center gap-1 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Детальніше
        <ArrowRightIcon class="h-3.5 w-3.5" />
      </span>
    </div>
  </RouterLink>
</template>
