<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CabinetLayout from '@/layouts/CabinetLayout.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()

const layoutMap = {
  default: DefaultLayout,
  auth: AuthLayout,
  cabinet: CabinetLayout,
} as const

const currentLayout = computed(() => {
  const layout = (route.meta.layout as keyof typeof layoutMap) || 'default'
  return layoutMap[layout] || DefaultLayout
})
</script>

<template>
  <component :is="currentLayout">
    <router-view v-slot="{ Component }">
      <transition
        name="page"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
  <ToastContainer />
</template>
