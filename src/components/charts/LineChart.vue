<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface DataPoint {
  x: string
  y: number
}

interface Props {
  data: DataPoint[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
})

const chartData = computed(() => ({
  labels: props.data.map((d) => d.x),
  datasets: [
    {
      data: props.data.map((d) => d.y),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
      borderWidth: 2.5,
    },
  ],
}))

const chartOptions = computed(() => ({
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
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8', maxTicksLimit: 10 },
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
      <Line v-if="data.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
        Немає даних
      </div>
    </div>
  </div>
</template>
