<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  label: string
  value: string | number
  trend?: string
  colorClass?: string
  to?: string
}

withDefaults(defineProps<Props>(), {
  trend: '',
  colorClass: 'bg-primary-50 text-primary-600',
  to: '',
})
</script>

<template>
  <component
    :is="to ? 'RouterLink' : 'div'"
    :to="to || undefined"
    :class="[
      'group rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200',
      to ? 'hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5 cursor-pointer' : '',
    ]"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p class="mt-1.5 text-2xl font-bold text-slate-900">{{ value }}</p>
        <p
          v-if="trend"
          class="mt-1 text-xs font-medium text-emerald-600"
        >
          {{ trend }}
        </p>
      </div>
      <div :class="['rounded-xl p-3', colorClass]">
        <component :is="icon" class="h-6 w-6" />
      </div>
    </div>
  </component>
</template>
