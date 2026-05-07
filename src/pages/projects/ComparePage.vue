<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import RadarChart from '@/components/charts/RadarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { getProjectById } from '@/api/projects.api'
import { getInfrastructures } from '@/api/infrastructures.api'
import { useCompareStore } from '@/stores/compare.store'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'
import { getProjectDurationMonths, normalizeMetric } from '@/utils/compare'
import { getProjectStatusColor } from '@/utils/enum-labels'
import type { Project } from '@/types/project'
import type { Infrastructure } from '@/types/infrastructure'
import type { InfrastructureType } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const compareStore = useCompareStore()

const loading = ref(true)
const projects = ref<Project[]>([])
const projectInfrastructures = ref<Record<number, Infrastructure[]>>({})
const failedCount = ref(0)
const errorState = ref<string | null>(null)

const metricColors = ['#B8533A', '#2D5F8B', '#3A6B3A', '#6B6B6B']

const tableFields = computed(() => [
  { key: 'status', label: t('compare.fieldStatus') },
  { key: 'budget', label: t('compare.fieldBudget') },
  { key: 'startDate', label: t('compare.fieldStartDate') },
  { key: 'endDate', label: t('compare.fieldEndDate') },
  { key: 'duration', label: t('compare.fieldDuration') },
  { key: 'city', label: t('compare.fieldCity') },
  { key: 'district', label: t('compare.fieldDistrict') },
  { key: 'architect', label: t('compare.fieldArchitect') },
  { key: 'infrastructures', label: t('compare.fieldInfrastructures') },
  { key: 'description', label: t('compare.fieldDescription') },
])

const metricLabels = computed(() => [
  t('compare.metricBudget'),
  t('compare.metricDuration'),
  t('compare.metricInfrastructures'),
])

const metricMaxima = computed(() => {
  const budgets = projects.value.map((project) => project.budget ?? 0)
  const durations = projects.value.map((project) => getProjectDurationMonths(project) ?? 0)
  const infra = projects.value.map((project) => project.infrastructureCount ?? 0)
  return {
    budget: Math.max(0, ...budgets),
    duration: Math.max(0, ...durations),
    infra: Math.max(0, ...infra),
  }
})

const radarTooltipRaw = computed(() => {
  return projects.value.map((project) => ({
    budget: project.budget ?? 0,
    duration: getProjectDurationMonths(project) ?? 0,
    infra: project.infrastructureCount ?? 0,
  }))
})

const radarDatasets = computed(() => {
  return projects.value.map((project, index) => {
    const color = metricColors[index] ?? metricColors[metricColors.length - 1]
    const budgetValue = project.budget ?? 0
    const durationValue = getProjectDurationMonths(project) ?? 0
    const infraValue = project.infrastructureCount ?? 0
    return {
      label: project.name,
      data: [
        normalizeMetric(budgetValue, metricMaxima.value.budget),
        normalizeMetric(durationValue, metricMaxima.value.duration),
        normalizeMetric(infraValue, metricMaxima.value.infra),
      ],
      borderColor: color,
      backgroundColor: `${color}33`,
    }
  })
})

const budgetPieChartData = computed(() => {
  return projects.value.map((project) => ({
    label: project.name,
    value: project.budget ?? 0,
  }))
})

const timelineData = computed(() => {
  const validProjects = projects.value.filter((p) => p.startDate && p.endDate)
  if (!validProjects.length) return null

  const minTime = Math.min(...validProjects.map((p) => new Date(p.startDate!).getTime()))
  const maxTime = Math.max(...validProjects.map((p) => new Date(p.endDate!).getTime()))
  const totalDuration = maxTime - minTime || 1

  return projects.value.map((project, index) => {
    if (!project.startDate || !project.endDate) return null

    const start = new Date(project.startDate).getTime()
    const end = new Date(project.endDate).getTime()
    const left = ((start - minTime) / totalDuration) * 100
    const width = ((end - start) / totalDuration) * 100
    const color = metricColors[index] ?? metricColors[metricColors.length - 1]

    return {
      id: project.id,
      name: project.name,
      startStr: formatDate(project.startDate),
      endStr: formatDate(project.endDate),
      left,
      width,
      color,
    }
  }).filter((item) => item !== null)
})

const infraTypesBreakdown = computed(() => {
  const types: InfrastructureType[] = ['TRANSPORT', 'SOCIAL', 'UTILITY', 'RECREATIONAL', 'OTHER']
  return types.map((type) => ({
    type,
    label: t(`enums.infrastructureType.${type}`),
    values: projects.value.map((project) => {
      const infras = projectInfrastructures.value[project.id] || []
      const items = infras.filter((i) => i.type === type)
      return {
        count: items.length,
        items,
      }
    }),
  }))
})

