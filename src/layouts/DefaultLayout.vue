<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CompareBar from '@/components/compare/CompareBar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-paper text-ink dark:bg-night dark:text-paper">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <CompareBar />
    <AppFooter />
  </div>
</template>
