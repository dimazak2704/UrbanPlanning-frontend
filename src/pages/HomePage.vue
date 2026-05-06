<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { PhArrowRight } from '@phosphor-icons/vue'

import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import ArchitectCard from '@/components/cards/ArchitectCard.vue'
import { getArchitectById } from '@/api/architects.api'

import { getOverview, getProjectsByStatus, getProjectsByCity, getInfrastructuresByType, getTopArchitects, getProjectsTimeline } from '@/api/analytics.api'
import { getProjects } from '@/api/projects.api'
import { formatCurrency, formatNumber, formatCompactCurrency } from '@/utils/format'
import type { OverviewStats, CountByEnum, CityProjectsStats, TopArchitect, TimelinePoint } from '@/types/analytics'
import type { Project } from '@/types/project'
import type { Architect } from '@/types/architect'

const loading = ref(true)
const overview = ref<OverviewStats | null>(null)
const projectsByStatusRaw = ref<CountByEnum[]>([])
const projectsByCityRaw = ref<CityProjectsStats[]>([])
const infraByTypeRaw = ref<CountByEnum[]>([])
const topArchitects = ref<TopArchitect[]>([])
const topArchitectsDetails = ref<Record<number, Architect>>({})
const timelineRaw = ref<TimelinePoint[]>([])
const recentProjects = ref<Project[]>([])

const { t } = useI18n()

// Mapped chart data
const projectsByStatus = computed(() =>
  projectsByStatusRaw.value.map(d => ({ label: t(`enums.projectStatus.${d.label}`), value: d.count }))
)
const projectsByCity = computed(() =>
  projectsByCityRaw.value.map(d => ({ label: d.cityName, value: d.projectsCount }))
)
const infraByType = computed(() =>
  infraByTypeRaw.value.map(d => ({ label: t(`enums.infrastructureType.${d.label}`), value: d.count }))
)
const timelineChartData = computed(() =>
  timelineRaw.value.map(d => ({ x: d.period, y: d.count }))
)

const kpiItems = computed(() => {
  if (!overview.value) return []

  return [
    { label: t('home.kpiCities'), value: formatNumber(overview.value.totalCities), to: '/cities' },
    { label: t('home.kpiDistricts'), value: formatNumber(overview.value.totalDistricts) },
    { label: t('home.kpiProjects'), value: formatNumber(overview.value.totalProjects), to: '/projects' },
    { label: t('home.kpiInfrastructures'), value: formatNumber(overview.value.totalInfrastructures), to: '/infrastructures' },
    { label: t('home.kpiArchitects'), value: formatNumber(overview.value.totalArchitects), to: '/architects' },
    { label: t('home.kpiBudget'), value: formatCompactCurrency(overview.value.totalProjectsBudget) },
  ]
})

const featuredProjects = computed(() => recentProjects.value.slice(0, 6))

