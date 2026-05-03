<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Infrastructure } from '@/types/infrastructure'
import BaseBadge from '@/components/common/BaseBadge.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue'
import {
  getInfrastructureTypeLabel,
  getInfrastructureStatusLabel,
  getInfrastructureStatusColor,
} from '@/utils/enum-labels'
import { formatCurrency } from '@/utils/format'
import { FolderIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  infrastructure: Infrastructure
}

defineProps<Props>()

const typeVariantMap: Record<string, string> = {
  TRANSPORT: 'blue',
  SOCIAL: 'teal',
  UTILITY: 'amber',
  RECREATIONAL: 'emerald',
  OTHER: 'slate',
}
</script>

<template>
  <RouterLink
    :to="`/infrastructures/${infrastructure.id}`"
    class="group block rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-200 hover:-translate-y-0.5"
  >
    <ImageWithFallback
      :src="infrastructure.imageUrl"
      :alt="infrastructure.name"
      fallback-class="h-40 w-full"
    />

    <div class="p-5">
      <div class="flex items-start justify-between gap-2 mb-3">
        <h3 class="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
          {{ infrastructure.name }}
        </h3>
      </div>

      <div class="flex flex-wrap gap-1.5 mb-3">
        <BaseBadge :variant="(typeVariantMap[infrastructure.type] || 'slate') as 'slate'">
          {{ getInfrastructureTypeLabel(infrastructure.type) }}
        </BaseBadge>
        <BaseBadge :custom-class="getInfrastructureStatusColor(infrastructure.status)">
          {{ getInfrastructureStatusLabel(infrastructure.status) }}
        </BaseBadge>
      </div>

      <div class="space-y-1.5 text-sm text-slate-500">
        <div class="flex items-center gap-1.5">
          <FolderIcon class="h-4 w-4 shrink-0 text-slate-400" />
          <span class="truncate">{{ infrastructure.projectName }}</span>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span class="text-sm font-semibold text-slate-900">
          {{ formatCurrency(infrastructure.cost) }}
        </span>
        <span class="flex items-center gap-1 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Детальніше
          <ArrowRightIcon class="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  </RouterLink>
</template>
