<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { City } from '@/types/city'
import { formatNumber } from '@/utils/format'
import { PhArrowRight, PhArrowsOut, PhMapPin, PhUsers } from '@phosphor-icons/vue'

interface Props {
  city: City
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <RouterLink
    :to="`/cities/${city.id}`"
    class="card-unified group"
  >
    <div class="mb-4 flex items-start justify-between">
      <div>
        <h3 class="font-serif text-2xl font-medium tracking-tight text-ink transition-colors group-hover:text-accent dark:text-paper">
          {{ city.name }}
        </h3>
        <p class="mt-1 text-xs font-mono uppercase tracking-[0.18em] text-ink-muted dark:text-paper/65">{{ city.region }}</p>
      </div>
      <div class="border border-ink/20 p-2 text-ink-muted dark:border-paper/25 dark:text-paper/65">
        <PhMapPin :size="18" weight="light" />
      </div>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-6 border-t border-ink/10 pt-4 dark:border-night-border">
      <div class="flex items-center gap-2 text-sm text-ink-muted dark:text-paper/70">
        <PhUsers :size="15" weight="light" />
        <span>{{ formatNumber(city.population) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-ink-muted dark:text-paper/70">
        <PhArrowsOut :size="15" weight="light" />
        <span>{{ formatNumber(city.area) }} {{ t('common.km2') }}</span>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-end border-t border-ink/10 pt-4 dark:border-night-border">
      <span class="flex items-center gap-1 text-xs font-mono uppercase tracking-[0.14em] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 dark:text-paper/65">
        {{ t('common.details') }}
        <PhArrowRight :size="12" weight="light" />
      </span>
    </div>
  </RouterLink>
</template>
