<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { HomeIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
    <div class="mb-6 rounded-full bg-slate-100 p-4">
      <svg class="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h1 class="text-3xl font-bold text-slate-900 mb-3">404</h1>
    <p class="text-lg text-slate-500 mb-8">Сторінку не знайдено</p>
    <RouterLink
      to="/"
      class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700"
    >
      <HomeIcon class="h-4 w-4" />
      На головну
    </RouterLink>
  </div>
</template>
