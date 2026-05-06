<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhArrowLeft } from '@phosphor-icons/vue'

const { t } = useI18n()
</script>

<template>
  <div class="container-app flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <div class="mb-8 border border-ink/15 px-6 py-3 text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:border-paper/25 dark:text-paper/65">
      404 / ROUTE_MISSING
    </div>
    <h1 class="mb-3 font-serif text-7xl font-light tracking-tight text-ink dark:text-paper">404</h1>
    <p class="mb-10 text-base leading-relaxed text-ink-muted dark:text-paper/70">{{ t('errors.pageNotFound') }}</p>
    <RouterLink
      to="/"
      class="inline-flex items-center gap-2 border border-ink bg-ink px-8 py-4 text-sm font-mono uppercase tracking-wider text-paper transition-colors hover:bg-accent hover:border-accent dark:border-paper dark:bg-paper dark:text-night"
    >
      <PhArrowLeft :size="14" weight="light" />
      {{ t('header.home') }}
    </RouterLink>
  </div>
</template>