onMounted(async () => {
  try {
    const [ovRes, statusRes, cityRes, infraRes, archRes, timeRes, projRes] = await Promise.allSettled([
      getOverview(),
      getProjectsByStatus(),
      getProjectsByCity(7),
      getInfrastructuresByType(),
      getTopArchitects(4),
      getProjectsTimeline(),
      getProjects(undefined, { page: 0, size: 6, sort: 'updatedAt,desc' }),
    ])

    if (ovRes.status === 'fulfilled') overview.value = ovRes.value.data
    if (statusRes.status === 'fulfilled') projectsByStatusRaw.value = statusRes.value.data
    if (cityRes.status === 'fulfilled') projectsByCityRaw.value = cityRes.value.data
    if (infraRes.status === 'fulfilled') infraByTypeRaw.value = infraRes.value.data
    if (archRes.status === 'fulfilled') topArchitects.value = archRes.value.data
    if (timeRes.status === 'fulfilled') timelineRaw.value = timeRes.value.data
    if (projRes.status === 'fulfilled') recentProjects.value = projRes.value.data.content

    if (topArchitects.value.length > 0) {
      const detailResults = await Promise.allSettled(
        topArchitects.value.map((a) => getArchitectById(a.architectId)),
      )
      const next: Record<number, Architect> = {}
      detailResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const architectId = topArchitects.value[idx]?.architectId
          if (architectId) next[architectId] = result.value.data
        }
      })
      topArchitectsDetails.value = next
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-paper text-ink dark:bg-night dark:text-paper">
    <section class="container-app min-h-[calc(100vh-80px)] py-10 md:py-16">
      <div class="grid min-h-[70vh] grid-cols-1 gap-12 border-b border-ink/10 pb-16 dark:border-night-border lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div class="space-y-8">
          <p class="text-xs font-mono uppercase tracking-[0.22em] text-ink-muted dark:text-paper/65">001 / PLATFORM</p>
          <h1 class="text-6xl font-serif font-light tracking-tight md:text-8xl">
            {{ t('home.editorialTitleLine1') }}<br>{{ t('home.editorialTitleLine2') }}<br>{{ t('home.editorialTitleLine3') }}
          </h1>
          <p class="max-w-2xl text-base leading-relaxed text-ink-muted dark:text-paper/75">
            {{ t('home.heroDescription') }}
          </p>
          <div class="flex flex-wrap items-center gap-6 pt-2">
            <RouterLink to="/map" class="inline-flex items-center gap-2 border border-ink bg-ink px-8 py-4 text-sm font-mono uppercase tracking-wider text-paper transition-colors hover:bg-accent hover:border-accent dark:border-paper dark:bg-paper dark:text-night">
              {{ t('home.viewMap') }}
              <PhArrowRight :size="16" weight="light" />
            </RouterLink>
            <RouterLink to="/projects" class="inline-flex items-center gap-2 border border-ink px-8 py-4 text-sm font-mono uppercase tracking-wider transition-colors hover:bg-ink hover:text-paper dark:border-paper dark:hover:bg-paper dark:hover:text-night">
              {{ t('home.browseProjects') }}
            </RouterLink>
          </div>
        </div>
        <div class="relative h-full min-h-[340px] overflow-hidden border border-ink/10 dark:border-night-border">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.16),transparent_48%),radial-gradient(circle_at_80%_70%,rgba(79,70,229,0.16),transparent_42%)]" />
          <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,10,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,10,10,0.08)_1px,transparent_1px)] bg-[size:44px_44px] dark:bg-[linear-gradient(to_right,rgba(250,250,247,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,250,247,0.06)_1px,transparent_1px)]" />
          <div class="absolute left-8 top-16 h-24 w-24 animate-pulse rounded-full border border-accent/40" />
          <div class="absolute bottom-16 right-10 h-28 w-28 animate-pulse rounded-full border border-ink/25 dark:border-paper/30" style="animation-delay: 700ms;" />
          <div class="absolute bottom-10 left-8 right-8 border border-ink/15 bg-paper/60 p-4 backdrop-blur-sm dark:border-paper/20 dark:bg-night/45">
            <p class="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-muted dark:text-paper/65">Urban Dynamics / Live Overview</p>
            <p class="mt-2 text-xs font-mono text-ink-muted dark:text-paper/60">Моніторинг проєктів, міст, інфраструктури в реальному часі</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container-app py-16 md:py-20">
      <div class="mb-10 text-xs font-mono uppercase tracking-[0.22em] text-ink-muted dark:text-paper/65">— 00 OVERVIEW</div>
      <div v-if="loading" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <div v-for="i in 6" :key="i" class="border-r border-ink/10 pr-6 last:border-r-0 dark:border-night-border">
          <p class="animate-pulse text-5xl font-serif">000</p>
        </div>
      </div>
      <div v-else-if="overview" class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-6">
        <component
          :is="item.to ? RouterLink : 'div'"
          v-for="item in kpiItems"
          :key="item.label"
          :to="item.to"
          class="border-r border-ink/10 pr-6 transition-colors last:border-r-0 hover:text-accent dark:border-night-border"
        >
          <p class="text-5xl font-serif font-light md:text-6xl">{{ item.value }}</p>
          <p class="mt-3 text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">{{ item.label }}</p>
        </component>
      </div>
    </section>

    <section class="container-app py-16 md:py-20">
      <p class="mb-3 text-xs font-mono uppercase tracking-[0.22em] text-ink-muted dark:text-paper/65">— 01 ANALYTICS</p>
      <h2 class="mb-12 text-4xl font-serif font-medium tracking-tight">{{ t('home.analytics') }}</h2>
      <div v-if="loading" class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div v-for="i in 4" :key="i" class="border-t border-ink/10 pt-5 dark:border-night-border">
          <div class="h-64 animate-pulse bg-paper-warm dark:bg-night-elevated" />
        </div>
      </div>
      <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PieChart :data="projectsByStatus" :title="t('home.projectsByStatus')" />
        <BarChart :data="projectsByCity" :title="t('home.topCitiesByProjects')" />
        <PieChart :data="infraByType" :title="t('home.infraByType')" />
        <LineChart :data="timelineChartData" :title="t('home.projectsTimeline')" />
      </div>
    </section>

    <section v-if="topArchitects.length > 0" class="container-app py-16 md:py-20">
      <div class="mb-10 flex items-end justify-between gap-6">
        <h2 class="text-4xl font-serif font-medium tracking-tight">{{ t('home.topArchitects') }}</h2>
        <RouterLink to="/architects" class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-accent dark:text-paper/65">
          {{ t('home.allArchitects') }} <PhArrowRight :size="14" weight="light" />
        </RouterLink>
      </div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ArchitectCard
          v-for="arch in topArchitects"
          :key="arch.architectId"
          :architect="{
            id: arch.architectId,
            firstName: '',
            lastName: '',
            patronymic: null,
            fullName: arch.fullName,
            email: '',
            specialization: arch.specialization,
            experienceYears: topArchitectsDetails[arch.architectId]?.experienceYears ?? 0,
            phoneNumber: null,
            bio: null,
            active: true,
            avatarUrl: arch.avatarUrl ?? null,
            projectsCount: arch.projectsCount,
            createdAt: ''
          }"
        />
      </div>
    </section>

    <section v-if="recentProjects.length > 0" class="container-app py-16 md:py-20">
      <div class="mb-10 flex items-end justify-between gap-6">
        <h2 class="text-4xl font-serif font-medium tracking-tight">{{ t('home.recentProjects') }}</h2>
        <RouterLink to="/projects" class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-accent dark:text-paper/65">
          {{ t('home.allProjects') }} <PhArrowRight :size="14" weight="light" />
        </RouterLink>
      </div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard v-for="proj in featuredProjects" :key="proj.id" :project="proj" />
      </div>
    </section>

    <section class="bg-paper-warm py-16 text-ink dark:bg-night dark:py-20 dark:text-paper">
      <div class="container-app">
        <p class="mb-4 text-xs font-mono uppercase tracking-[0.22em] text-ink-muted dark:text-paper/55">— 02 MAP ACCESS</p>
        <h2 class="mb-6 max-w-3xl text-4xl font-serif font-light tracking-tight md:text-6xl">{{ t('home.ctaTitle') }}</h2>
        <p class="mb-10 max-w-3xl text-base leading-relaxed text-ink-muted dark:text-paper/75">{{ t('home.ctaDescription') }}</p>
        <RouterLink
          to="/map"
          class="inline-flex items-center gap-2 border border-ink bg-ink px-8 py-4 text-sm font-mono uppercase tracking-wider text-paper transition-colors hover:bg-accent hover:border-accent dark:border-paper dark:bg-paper dark:text-night"
        >
          {{ t('home.openMap') }}
          <PhArrowRight :size="15" weight="light" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
