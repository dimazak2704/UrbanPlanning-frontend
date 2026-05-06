<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Project } from '@/types/project'
import BaseBadge from '@/components/common/BaseBadge.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue'
import { getProjectStatusColor } from '@/utils/enum-labels'
import { formatCurrency } from '@/utils/format'
import { MapPinIcon, UserIcon, ArrowRightIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

interface Props {
  project: Project
  showActions?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', project: Project): void
  (e: 'delete', project: Project): void
}>()

const { t } = useI18n()
</script>

<template>
  <RouterLink
    :to="`/projects/${project.id}`"
    class="group block rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-200 hover:-translate-y-0.5 relative"
  >
    <div v-if="showActions" class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button @click.prevent="emit('edit', project)" class="rounded-lg bg-white/90 p-1.5 text-slate-700 hover:bg-white hover:text-primary-600 shadow-sm backdrop-blur-sm transition-colors">
        <PencilSquareIcon class="h-4 w-4" />
      </button>
      <button @click.prevent="emit('delete', project)" class="rounded-lg bg-white/90 p-1.5 text-slate-700 hover:bg-white hover:text-red-600 shadow-sm backdrop-blur-sm transition-colors">
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>

    <ImageWithFallback
      :src="project.imageUrl"
      :alt="project.name"
      fallback-class="h-44 w-full"
    />

    <div class="p-5">
      <div class="flex items-start justify-between gap-2 mb-3">
        <h3 class="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-primary-700 transition-colors pr-6">
          {{ project.name }}
        </h3>
        <BaseBadge :custom-class="getProjectStatusColor(project.status)">
          {{ t(`enums.projectStatus.${project.status}`) }}
        </BaseBadge>
      </div>

      <div class="space-y-2 text-sm text-slate-500">
        <div class="flex items-center gap-1.5">
          <MapPinIcon class="h-4 w-4 shrink-0 text-slate-400" />
          <span class="truncate">{{ project.cityName }}, {{ project.districtName }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <UserIcon class="h-4 w-4 shrink-0 text-slate-400" />
          <span class="truncate">{{ project.architectFullName }}</span>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span class="text-sm font-semibold text-slate-900">
          {{ formatCurrency(project.budget) }}
        </span>
        <span class="flex items-center gap-1 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
          {{ t('common.details') }}
          <ArrowRightIcon class="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  </RouterLink>
</template>
