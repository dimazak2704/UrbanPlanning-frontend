<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Architect } from '@/types/architect'
import AvatarImg from '@/components/common/AvatarImg.vue'
import { PhArrowRight, PhBriefcase, PhFolder } from '@phosphor-icons/vue'

interface Props {
  architect: Architect
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <RouterLink
    :to="`/architects/${architect.id}`"
    class="card-unified group"
  >
    <div class="mb-5 flex items-center gap-4">
      <AvatarImg
        :src="architect.avatarUrl"
        :name="architect.fullName"
        size="lg"
      />
      <div class="min-w-0">
        <h3 class="truncate font-serif text-xl font-medium tracking-tight text-ink transition-colors group-hover:text-accent dark:text-paper">
          {{ architect.fullName }}
        </h3>
        <p class="truncate text-xs font-mono uppercase tracking-[0.16em] text-ink-muted dark:text-paper/65">{{ architect.specialization }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 border-t border-ink/10 pt-4 dark:border-night-border">
      <div class="flex items-center gap-2 text-sm text-ink-muted dark:text-paper/70">
        <PhBriefcase :size="15" weight="light" />
        <span>{{ architect.experienceYears }} {{ t('common.years') }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-ink-muted dark:text-paper/70">
        <PhFolder :size="15" weight="light" />
        <span>{{ architect.projectsCount }} {{ t('architects.projectsCount') }}</span>
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
