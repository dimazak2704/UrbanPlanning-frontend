<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { PlusIcon, UserCircleIcon, FolderIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/common/BaseButton.vue'
import ProjectCard from '@/components/cards/ProjectCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getMyStats } from '@/api/me.api'
import { getMyProjects } from '@/api/projects.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatCurrency } from '@/utils/format'
import type { MyStats } from '@/types/me'
import type { Project } from '@/types/project'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { PROJECT_STATUS_LABELS } from '@/utils/enum-labels'

ChartJS.register(ArcElement, Tooltip, Legend)

const auth = useAuthStore()
const toast = useToastStore()

const loading = ref(true)
const stats = ref<MyStats | null>(null)
const recentProjects = ref<Project[]>([])

const pieChartData = computed(() => {
  if (!stats.value?.projectsByStatus) return null
  const labels = Object.keys(stats.value.projectsByStatus).map(k => PROJECT_STATUS_LABELS[k as keyof typeof PROJECT_STATUS_LABELS] || k)
  const data = Object.values(stats.value.projectsByStatus)
  const bgColors = [
    '#94a3b8', // slate-400 (PLANNED)
    '#3b82f6', // blue-500 (APPROVED)
    '#f59e0b', // amber-500 (UNDER_CONSTRUCTION)
    '#10b981', // emerald-500 (COMPLETED)
    '#ef4444', // red-500 (SUSPENDED)
  ]
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: bgColors.slice(0, data.length),
      borderWidth: 1
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const },
  }
}

async function fetchData() {
  loading.value = true
  try {
    const [statsRes, projectsRes] = await Promise.all([
      getMyStats(),
      getMyProjects(undefined, { size: 5, sort: 'updatedAt,desc' })
    ])
    stats.value = statsRes.data
    recentProjects.value = projectsRes.data.content
  } catch (err) {
    toast.error('Не вдалося завантажити дані дашборда')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (auth.user) {
    fetchData()
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Вітаємо, {{ auth.user?.firstName || auth.user?.email.split('@')[0] }}!</h1>
        <p class="text-slate-500 mt-1">Ось коротке зведення вашої діяльності.</p>
      </div>
      <div class="flex gap-3">
        <RouterLink to="/projects/new">
          <BaseButton><template #iconLeft><PlusIcon class="h-4 w-4" /></template>Новий проєкт</BaseButton>
        </RouterLink>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />
    <template v-else-if="stats">
      <!-- Quick actions -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <RouterLink to="/projects/new" class="card-hover flex flex-col items-center justify-center py-6 text-center text-primary-600 hover:bg-primary-50">
          <PlusIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">Новий проєкт</span>
        </RouterLink>
        <RouterLink to="/me/projects" class="card-hover flex flex-col items-center justify-center py-6 text-center text-indigo-600 hover:bg-indigo-50">
          <FolderIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">Мої проєкти</span>
        </RouterLink>
        <RouterLink to="/me/profile" class="card-hover flex flex-col items-center justify-center py-6 text-center text-slate-600 hover:bg-slate-50">
          <UserCircleIcon class="h-8 w-8 mb-2" />
          <span class="font-medium">Редагувати профіль</span>
        </RouterLink>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card bg-white border-l-4 border-l-primary-500">
          <p class="text-sm font-medium text-slate-500 mb-1">Всього проєктів</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.totalProjects }}</p>
        </div>
        <div class="card bg-white border-l-4 border-l-amber-500">
          <p class="text-sm font-medium text-slate-500 mb-1">В процесі будівництва</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.projectsUnderConstruction || 0 }}</p>
        </div>
        <div class="card bg-white border-l-4 border-l-emerald-500">
          <p class="text-sm font-medium text-slate-500 mb-1">Завершені</p>
          <p class="text-3xl font-bold text-slate-900">{{ stats.completedProjects || 0 }}</p>
        </div>
        <div class="card bg-white border-l-4 border-l-blue-500">
          <p class="text-sm font-medium text-slate-500 mb-1">Загальний бюджет</p>
          <p class="text-3xl font-bold text-slate-900">{{ formatCurrency(stats.totalBudget || 0) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Chart -->
        <div class="card lg:col-span-1">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Статуси проєктів</h2>
          <div class="h-64 relative">
            <Pie v-if="pieChartData && pieChartData.datasets[0].data.length > 0" :data="pieChartData" :options="chartOptions" />
            <div v-else class="absolute inset-0 flex items-center justify-center text-sm text-slate-400">Немає даних</div>
          </div>
        </div>

        <!-- Recent Projects -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900">Останні проєкти</h2>
            <RouterLink to="/me/projects" class="text-sm font-medium text-primary-600 hover:text-primary-700">Всі проєкти &rarr;</RouterLink>
          </div>
          <div v-if="recentProjects.length === 0" class="card text-center py-12 text-slate-500 text-sm">
            У вас ще немає проєктів. <RouterLink to="/projects/new" class="text-primary-600 font-medium">Створити перший</RouterLink>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ProjectCard v-for="p in recentProjects" :key="p.id" :project="p" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