function parseIdsFromQuery(): number[] {
  const raw = typeof route.query.ids === 'string' ? route.query.ids : ''
  const ids = raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0)
  return [...new Set(ids)].slice(0, 4)
}

function syncStore(items: Project[]) {
  compareStore.clear()
  items.forEach((item) => compareStore.add(item))
}

function formatDuration(project: Project): string {
  const months = getProjectDurationMonths(project)
  if (months === null || months <= 0) return t('compare.durationMissing')
  if (months < 12) return t('compare.durationMonths', months, { count: months })
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (remMonths === 0) return t('compare.durationYears', years, { count: years })
  return t('compare.durationYearsMonths', { years, months: remMonths })
}

function getCellValue(project: Project, key: string): string {
  switch (key) {
    case 'budget':
      return formatCurrency(project.budget)
    case 'startDate':
      return formatDate(project.startDate)
    case 'endDate':
      return formatDate(project.endDate)
    case 'duration':
      return formatDuration(project)
    case 'city':
      return project.cityName || '—'
    case 'district':
      return project.districtName || '—'
    case 'infrastructures':
      return formatNumber(project.infrastructureCount)
    case 'description':
      return project.description || '—'
    default:
      return '—'
  }
}

async function loadProjects() {
  loading.value = true
  errorState.value = null
  failedCount.value = 0
  const ids = parseIdsFromQuery()
  if (ids.length < 2) {
    projects.value = []
    errorState.value = t('compare.errorNotEnough')
    loading.value = false
    return
  }

  const responses = await Promise.allSettled(ids.map((id) => getProjectById(id)))
  const loaded = responses
    .filter((item): item is PromiseFulfilledResult<{ data: Project }> => item.status === 'fulfilled')
    .map((item) => item.value.data)
  failedCount.value = responses.length - loaded.length

  if (loaded.length < 2) {
    projects.value = loaded
    errorState.value = t('compare.errorNotEnough')
    loading.value = false
    return
  }

  projects.value = loaded
  syncStore(loaded)

  const infraPromises = loaded.map((p) => getInfrastructures({ projectId: p.id }, { size: 100 }))
  const infraResponses = await Promise.allSettled(infraPromises)
  const infraMap: Record<number, Infrastructure[]> = {}
  loaded.forEach((p, idx) => {
    const res = infraResponses[idx]
    if (res.status === 'fulfilled') {
      infraMap[p.id] = res.value.data.content
    } else {
      infraMap[p.id] = []
    }
  })
  projectInfrastructures.value = infraMap

  loading.value = false
}

function removeProject(id: number) {
  const nextIds = projects.value.filter((project) => project.id !== id).map((project) => project.id)
  if (nextIds.length < 2) {
    router.push('/projects')
    return
  }
  router.replace({ path: '/projects/compare', query: { ids: nextIds.join(',') } })
}

function tooltipFormatter(datasetLabel: string, dataIndex: number, value: number): string {
  const idx = radarDatasets.value.findIndex((dataset) => dataset.label === datasetLabel)
  if (idx === -1) return `${datasetLabel}: ${value}%`
  const raw = radarTooltipRaw.value[idx]
  const absolute = dataIndex === 0 ? formatCurrency(raw.budget) : dataIndex === 1 ? formatDuration(projects.value[idx]) : formatNumber(raw.infra)
  return `${datasetLabel}: ${absolute} (${value}%)`
}

watch(() => route.query.ids, loadProjects)
onMounted(loadProjects)
</script>

