<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
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
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const chartData = computed(() => ({
  labels: props.data.map((d) => d.x),
  datasets: [
    {
      data: props.data.map((d) => d.y),
      borderColor: '#B8533A',
      backgroundColor: 'rgba(184, 83, 58, 0.08)',
      fill: true,
      tension: 0.25,
      pointRadius: 3,
      pointBackgroundColor: '#B8533A',
      pointBorderColor: isDark.value ? '#1A1A1A' : '#FAFAF7',
      pointBorderWidth: 1,
      pointHoverRadius: 4,
      borderWidth: 2,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#242424' : '#0A0A0A',
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'Inter', size: 11 },
      padding: 12,
      cornerRadius: 0,
    },
  },
  scales: {
    x: {
      grid: { color: isDark.value ? 'rgba(250,250,247,0.12)' : 'rgba(10,10,10,0.12)', borderDash: [2, 4] },
      ticks: { font: { family: 'JetBrains Mono', size: 13 }, color: isDark.value ? '#C7C7C5' : '#6B6B6B', maxTicksLimit: 10 },
    },
    y: {
      grid: { color: isDark.value ? 'rgba(250,250,247,0.12)' : 'rgba(10,10,10,0.12)', borderDash: [2, 4] },
      ticks: { font: { family: 'JetBrains Mono', size: 13 }, color: isDark.value ? '#C7C7C5' : '#6B6B6B' },
      beginAtZero: true,
    },
  },
}))
</script>

<template>
  <div class="border border-ink/10 bg-paper-pure p-5 dark:border-night-border dark:bg-night-soft">
    <h3 v-if="title" class="mb-4 font-serif text-xl font-medium tracking-tight text-ink dark:text-paper">{{ title }}</h3>
    <div class="h-64">
      <Line v-if="data.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="flex h-full items-center justify-center text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">
        Немає даних
      </div>
    </div>
  </div>
</template>
