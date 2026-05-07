<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface DatasetInput {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
}

interface Props {
  labels: string[]
  datasets: DatasetInput[]
  tooltipSuffix?: string
  tooltipFormatter?: (datasetLabel: string, dataIndex: number, value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  tooltipSuffix: '%',
})

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const chartData = computed<ChartData<'radar'>>(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset) => ({
    ...dataset,
    pointRadius: 2,
    pointHoverRadius: 4,
    borderWidth: 2,
  })),
}))

const chartOptions = computed<ChartOptions<'radar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: isDark.value ? '#C7C7C5' : '#6B6B6B',
        font: {
          family: 'JetBrains Mono',
          size: 11,
        },
        boxWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? '#242424' : '#0A0A0A',
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'JetBrains Mono', size: 11 },
      cornerRadius: 0,
      padding: 12,
      callbacks: {
        label(context) {
          const value = Number(context.raw)
          if (props.tooltipFormatter) {
            return props.tooltipFormatter(context.dataset.label ?? '', context.dataIndex, value)
          }
          return `${context.dataset.label}: ${value}${props.tooltipSuffix}`
        },
      },
    },
  },
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        display: true,
        stepSize: 20,
        color: isDark.value ? '#A3A3A3' : '#6B6B6B',
        backdropColor: 'transparent',
        font: {
          family: 'JetBrains Mono',
          size: 10,
        },
      },
      angleLines: {
        color: isDark.value ? 'rgba(250,250,247,0.2)' : 'rgba(10,10,10,0.15)',
      },
      grid: {
        color: isDark.value ? 'rgba(250,250,247,0.2)' : 'rgba(10,10,10,0.15)',
      },
      pointLabels: {
        color: isDark.value ? '#C7C7C5' : '#4B5563',
        font: {
          family: 'JetBrains Mono',
          size: 11,
        },
      },
    },
  },
}))
</script>

<template>
  <div class="h-[360px] w-full">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>
