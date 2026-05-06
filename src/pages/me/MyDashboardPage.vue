<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  PhBuildings,
  PhChartLine,
  PhCurrencyCircleDollar,
  PhFileText,
  PhFolder,
  PhHardHat,
  PhPlus,
  PhUserCircle,
  PhUsersThree,
} from '@phosphor-icons/vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PieChart from '@/components/charts/PieChart.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { getMyStats } from '@/api/me.api'
import { getMyProjects } from '@/api/projects.api'
import { getOverview } from '@/api/analytics.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatNumber, formatCompactCurrency } from '@/utils/format'
import type { MeStats } from '@/types/me'
import type { OverviewStats } from '@/types/analytics'
import type { Project } from '@/types/project'
import type { ProjectStatus } from '@/types/enums'

const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

const loading = ref(true)

// --- Architect state ---
const stats = ref<MeStats | null>(null)
const recentProjects = ref<Project[]>([])

const statusChartData = computed(() => {
  if (!stats.value?.projectsByStatus) return []
  return Object.entries(stats.value.projectsByStatus)
    .map(([status, count]) => ({
      label: t(`enums.projectStatus.${status}`),
      value: count
    }))
    .filter(d => d.value > 0)
})

// --- Admin state ---
const overview = ref<OverviewStats | null>(null)

async function fetchArchitectData() {
  try {
    const [statsRes, projectsRes] = await Promise.all([
      getMyStats(),
      getMyProjects(undefined, { size: 5, sort: 'updatedAt,desc' })
    ])
    stats.value = statsRes.data
    recentProjects.value = projectsRes.data.content
  } catch (err) {
    toast.error(t('me.statsLoadError'))
  }
}

async function fetchAdminData() {
  try {
    const { data } = await getOverview()
    overview.value = data
  } catch (err) {
    toast.error(t('admin.statsLoadError'))
  }
}

onMounted(async () => {
  if (!auth.user) return
  loading.value = true
  if (auth.isAdmin) {
    await fetchAdminData()
  } else {
    await fetchArchitectData()
  }
  loading.value = false
})
</script>

