<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth.store'
import {
  PhBuildings,
  PhFolder,
  PhHouse,
  PhMapPin,
  PhUser,
  PhUsersThree,
} from '@phosphor-icons/vue'

const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

interface SidebarItem {
  label: string
  to: string
  icon: unknown
}

const cabinetLinks = computed<SidebarItem[]>(() => {
  const links: SidebarItem[] = [
    { label: t('me.dashboard'), to: '/me', icon: PhHouse },
  ]

  if (auth.isArchitect) {
    links.push({ label: t('me.myProjects'), to: '/me/projects', icon: PhFolder })
  }

  links.push({ label: t('me.profile'), to: '/me/profile', icon: PhUser })

  if (auth.isAdmin) {
    links.push(
      { label: t('admin.usersLink'), to: '/admin/users', icon: PhUsersThree },
      { label: t('admin.citiesLink'), to: '/admin/cities', icon: PhBuildings },
      { label: t('admin.districtsLink'), to: '/admin/districts', icon: PhMapPin },
    )
  }

  return links
})

function isActive(to: string): boolean {
  return route.path === to
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-paper text-ink dark:bg-night dark:text-paper">
    <AppHeader />
    <div class="flex flex-1">
      <aside class="hidden w-72 border-r border-ink/10 bg-paper-warm lg:block dark:border-night-border dark:bg-night-soft">
        <nav class="sticky top-20 space-y-1 p-6">
          <RouterLink
            v-for="item in cabinetLinks"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 border border-transparent px-3 py-3 text-sm font-mono uppercase tracking-wider transition-colors duration-200"
            :class="isActive(item.to)
              ? 'border-ink/25 text-ink dark:border-paper/35 dark:text-paper'
              : 'text-ink-muted hover:border-ink/20 hover:text-ink dark:text-paper/65 dark:hover:border-paper/35 dark:hover:text-paper'"
          >
            <component
              :is="item.icon"
              :size="18"
              weight="light"
              class="shrink-0"
            />
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>
      <main class="flex-1 p-6 lg:p-10">
        <slot />
      </main>
    </div>
    <AppFooter />
  </div>
</template>
