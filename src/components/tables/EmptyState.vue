<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { InboxIcon } from '@heroicons/vue/24/outline'

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
    <div class="mb-4 rounded-full bg-slate-100 p-4">
      <slot name="icon">
        <InboxIcon class="h-10 w-10 text-slate-400" />
      </slot>
    </div>
    <h3 class="text-lg font-semibold text-slate-900 mb-1">{{ title || t('common.noData') }}</h3>
    <p class="text-sm text-slate-500 max-w-sm">{{ description || t('common.noData') }}</p>
    <RouterLink
      v-if="actionLabel && actionTo"
      :to="actionTo"
      class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700"
    >
      {{ actionLabel }}
    </RouterLink>
  </div>
</template>
