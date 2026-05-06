<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  PlusIcon,
  UserCircleIcon,
  FolderIcon,
  UsersIcon,
  BuildingOffice2Icon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
} from '@heroicons/vue/24/outline'
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
import { formatCurrency, formatNumber, formatCompactCurrency } from '@/utils/format'
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
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ t('me.greeting', { name: auth.user?.firstName || auth.user?.email.split('@')[0] }) }}</h1>
        <p class="text-slate-500 mt-1">{{ t('me.summary') }}</p>
      </div>
      <div v-if="auth.isArchitect" class="flex gap-3">
        <RouterLink to="/projects/new">
          <BaseButton><template #iconLeft><PlusIcon class="h-4 w-4" /></template>{{ t('projects.newProject') }}</BaseButton>
        </RouterLink>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <!-- ==================== ADMIN DASHBOARD ==================== -->
    <template v-else-if="auth.isAdmin && overview">
      <!-- Quick actions -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <RouterLink to="/admin/users" class="card-hover flex flex-col items-center justify-center py-6 text-center text-primary-600 hover:bg-primary-50">
          <UsersIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">{{ t('admin.usersLink') }}</span>
        </RouterLink>
        <RouterLink to="/admin/cities" class="card-hover flex flex-col items-center justify-center py-6 text-center text-indigo-600 hover:bg-indigo-50">
          <BuildingOffice2Icon class="h-8 w-8 mb-2" />
          <span class="font-medium">{{ t('admin.citiesLink') }}</span>
        </RouterLink>
        <RouterLink to="/admin/districts" class="card-hover flex flex-col items-center justify-center py-6 text-center text-teal-600 hover:bg-teal-50">
          <BuildingLibraryIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">{{ t('admin.districtsLink') }}</span>
        </RouterLink>
        <RouterLink to="/me/profile" class="card-hover flex flex-col items-center justify-center py-6 text-center text-slate-600 hover:bg-slate-50">
          <UserCircleIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">{{ t('me.profile') }}</span>
        </RouterLink>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard :icon="BuildingOffice2Icon" :label="t('header.cities')" :value="formatNumber(overview.totalCities)" color-class="bg-primary-50 text-primary-600" to="/cities" />
        <StatCard :icon="BuildingLibraryIcon" :label="t('header.districts')" :value="formatNumber(overview.totalDistricts)" color-class="bg-blue-50 text-blue-600" />
        <StatCard :icon="DocumentTextIcon" :label="t('header.projects')" :value="formatNumber(overview.totalProjects)" color-class="bg-accent-50 text-accent-600" to="/projects" />
        <StatCard :icon="WrenchScrewdriverIcon" :label="t('header.infrastructures')" :value="formatNumber(overview.totalInfrastructures)" color-class="bg-amber-50 text-amber-600" to="/infrastructures" />
        <StatCard :icon="UsersIcon" :label="t('header.architects')" :value="formatNumber(overview.totalArchitects)" color-class="bg-emerald-50 text-emerald-600" to="/architects" />
        <StatCard :icon="CurrencyDollarIcon" :label="t('me.totalBudget')" :value="formatCompactCurrency(overview.totalProjectsBudget)" color-class="bg-violet-50 text-violet-600" />
      </div>
    </template>

    <!-- ==================== ARCHITECT DASHBOARD ==================== -->
    <template v-else-if="stats">
      <!-- Quick actions -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <RouterLink to="/projects/new" class="card-hover flex flex-col items-center justify-center py-6 text-center text-primary-600 hover:bg-primary-50">
          <PlusIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">{{ t('projects.newProject') }}</span>
        </RouterLink>
        <RouterLink to="/me/projects" class="card-hover flex flex-col items-center justify-center py-6 text-center text-indigo-600 hover:bg-indigo-50">
          <FolderIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">{{ t('me.myProjects') }}</span>
        </RouterLink>
        <RouterLink to="/me/profile" class="card-hover flex flex-col items-center justify-center py-6 text-center text-slate-600 hover:bg-slate-50">
          <UserCircleIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">{{ t('me.editProfile') }}</span>
        </RouterLink>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="card bg-white border-l-4 border-l-primary-500">
          <p class="text-sm font-medium text-slate-500 mb-1">{{ t('me.totalProjects') }}</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.totalProjects }}</p>
        </div>
        <div class="card bg-white border-l-4 border-l-amber-500">
          <p class="text-sm font-medium text-slate-500 mb-1">{{ t('enums.projectStatus.UNDER_CONSTRUCTION') }}</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.projectsByStatus?.UNDER_CONSTRUCTION ?? 0 }}</p>
        </div>
        <div class="card bg-white border-l-4 border-l-emerald-500">
          <p class="text-sm font-medium text-slate-500 mb-1">{{ t('enums.projectStatus.COMPLETED') }}</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.projectsByStatus?.COMPLETED ?? 0 }}</p>
        </div>
        <div class="card bg-white border-l-4 border-l-teal-500">
          <p class="text-sm font-medium text-slate-500 mb-1">{{ t('header.infrastructures') }}</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.totalInfrastructures }}</p>
        </div>
        <div class="card bg-white border-l-4 border-l-blue-500">
          <p class="text-sm font-medium text-slate-500 mb-1">{{ t('me.totalBudget') }}</p>
          <p class="text-3xl font-bold text-slate-900">{{ formatCurrency(stats.totalBudget || 0) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Chart -->
        <div class="lg:col-span-1">
          <PieChart :data="statusChartData" :title="t('me.statusChart')" />
        </div>

        <!-- Recent Projects -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900">{{ t('me.recentProjects') }}</h2>
            <RouterLink to="/me/projects" class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ t('me.allProjects') }} &rarr;</RouterLink>
          </div>
          <div v-if="recentProjects.length === 0" class="card text-center py-12 text-slate-500 text-sm">
            {{ t('me.noProjects') }} <RouterLink to="/projects/new" class="text-primary-600 font-medium">{{ t('me.createFirst') }}</RouterLink>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ProjectCard v-for="p in recentProjects" :key="p.id" :project="p" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
