<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth.store'
import {
  HomeIcon,
  FolderIcon,
  UserCircleIcon,
  UsersIcon,
  BuildingOffice2Icon,
  MapIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const auth = useAuthStore()

interface SidebarItem {
  label: string
  to: string
  icon: typeof HomeIcon
}

const cabinetLinks = computed<SidebarItem[]>(() => {
  const links: SidebarItem[] = [
    { label: 'Дашборд', to: '/me', icon: HomeIcon },
    { label: 'Мої проєкти', to: '/me/projects', icon: FolderIcon },
    { label: 'Мій профіль', to: '/me/profile', icon: UserCircleIcon },
  ]

  if (auth.isAdmin) {
    links.push(
      { label: 'Користувачі', to: '/admin/users', icon: UsersIcon },
      { label: 'Міста', to: '/admin/cities', icon: BuildingOffice2Icon },
      { label: 'Райони', to: '/admin/districts', icon: MapIcon },
    )
  }

  return links
})

function isActive(to: string): boolean {
  return route.path === to
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <div class="flex flex-1">
      <aside class="hidden w-64 border-r border-slate-200 bg-white lg:block">
        <nav class="sticky top-16 space-y-1 p-4">
          <RouterLink
            v-for="item in cabinetLinks"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150"
            :class="isActive(item.to)
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <component
              :is="item.icon"
              class="h-5 w-5 shrink-0"
              :class="isActive(item.to) ? 'text-primary-600' : 'text-slate-400'"
            />
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>
      <main class="flex-1 bg-slate-50 p-6 lg:p-8">
        <slot />
      </main>
    </div>
    <AppFooter />
  </div>
</template>
