<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale, getCurrentLocale, type SupportedLocale } from '@/i18n'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'
import { BuildingOffice2Icon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const mobileMenuOpen = ref(false)

const currentLang = ref<SupportedLocale>(getCurrentLocale())

function toggleLanguage() {
  const newLang = currentLang.value === 'uk' ? 'en' : 'uk'
  setLocale(newLang)
  currentLang.value = newLang
}

interface NavLink {
  label: string
  to: string
}

const navLinks = computed(() => [
  { label: t('header.home'), to: '/' },
  { label: t('header.map'), to: '/map' },
  { label: t('header.cities'), to: '/cities' },
  { label: t('header.projects'), to: '/projects' },
  { label: t('header.infrastructures'), to: '/infrastructures' },
  { label: t('header.architects'), to: '/architects' },
])

function getUserInitials(): string {
  if (!auth.user?.email) return '?'
  return auth.user.email.charAt(0).toUpperCase()
}

async function handleLogout() {
  auth.logout()
  mobileMenuOpen.value = false
  router.push('/')
}

function closeMobile() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 shrink-0">
        <BuildingOffice2Icon class="h-8 w-8 text-primary-600" />
        <span class="text-lg font-bold text-slate-900 hidden sm:block">
          Urban<span class="text-primary-600">Plan</span>
        </span>
      </RouterLink>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          active-class="!bg-primary-50 !text-primary-700"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Right side -->
      <div class="flex items-center gap-3">
        <!-- Language Switcher -->
        <button
          @click="toggleLanguage"
          class="flex items-center justify-center h-9 w-12 rounded-lg bg-slate-100 text-lg hover:bg-slate-200 transition-colors"
          :title="t('header.language')"
        >
          {{ currentLang === 'uk' ? '🇺🇦' : '🇬🇧' }}
        </button>

        <!-- Not auth: login button -->
        <RouterLink
          v-if="!auth.isAuthenticated"
          to="/login"
          class="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <ArrowRightOnRectangleIcon class="h-4 w-4" />
          {{ t('auth.login') }}
        </RouterLink>

        <!-- Auth: user dropdown -->
        <Menu v-if="auth.isAuthenticated" as="div" class="relative">
          <MenuButton
            class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100"
            :class="(route.path.startsWith('/me') || route.path.startsWith('/admin')) ? 'bg-primary-50 text-primary-700' : 'text-slate-700'"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
            >
              {{ getUserInitials() }}
            </span>
            <span class="hidden sm:block max-w-[120px] truncate">{{ auth.user?.email }}</span>
            <ChevronDownIcon class="h-4 w-4 text-slate-400" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
            >
              <div class="p-1.5">
                <MenuItem v-slot="{ active }">
                  <RouterLink
                    to="/me"
                    :class="[
                      active ? 'bg-slate-50' : '',
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700',
                    ]"
                  >
                    <UserCircleIcon class="h-4 w-4 text-slate-400" />
                    {{ t('header.cabinet') }}
                  </RouterLink>
                </MenuItem>

                <MenuItem v-if="auth.isAdmin" v-slot="{ active }">
                  <RouterLink
                    to="/admin/users"
                    :class="[
                      active ? 'bg-slate-50' : '',
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700',
                    ]"
                  >
                    <Cog6ToothIcon class="h-4 w-4 text-slate-400" />
                    {{ t('header.admin') }}
                  </RouterLink>
                </MenuItem>

                <div class="my-1 border-t border-slate-100" />

                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-red-50' : '',
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600',
                    ]"
                    @click="handleLogout"
                  >
                    <ArrowRightOnRectangleIcon class="h-4 w-4" />
                    {{ t('auth.logout') }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>

        <!-- Mobile hamburger -->
        <button
          class="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
          <XMarkIcon v-else class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden"
      >
        <nav class="space-y-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            active-class="!bg-primary-50 !text-primary-700"
            @click="closeMobile"
          >
            {{ link.label }}
          </RouterLink>

          <div class="border-t border-slate-100 pt-2 mt-2">
            <RouterLink
              v-if="!auth.isAuthenticated"
              to="/login"
              class="block rounded-lg px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
              @click="closeMobile"
            >
              {{ t('auth.login') }}
            </RouterLink>
            <template v-else>
              <RouterLink
                to="/me"
                class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                @click="closeMobile"
              >
                {{ t('header.cabinet') }}
              </RouterLink>
              <RouterLink
                v-if="auth.isAdmin"
                to="/admin/users"
                class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                @click="closeMobile"
              >
                {{ t('header.admin') }}
              </RouterLink>
              <button
                class="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                @click="handleLogout"
              >
                {{ t('auth.logout') }}
              </button>
            </template>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>
