<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhX } from '@phosphor-icons/vue'
import { useCompareStore, MAX_COMPARE_PROJECTS } from '@/stores/compare.store'

const compareStore = useCompareStore()
const router = useRouter()
const { t } = useI18n()

const selectedProjects = computed(() => compareStore.projects)
const emptySlots = computed(() => Math.max(0, MAX_COMPARE_PROJECTS - selectedProjects.value.length))
const compareUrl = computed(() => `/projects/compare?ids=${selectedProjects.value.map((p) => p.id).join(',')}`)
const canCompare = computed(() => selectedProjects.value.length >= 2)

function goToCompare() {
  if (!canCompare.value) return
  router.push(compareUrl.value)
}

function goToProject(id: number) {
  router.push(`/projects/${id}`)
}
</script>

<template>
  <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-full opacity-0">
    <section
      v-if="compareStore.count > 0"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-paper/95 backdrop-blur-md dark:border-night-border dark:bg-night/95"
      role="region"
      :aria-label="t('compare.barRegionLabel')"
    >
      <div class="container-app py-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-start gap-6">
            <div>
              <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">{{ t('compare.barTitle') }}</p>
              <p class="mt-1 font-serif text-3xl text-accent">{{ compareStore.count }}</p>
              <p class="text-xs font-mono uppercase tracking-[0.15em] text-ink-muted dark:text-paper/65">
                {{ t('compare.barCount', compareStore.count, { count: compareStore.count }) }}
              </p>
            </div>

            <div class="flex max-w-[60vw] gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <div
                v-for="project in selectedProjects"
                :key="project.id"
                class="group relative h-16 w-20 shrink-0 border border-ink/15 bg-paper-warm dark:border-night-border dark:bg-night-soft"
              >
                <button
                  type="button"
                  class="absolute right-1 top-1 z-10 border border-ink/20 bg-paper/90 p-0.5 text-ink-muted transition-colors hover:border-status-suspended hover:text-status-suspended dark:border-paper/30 dark:bg-night/90 dark:text-paper/70"
                  :aria-label="t('compare.removeProjectAria', { name: project.name })"
                  @click="compareStore.remove(project.id)"
                >
                  <PhX :size="10" weight="bold" />
                </button>
                <button
                  type="button"
                  class="h-full w-full text-left"
                  @click="goToProject(project.id)"
                >
                  <img
                    v-if="project.imageUrl"
                    :src="project.imageUrl"
                    :alt="project.name"
                    class="h-full w-full object-cover"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-mono uppercase tracking-[0.12em] text-ink-muted dark:text-paper/70">
                    {{ project.name.slice(0, 2) }}
                  </div>
                </button>
              </div>

              <div
                v-for="slot in emptySlots"
                :key="`slot-${slot}`"
                class="flex h-16 w-20 shrink-0 items-center justify-center border border-dashed border-ink/20 text-[10px] font-mono uppercase tracking-[0.12em] text-ink-subtle dark:border-paper/30 dark:text-paper/45"
              >
                {{ t('compare.emptySlot') }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="border border-ink/20 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink dark:border-paper/30 dark:text-paper dark:hover:border-paper"
              @click="compareStore.clear"
            >
              {{ t('compare.clearAll') }}
            </button>
            <button
              type="button"
              class="border px-5 py-2 text-xs font-mono uppercase tracking-[0.14em] transition-colors"
              :class="canCompare ? 'border-ink bg-ink text-paper hover:border-accent hover:bg-accent dark:border-paper dark:bg-paper dark:text-night' : 'cursor-not-allowed border-ink/20 text-ink-muted opacity-60 dark:border-paper/25 dark:text-paper/55'"
              :disabled="!canCompare"
              :title="!canCompare ? t('compare.needAtLeastTwo') : t('compare.compareNow')"
              @click="goToCompare"
            >
              {{ t('compare.compareNowWithArrow') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </transition>
</template>
