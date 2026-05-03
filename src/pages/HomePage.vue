<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  MapIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  BuildingLibraryIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

import StatCard from '@/components/dashboard/StatCard.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import ArchitectCard from '@/components/cards/ArchitectCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

import { getOverview, getProjectsByStatus, getProjectsByCity, getInfrastructuresByType, getTopArchitects, getProjectsTimeline } from '@/api/analytics.api'
import { getProjects } from '@/api/projects.api'
import { formatCurrency, formatNumber } from '@/utils/format'

import type { OverviewStats, ChartDataItem, TopArchitect, TimelinePoint } from '@/types/analytics'
import type { Project } from '@/types/project'

const loading = ref(true)
const overview = ref<OverviewStats | null>(null)
const projectsByStatus = ref<ChartDataItem[]>([])
const projectsByCity = ref<ChartDataItem[]>([])
const infraByType = ref<ChartDataItem[]>([])
const topArchitects = ref<TopArchitect[]>([])
const timeline = ref<TimelinePoint[]>([])
const recentProjects = ref<Project[]>([])

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
    if (statusRes.status === 'fulfilled') projectsByStatus.value = statusRes.value.data
    if (cityRes.status === 'fulfilled') projectsByCity.value = cityRes.value.data
    if (infraRes.status === 'fulfilled') infraByType.value = infraRes.value.data
    if (archRes.status === 'fulfilled') topArchitects.value = archRes.value.data
    if (timeRes.status === 'fulfilled') timeline.value = timeRes.value.data
    if (projRes.status === 'fulfilled') recentProjects.value = projRes.value.data.content
  } finally {
    loading.value = false
  }
})

const timelineChartData = ref<{ x: string; y: number }[]>([])

import { watch } from 'vue'
watch(timeline, (val) => {
  timelineChartData.value = val.map((p) => ({ x: p.date, y: p.count }))
}, { immediate: true })
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900">
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
        <div class="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div class="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-accent-400/5 blur-2xl" />
      </div>

      <div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div class="text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-primary-200 backdrop-blur-sm">
            <span class="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />

          </div>

          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Urban
            <span class="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">Planning</span>
            Platform
          </h1>

          <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Сучасна платформа для управління містобудівними проєктами України —
            моніторинг, аналітика, карти та портфоліо архітекторів
          </p>

          <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <RouterLink
              to="/map"
              class="group inline-flex items-center gap-2.5 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/30 transition-all hover:bg-accent-600 hover:shadow-xl"
            >
              <MapIcon class="h-5 w-5" />
              Дивитись карту
              <ArrowRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </RouterLink>
            <RouterLink
              to="/projects"
              class="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <DocumentTextIcon class="h-5 w-5" />
              Переглянути проєкти
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- KPI Cards -->
    <section class="relative -mt-10 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <div v-for="i in 6" :key="i" class="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
          <div class="h-4 w-20 rounded bg-slate-200 mb-3" />
          <div class="h-8 w-24 rounded bg-slate-200" />
        </div>
      </div>
      <div v-else-if="overview" class="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          :icon="BuildingOffice2Icon" label="Міста" :value="formatNumber(overview.totalCities)"
          color-class="bg-primary-50 text-primary-600" to="/cities"
        />
        <StatCard
          :icon="BuildingLibraryIcon" label="Райони" :value="formatNumber(overview.totalDistricts)"
          color-class="bg-blue-50 text-blue-600"
        />
        <StatCard
          :icon="DocumentTextIcon" label="Проєкти" :value="formatNumber(overview.totalProjects)"
          color-class="bg-accent-50 text-accent-600" to="/projects"
        />
        <StatCard
          :icon="WrenchScrewdriverIcon" label="Інфраструктура" :value="formatNumber(overview.totalInfrastructures)"
          color-class="bg-amber-50 text-amber-600" to="/infrastructures"
        />
        <StatCard
          :icon="UserGroupIcon" label="Архітектори" :value="formatNumber(overview.totalArchitects)"
          color-class="bg-emerald-50 text-emerald-600" to="/architects"
        />
        <StatCard
          :icon="CurrencyDollarIcon" label="Загальний бюджет" :value="formatCurrency(overview.totalBudget)"
          color-class="bg-violet-50 text-violet-600"
        />
      </div>
    </section>

    <!-- Charts -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 class="mb-8 text-2xl font-bold text-slate-900">Аналітика</h2>
      <div v-if="loading" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
          <div class="h-5 w-40 rounded bg-slate-200 mb-4" />
          <div class="h-64 rounded-lg bg-slate-100" />
        </div>
      </div>
      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieChart :data="projectsByStatus" title="Проєкти за статусом" />
        <BarChart :data="projectsByCity" title="Топ міст за кількістю проєктів" />
        <PieChart :data="infraByType" title="Інфраструктура за типом" />
        <LineChart :data="timelineChartData" title="Динаміка запуску проєктів" />
      </div>
    </section>

    <!-- Top Architects -->
    <section v-if="topArchitects.length > 0" class="bg-white py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Топ архітекторів</h2>
          <RouterLink to="/architects" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1">
            Всі архітектори <ArrowRightIcon class="h-4 w-4" />
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ArchitectCard
            v-for="arch in topArchitects"
            :key="arch.id"
            :architect="{ id: arch.id, fullName: arch.fullName, email: '', specialization: '', experienceYears: 0, avatarUrl: null, projectsCount: arch.projectsCount, createdAt: '' }"
          />
        </div>
      </div>
    </section>

    <!-- Recent Projects -->
    <section v-if="recentProjects.length > 0" class="py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Актуальні проєкти</h2>
          <RouterLink to="/projects" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1">
            Всі проєкти <ArrowRightIcon class="h-4 w-4" />
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCard v-for="proj in recentProjects" :key="proj.id" :project="proj" />
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-r from-primary-900 to-primary-800 py-16">
      <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white mb-4">Досліджуйте всі можливості платформи</h2>
        <p class="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
          Перегляньте інтерактивну карту з усіма проєктами та інфраструктурою міст України
        </p>
        <RouterLink
          to="/map"
          class="inline-flex items-center gap-2.5 rounded-xl bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-600"
        >
          <MapIcon class="h-5 w-5" />
          Відкрити карту
          <ArrowRightIcon class="h-4 w-4" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
