<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Project } from '@/types/project'
import BaseBadge from '@/components/common/BaseBadge.vue'
import ImageWithFallback from '@/components/common/ImageWithFallback.vue'
import { getProjectStatusColor } from '@/utils/enum-labels'
import { formatCurrency } from '@/utils/format'
import { PhArrowRight, PhMapPin, PhPencilSimple, PhTrash, PhUser } from '@phosphor-icons/vue'

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
    class="card-unified group"
  >
    <div v-if="showActions" class="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button @click.prevent="emit('edit', project)" class="border border-ink/15 bg-paper/90 p-2 text-ink-muted transition-colors hover:border-ink hover:text-ink dark:border-paper/30 dark:bg-night/85 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper">
        <PhPencilSimple :size="14" weight="light" />
      </button>
      <button @click.prevent="emit('delete', project)" class="border border-ink/15 bg-paper/90 p-2 text-ink-muted transition-colors hover:border-status-suspended hover:text-status-suspended dark:border-paper/30 dark:bg-night/85 dark:text-paper/65">
        <PhTrash :size="14" weight="light" />
      </button>
    </div>

    <ImageWithFallback
      :src="project.imageUrl"
      :alt="project.name"
      fallback-class="h-56 w-full"
    />

    <div class="space-y-4 p-6">
      <div class="flex items-center justify-between gap-3 border-b border-ink/10 pb-3 dark:border-night-border">
        <BaseBadge :custom-class="getProjectStatusColor(project.status)">
          {{ t(`enums.projectStatus.${project.status}`) }}
        </BaseBadge>
        <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">
          {{ project.updatedAt?.slice(0, 10) }}
        </p>
      </div>

      <div class="flex items-start justify-between gap-3">
        <h3 class="line-clamp-2 font-serif text-xl font-medium leading-tight tracking-tight text-ink transition-colors group-hover:text-accent dark:text-paper">
          {{ project.name }}
        </h3>
      </div>

      <div class="space-y-2 text-sm text-ink-muted dark:text-paper/70">
        <div class="flex items-center gap-2">
          <PhMapPin :size="15" weight="light" class="shrink-0" />
          <span class="truncate">{{ project.cityName }}, {{ project.districtName }}</span>
        </div>
        <div class="flex items-center gap-2">
          <PhUser :size="15" weight="light" class="shrink-0" />
          <span class="truncate">{{ project.architectFullName }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-ink/10 pt-4 dark:border-night-border">
        <span class="text-sm font-mono uppercase tracking-wider text-ink dark:text-paper">
          {{ formatCurrency(project.budget) }}
        </span>
        <span class="flex items-center gap-1 text-xs font-mono uppercase tracking-[0.14em] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 dark:text-paper/65">
          {{ t('common.details') }}
          <PhArrowRight :size="12" weight="light" />
        </span>
      </div>
    </div>
  </RouterLink>
</template>
