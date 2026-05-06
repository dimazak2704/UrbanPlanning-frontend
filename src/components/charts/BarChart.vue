<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
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
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const COLORS = [
  '#B8533A', '#2D5F8B', '#3A6B3A', '#8B2D2D', '#6B6B6B',
  '#7C5A3A', '#4A5D70', '#5E6B4A', '#7A4747', '#545454',
]

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      data: props.data.map((d) => d.value),
      backgroundColor: COLORS.slice(0, props.data.length),
      borderRadius: 0,
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
      ticks: { font: { family: 'JetBrains Mono', size: 13 }, color: isDark.value ? '#C7C7C5' : '#6B6B6B' },
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
      <Bar v-if="data.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="flex h-full items-center justify-center text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">
        Немає даних
      </div>
    </div>
  </div>
</template>
