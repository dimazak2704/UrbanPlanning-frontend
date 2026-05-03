<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-slate-800 px-4">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
    </div>
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
