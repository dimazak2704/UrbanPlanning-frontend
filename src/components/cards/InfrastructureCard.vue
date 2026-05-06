<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Infrastructure } from '@/types/infrastructure'
import BaseBadge from '@/components/common/BaseBadge.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue'
import {
  getInfrastructureStatusColor,
} from '@/utils/enum-labels'
import { formatCurrency } from '@/utils/format'
import { PhArrowRight, PhFolder } from '@phosphor-icons/vue'

interface Props {
  infrastructure: Infrastructure
}

defineProps<Props>()

const { t } = useI18n()

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
    class="card-unified group"
  >
    <ImageWithFallback
      :src="infrastructure.imageUrl"
      :alt="infrastructure.name"
      fallback-class="h-56 w-full"
    />

    <div class="space-y-4 p-6">
      <div class="flex items-start justify-between gap-2">
        <h3 class="line-clamp-2 font-serif text-xl font-medium tracking-tight text-ink transition-colors group-hover:text-accent dark:text-paper">
          {{ infrastructure.name }}
        </h3>
      </div>

      <div class="flex flex-wrap gap-2 border-t border-ink/10 pt-3 dark:border-night-border">
        <BaseBadge :variant="(typeVariantMap[infrastructure.type] || 'slate') as 'slate'">
          {{ t(`enums.infrastructureType.${infrastructure.type}`) }}
        </BaseBadge>
        <BaseBadge :custom-class="getInfrastructureStatusColor(infrastructure.status)">
          {{ t(`enums.infrastructureStatus.${infrastructure.status}`) }}
        </BaseBadge>
      </div>

      <div class="space-y-1.5 text-sm text-ink-muted dark:text-paper/70">
        <div class="flex items-center gap-2">
          <PhFolder :size="15" weight="light" class="shrink-0" />
          <span class="truncate">{{ infrastructure.projectName }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-ink/10 pt-4 dark:border-night-border">
        <span class="text-sm font-mono uppercase tracking-wider text-ink dark:text-paper">
          {{ formatCurrency(infrastructure.budget) }}
        </span>
        <span class="flex items-center gap-1 text-xs font-mono uppercase tracking-[0.14em] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 dark:text-paper/65">
          {{ t('common.details') }}
          <PhArrowRight :size="12" weight="light" />
        </span>
      </div>
    </div>
  </RouterLink>
</template>
