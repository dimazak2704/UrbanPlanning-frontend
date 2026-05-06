<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Architect } from '@/types/architect'
import AvatarImg from '@/components/common/AvatarImg.vue'
import { BriefcaseIcon, FolderIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  architect: Architect
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <RouterLink
    :to="`/architects/${architect.id}`"
    class="group block rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-200 hover:-translate-y-0.5"
  >
    <div class="flex items-center gap-4 mb-4">
      <AvatarImg
        :src="architect.avatarUrl"
        :name="architect.fullName"
        size="lg"
      />
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
          {{ architect.fullName }}
        </h3>
        <p class="text-sm text-slate-500 truncate">{{ architect.specialization }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <BriefcaseIcon class="h-4 w-4 text-slate-400" />
        <span>{{ architect.experienceYears }} {{ t('common.years') }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <FolderIcon class="h-4 w-4 text-slate-400" />
        <span>{{ architect.projectsCount }} {{ t('architects.projectsCount') }}</span>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
      <span class="flex items-center gap-1 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
        {{ t('common.details') }}
        <ArrowRightIcon class="h-3.5 w-3.5" />
      </span>
    </div>
  </RouterLink>
</template>
