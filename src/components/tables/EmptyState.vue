<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhBlueprint } from '@phosphor-icons/vue'

interface Props {
  title?: string
  description?: string
  actionLabel?: string
  actionTo?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  actionLabel: '',
  actionTo: '',
})

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="mb-6 border border-ink/15 p-5 text-ink-muted dark:border-paper/25 dark:text-paper/65">
      <slot name="icon">
        <PhBlueprint :size="40" weight="thin" />
      </slot>
    </div>
    <h3 class="mb-2 font-serif text-3xl font-medium tracking-tight text-ink dark:text-paper">{{ title || t('common.noData') }}</h3>
    <p class="max-w-xl text-base leading-relaxed text-ink-muted dark:text-paper/70">{{ description || t('common.noData') }}</p>
    <RouterLink
      v-if="actionLabel && actionTo"
      :to="actionTo"
      class="mt-8 inline-flex items-center gap-2 border border-ink bg-ink px-8 py-4 text-sm font-mono uppercase tracking-wider text-paper transition-colors hover:bg-accent hover:border-accent dark:border-paper dark:bg-paper dark:text-night"
    >
      {{ actionLabel }}
    </RouterLink>
  </div>
</template>