<template>
  <div class="min-h-[calc(100vh-260px)] space-y-10 pb-10">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('me.greeting', { name: auth.user?.firstName || auth.user?.email.split('@')[0] }) }}</h1>
        <p class="mt-2 text-base text-ink-muted dark:text-paper/70">{{ t('me.summary') }}</p>
      </div>
      <div v-if="auth.isArchitect" class="flex gap-3">
        <RouterLink to="/projects/new">
          <BaseButton><template #iconLeft><PhPlus :size="14" weight="light" /></template>{{ t('projects.newProject') }}</BaseButton>
        </RouterLink>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <!-- ==================== ADMIN DASHBOARD ==================== -->
    <template v-else-if="auth.isAdmin && overview">
      <!-- Quick actions -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RouterLink to="/admin/users" class="card-hover flex flex-col items-center justify-center py-6 text-center text-ink-muted hover:text-accent dark:text-paper/70">
          <PhUsersThree :size="30" weight="light" class="mb-2" />
          <span class="font-medium">{{ t('admin.usersLink') }}</span>
        </RouterLink>
        <RouterLink to="/admin/cities" class="card-hover flex flex-col items-center justify-center py-6 text-center text-ink-muted hover:text-accent dark:text-paper/70">
          <PhBuildings :size="30" weight="light" class="mb-2" />
          <span class="font-medium">{{ t('admin.citiesLink') }}</span>
        </RouterLink>
        <RouterLink to="/admin/districts" class="card-hover flex flex-col items-center justify-center py-6 text-center text-ink-muted hover:text-accent dark:text-paper/70">
          <PhChartLine :size="30" weight="light" class="mb-2" />
          <span class="font-medium">{{ t('admin.districtsLink') }}</span>
        </RouterLink>
        <RouterLink to="/me/profile" class="card-hover flex flex-col items-center justify-center py-6 text-center text-ink-muted hover:text-accent dark:text-paper/70">
          <PhUserCircle :size="30" weight="light" class="mb-2" />
          <span class="font-medium">{{ t('me.profile') }}</span>
        </RouterLink>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard :icon="PhBuildings" :label="t('header.cities')" :value="formatNumber(overview.totalCities)" color-class="bg-accent-soft text-accent" to="/cities" />
        <StatCard :icon="PhChartLine" :label="t('header.districts')" :value="formatNumber(overview.totalDistricts)" color-class="bg-paper-warm text-status-approved dark:bg-night-elevated" />
        <StatCard :icon="PhFileText" :label="t('header.projects')" :value="formatNumber(overview.totalProjects)" color-class="bg-paper-warm text-accent dark:bg-night-elevated" to="/projects" />
        <StatCard :icon="PhHardHat" :label="t('header.infrastructures')" :value="formatNumber(overview.totalInfrastructures)" color-class="bg-paper-warm text-status-construction dark:bg-night-elevated" to="/infrastructures" />
        <StatCard :icon="PhUsersThree" :label="t('header.architects')" :value="formatNumber(overview.totalArchitects)" color-class="bg-paper-warm text-status-completed dark:bg-night-elevated" to="/architects" />
        <StatCard :icon="PhCurrencyCircleDollar" :label="t('me.totalBudget')" :value="formatCompactCurrency(overview.totalProjectsBudget)" color-class="bg-paper-warm text-status-approved dark:bg-night-elevated" />
      </div>
    </template>

    <!-- ==================== ARCHITECT DASHBOARD ==================== -->
    <template v-else-if="stats">
      <!-- Quick actions -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RouterLink to="/projects/new" class="card-hover flex flex-col items-center justify-center py-6 text-center text-ink-muted hover:text-accent dark:text-paper/70">
          <PhPlus :size="30" weight="light" class="mb-2" />
          <span class="font-medium">{{ t('projects.newProject') }}</span>
        </RouterLink>
        <RouterLink to="/me/projects" class="card-hover flex flex-col items-center justify-center py-6 text-center text-ink-muted hover:text-accent dark:text-paper/70">
          <PhFolder :size="30" weight="light" class="mb-2" />
          <span class="font-medium">{{ t('me.myProjects') }}</span>
        </RouterLink>
        <RouterLink to="/me/profile" class="card-hover flex flex-col items-center justify-center py-6 text-center text-ink-muted hover:text-accent dark:text-paper/70">
          <PhUserCircle :size="30" weight="light" class="mb-2" />
          <span class="font-medium">{{ t('me.editProfile') }}</span>
        </RouterLink>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div class="card border-l-2 border-l-accent">
          <p class="mb-1 text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('me.totalProjects') }}</p>
          <p class="text-3xl font-serif font-medium text-ink dark:text-paper">{{ stats.totalProjects }}</p>
        </div>
        <div class="card border-l-2 border-l-status-construction">
          <p class="mb-1 text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('enums.projectStatus.UNDER_CONSTRUCTION') }}</p>
          <p class="text-3xl font-serif font-medium text-ink dark:text-paper">{{ stats.projectsByStatus?.UNDER_CONSTRUCTION ?? 0 }}</p>
        </div>
        <div class="card border-l-2 border-l-status-completed">
          <p class="mb-1 text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('enums.projectStatus.COMPLETED') }}</p>
          <p class="text-3xl font-serif font-medium text-ink dark:text-paper">{{ stats.projectsByStatus?.COMPLETED ?? 0 }}</p>
        </div>
        <div class="card border-l-2 border-l-status-approved">
          <p class="mb-1 text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('header.infrastructures') }}</p>
          <p class="text-3xl font-serif font-medium text-ink dark:text-paper">{{ stats.totalInfrastructures }}</p>
        </div>
        <div class="card border-l-2 border-l-status-approved">
          <p class="mb-1 text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('me.totalBudget') }}</p>
          <p class="text-2xl font-serif font-medium text-ink dark:text-paper">{{ formatCompactCurrency(stats.totalBudget || 0) }}</p>
        </div>
      </div>

      <div class="space-y-8">
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <PieChart :data="statusChartData" :title="t('me.statusChart')" />
          <div class="card h-fit">
            <h3 class="text-sm font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">{{ t('me.statusBreakdown') }}</h3>
            <div class="mt-5 space-y-4">
              <div
                v-for="item in statusChartData"
                :key="item.label"
                class="flex items-center justify-between border-b border-ink/10 pb-2 text-sm dark:border-night-border"
              >
                <span class="text-ink-muted dark:text-paper/70">{{ item.label }}</span>
                <span class="font-mono text-ink dark:text-paper">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-serif font-medium tracking-tight text-ink dark:text-paper">{{ t('me.recentProjects') }}</h2>
            <RouterLink to="/me/projects" class="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-accent dark:text-paper/65">{{ t('me.allProjects') }} &rarr;</RouterLink>
          </div>
          <div v-if="recentProjects.length === 0" class="card py-12 text-center text-sm text-ink-muted dark:text-paper/65">
            {{ t('me.noProjects') }} <RouterLink to="/projects/new" class="font-medium text-accent">{{ t('me.createFirst') }}</RouterLink>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ProjectCard v-for="p in recentProjects" :key="p.id" :project="p" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
