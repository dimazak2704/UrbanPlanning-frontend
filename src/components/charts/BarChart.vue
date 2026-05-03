<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface DataItem {
  label: string
  value: number
}

interface Props {
  data: DataItem[]
  title?: string
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  horizontal: false,
})

const COLORS = [
  '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#10b981',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#64748b',
]

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      data: props.data.map((d) => d.value),
      backgroundColor: COLORS.slice(0, props.data.length),
      borderRadius: 6,
      borderSkipped: false as const,
      maxBarThickness: 48,
    },
  ],
}))

const chartOptions = computed(() => ({
  indexAxis: (props.horizontal ? 'y' : 'x') as 'x' | 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { family: 'Inter', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' },
    },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' },
      beginAtZero: true,
    },
  },
}))
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5">
    <h3 v-if="title" class="mb-4 text-base font-semibold text-slate-900">{{ title }}</h3>
    <div class="h-64">
      <Bar v-if="data.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
        Немає даних
      </div>
    </div>
  </div>
</template>