<template>
  <div class="container-app min-h-[calc(100vh-220px)] py-10">
    <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">— 00 {{ t('compare.pageMeta') }}</p>
    <h1 class="mt-3 font-serif text-5xl font-light tracking-tight">{{ t('compare.pageTitle') }}</h1>
    <p class="mt-4 max-w-3xl text-sm text-ink-muted dark:text-paper/70">{{ t('compare.pageSubtitle') }}</p>
    <RouterLink to="/projects" class="mt-5 inline-flex border border-ink/20 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink dark:border-paper/30 dark:text-paper dark:hover:border-paper">
      ← {{ t('compare.backToProjects') }}
    </RouterLink>

    <div v-if="loading" class="mt-10">
      <LoadingSpinner />
    </div>

    <div v-else-if="errorState" class="mt-10 card">
      <p class="text-sm text-status-suspended">{{ errorState }}</p>
      <RouterLink to="/projects" class="mt-4 inline-flex border border-ink/20 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink dark:border-paper/30 dark:text-paper dark:hover:border-paper">
        {{ t('compare.backToProjects') }}
      </RouterLink>
    </div>

    <template v-else>
      <div v-if="failedCount > 0" class="mt-8 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-ink dark:text-paper">
        {{ t('compare.errorPartial', failedCount, { count: failedCount }) }}
      </div>

      <div class="mt-8 overflow-x-auto border-y border-ink/10 dark:border-night-border">
        <table class="min-w-[980px] w-full">
          <thead>
            <tr class="border-b border-ink/10 dark:border-night-border">
              <th class="w-44 px-4 py-6 text-left text-xs font-mono uppercase tracking-[0.18em] font-semibold text-ink bg-paper-warm/40 dark:bg-night-elevated/30 dark:text-paper border-r border-ink/5 dark:border-night-border/50 shrink-0 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.05)]">— {{ t('compare.headerProjects') }}</th>
              <th v-for="project in projects" :key="project.id" class="px-4 py-6 align-top">
                <div class="relative border border-ink/15 p-3 dark:border-night-border">
                  <button
                    type="button"
                    class="absolute right-2 top-2 border border-ink/20 px-1.5 py-0.5 text-xs font-mono uppercase tracking-wider text-ink-muted hover:border-status-suspended hover:text-status-suspended dark:border-paper/30 dark:text-paper/65"
                    :aria-label="t('compare.removeProjectAria', { name: project.name })"
                    @click="removeProject(project.id)"
                  >
                    ×
                  </button>
                  <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.name" class="h-32 w-full border border-ink/10 object-cover dark:border-night-border">
                  <div v-else class="flex h-32 w-full items-center justify-center border border-ink/10 bg-paper-warm text-xs font-mono uppercase tracking-[0.15em] text-ink-muted dark:border-night-border dark:bg-night-elevated dark:text-paper/65">
                    {{ t('compare.unknownProject') }}
                  </div>
                  <RouterLink :to="`/projects/${project.id}`" class="mt-3 block break-words font-serif text-lg leading-tight text-ink hover:text-accent dark:text-paper">
                    {{ project.name }}
                  </RouterLink>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in tableFields" :key="field.key" class="border-b border-ink/10 hover:bg-paper-warm/50 dark:border-night-border dark:hover:bg-night-elevated/40">
              <th class="px-4 py-4 align-top text-left text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-ink bg-paper-warm/40 dark:bg-night-elevated/30 dark:text-paper border-r border-ink/5 dark:border-night-border/50 w-44 shrink-0 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.05)]">
                {{ field.label }}
              </th>
              <td v-for="project in projects" :key="`${project.id}-${field.key}`" class="px-4 py-4 align-top text-sm text-ink dark:text-paper">
                <template v-if="field.key === 'status'">
                  <BaseBadge :custom-class="getProjectStatusColor(project.status)">
                    {{ t(`enums.projectStatus.${project.status}`) }}
                  </BaseBadge>
                </template>
                <template v-else-if="field.key === 'architect'">
                  <RouterLink :to="`/architects/${project.architectId}`" class="text-ink hover:text-accent dark:text-paper">
                    {{ project.architectFullName || '—' }}
                  </RouterLink>
                </template>
                <template v-else-if="field.key === 'description'">
                  <p class="line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted dark:text-paper/70">
                    {{ getCellValue(project, field.key) }}
                  </p>
                </template>
                <template v-else>
                  <span class="font-mono text-xs uppercase tracking-wider">{{ getCellValue(project, field.key) }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="mt-14">
        <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">— 01 {{ t('compare.metricsMeta') }}</p>
        <h2 class="mt-3 font-serif text-4xl font-light tracking-tight">{{ t('compare.metricsTitle') }}</h2>
        <p class="mt-3 max-w-4xl text-sm text-ink-muted dark:text-paper/70">{{ t('compare.metricsHint') }}</p>

        <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div class="flex items-center justify-center border border-ink/10 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
            <div class="w-full max-w-[500px]">
              <RadarChart
                :labels="metricLabels"
                :datasets="radarDatasets"
                :tooltip-formatter="tooltipFormatter"
              />
            </div>
          </div>
          <div class="flex flex-col gap-6">
            <PieChart :title="t('compare.chartBudgetDist')" :data="budgetPieChartData" />
            
            <div v-if="timelineData && timelineData.length > 0" class="border border-ink/10 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
              <h3 class="mb-4 font-serif text-xl font-medium tracking-tight text-ink dark:text-paper">{{ t('compare.chartTimeline') }}</h3>
              <div class="mt-6 flex flex-col gap-4">
                <div v-for="item in timelineData" :key="item.id" class="relative pt-6">
                  <div class="absolute top-0 left-0 text-[10px] font-mono text-ink-muted dark:text-paper/50">{{ item.name }}</div>
                  <div class="h-2 w-full bg-paper-warm dark:bg-night-elevated overflow-hidden rounded-full relative">
                    <div 
                      class="absolute top-0 bottom-0 rounded-full transition-all duration-500"
                      :style="{ left: `${item.left}%`, width: `${item.width}%`, backgroundColor: item.color }"
                    ></div>
                  </div>
                  <div class="mt-1 flex items-center justify-between text-[10px] text-ink-muted dark:text-paper/50">
                    <span>{{ item.startStr }}</span>
                    <span>{{ item.endStr }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-14">
        <p class="text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">— 02 {{ t('compare.infraMeta') }}</p>
        <h2 class="mt-3 font-serif text-4xl font-light tracking-tight">{{ t('compare.infraTitle') }}</h2>
        <p class="mt-3 max-w-4xl text-sm text-ink-muted dark:text-paper/70">{{ t('compare.infraHint') }}</p>

        <div class="mt-8 overflow-x-auto border-y border-ink/10 dark:border-night-border">
          <table class="min-w-[980px] w-full">
            <thead>
              <tr class="border-b border-ink/10 dark:border-night-border">
                <th class="w-44 px-4 py-4 align-middle text-left text-xs font-mono uppercase tracking-[0.18em] font-semibold text-ink bg-paper-warm/40 dark:bg-night-elevated/30 dark:text-paper border-r border-ink/5 dark:border-night-border/50 shrink-0 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.05)]">
                  — {{ t('compare.fieldInfrastructures') }}
                </th>
                <th v-for="project in projects" :key="project.id" class="px-4 py-4 align-middle text-left font-serif text-lg text-ink dark:text-paper">
                  {{ project.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in infraTypesBreakdown" :key="row.type" class="border-b border-ink/10 hover:bg-paper-warm/50 dark:border-night-border dark:hover:bg-night-elevated/40">
                <th class="px-4 py-4 align-middle text-left text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-ink bg-paper-warm/40 dark:bg-night-elevated/30 dark:text-paper border-r border-ink/5 dark:border-night-border/50 shrink-0 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.05)]">
                  {{ row.label }}
                </th>
                <td v-for="(val, idx) in row.values" :key="idx" class="px-4 py-4 align-middle text-sm text-ink dark:text-paper">
                  <div v-if="val.count > 0" class="relative group inline-block">
                    <span class="font-mono text-xs cursor-help underline decoration-dashed underline-offset-4 decoration-ink/30 dark:decoration-paper/30">{{ val.count }}</span>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div class="w-72 max-h-64 overflow-y-auto bg-paper-pure dark:bg-night-elevated border border-ink/10 dark:border-night-border shadow-xl flex flex-col">
                        <RouterLink 
                          v-for="infra in val.items" 
                          :key="infra.id" 
                          :to="`/infrastructures/${infra.id}`" 
                          class="flex items-center gap-3 p-3 border-b border-ink/5 dark:border-night-border/50 last:border-0 hover:bg-paper-warm dark:hover:bg-night-soft transition-colors"
                        >
                          <img v-if="infra.imageUrl" :src="infra.imageUrl" class="w-10 h-10 object-cover shrink-0 border border-ink/10 dark:border-night-border" />
                          <div v-else class="w-10 h-10 shrink-0 bg-paper-warm dark:bg-night-soft flex items-center justify-center text-xs font-mono text-ink-muted dark:text-paper/40 border border-ink/10 dark:border-night-border">?</div>
                          <div class="flex-1 min-w-0">
                            <p class="text-xs font-semibold truncate text-ink dark:text-paper">{{ infra.name }}</p>
                            <div class="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-ink-muted dark:text-paper/60">
                              <span class="truncate">{{ formatCurrency(infra.budget) }}</span>
                              <span class="shrink-0">{{ formatDate(infra.constructionDate) }}</span>
                            </div>
                          </div>
                        </RouterLink>
                      </div>
                    </div>
                  </div>
                  <span v-else class="font-mono text-xs">{{ val.count }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
