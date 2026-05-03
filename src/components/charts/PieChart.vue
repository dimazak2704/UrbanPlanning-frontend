<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DataItem {
  label: string
  value: number
}

interface Props {
  data: DataItem[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
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
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { family: 'Inter', size: 12 },
        color: '#64748b',
      },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { family: 'Inter', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12,
      cornerRadius: 8,
    },
  },
}))
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5">
    <h3 v-if="title" class="mb-4 text-base font-semibold text-slate-900">{{ title }}</h3>
    <div class="h-64">
      <Pie v-if="data.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
        Немає даних
      </div>
    </div>
  </div>
</template>
