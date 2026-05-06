<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale, getCurrentLocale, type SupportedLocale } from '@/i18n'
import { PhList, PhMoon, PhSignIn, PhSignOut, PhSun, PhX } from '@phosphor-icons/vue'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const { theme, resolvedTheme, cycleTheme } = useTheme()

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
  { label: t('header.districts'), to: '/districts' },
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

function onScroll() {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="sticky top-0 z-50 h-20 border-b transition-colors duration-300"
    :class="isScrolled ? 'border-ink/10 bg-paper/85 backdrop-blur-md dark:border-night-border dark:bg-night/85' : 'border-transparent bg-transparent'"
  >
    <div class="container-app flex h-20 items-center justify-between gap-4">
      <RouterLink to="/" class="flex shrink-0 items-center gap-4">
        <span class="font-serif text-3xl uppercase tracking-[0.02em] text-ink dark:text-paper">UP</span>
        <span class="h-8 w-px bg-ink/20 dark:bg-paper/30" />
      </RouterLink>

      <div class="hidden flex-1 lg:block" />

      <nav class="hidden items-center gap-1 text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65 lg:flex">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="border-l border-ink/10 px-3 py-1 transition-colors hover:text-ink first:border-l-0 dark:border-paper/20 dark:hover:text-paper"
          active-class="!text-ink dark:!text-paper"
        >
          {{ link.label }}
        </RouterLink>
        <button
          type="button"
          class="border-l border-ink/10 px-3 py-1 transition-colors hover:text-ink dark:border-paper/20 dark:hover:text-paper"
          :title="t('header.language')"
          @click="toggleLanguage"
        >
          {{ currentLang.toUpperCase() }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 border-l border-ink/10 px-3 py-1 transition-colors hover:text-ink dark:border-paper/20 dark:hover:text-paper"
          :title="t('header.theme')"
          @click="cycleTheme"
        >
          <PhSun v-if="resolvedTheme === 'light'" :size="14" weight="light" />
          <PhMoon v-else :size="14" weight="light" />
          {{ theme }}
        </button>
        <RouterLink
          v-if="!auth.isAuthenticated"
          to="/login"
          class="inline-flex items-center gap-2 border-l border-ink/10 px-3 py-1 transition-colors hover:text-ink dark:border-paper/20 dark:hover:text-paper"
        >
          <PhSignIn :size="14" weight="light" />
          {{ t('auth.login') }}
        </RouterLink>
        <template v-else>
          <RouterLink to="/me" class="border-l border-ink/10 px-3 py-1 transition-colors hover:text-ink dark:border-paper/20 dark:hover:text-paper">
            {{ t('header.cabinet') }}
          </RouterLink>
          <RouterLink
            v-if="auth.isAdmin"
            to="/admin/users"
            class="border-l border-ink/10 px-3 py-1 transition-colors hover:text-ink dark:border-paper/20 dark:hover:text-paper"
          >
            {{ t('header.admin') }}
          </RouterLink>
          <button
            type="button"
            class="inline-flex items-center gap-2 border-l border-ink/10 px-3 py-1 whitespace-nowrap transition-colors hover:text-ink dark:border-paper/20 dark:hover:text-paper"
            @click="handleLogout"
          >
            <PhSignOut :size="14" weight="light" />
            {{ t('auth.logout') }}
          </button>
        </template>
      </nav>

      <div class="lg:hidden">
        <button
          type="button"
          class="inline-flex items-center border border-ink/20 p-2 text-ink dark:border-paper/30 dark:text-paper"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <PhList v-if="!mobileMenuOpen" :size="20" weight="light" />
          <PhX v-else :size="20" weight="light" />
        </button>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 bg-paper/95 px-6 pb-10 pt-28 dark:bg-night/95 lg:hidden">
        <nav class="space-y-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block font-serif text-4xl tracking-tight text-ink transition-colors hover:text-accent dark:text-paper"
            @click="closeMobile"
          >
            {{ link.label }}
          </RouterLink>
          <div class="mt-10 border-t border-ink/10 pt-6 dark:border-night-border">
            <div class="mb-6 flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">
              <button type="button" @click="toggleLanguage">{{ currentLang.toUpperCase() }}</button>
              <span>·</span>
              <button type="button" @click="cycleTheme">{{ theme }}</button>
            </div>
            <RouterLink
              v-if="!auth.isAuthenticated"
              to="/login"
              class="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-ink dark:text-paper"
              @click="closeMobile"
            >
              <PhSignIn :size="14" weight="light" />
              {{ t('auth.login') }}
            </RouterLink>
            <template v-else>
              <div class="text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">
                {{ getUserInitials() }} · {{ auth.user?.email }}
              </div>
              <div class="mt-4 flex flex-col gap-3 text-sm font-mono uppercase tracking-wider">
                <RouterLink to="/me" class="text-ink dark:text-paper" @click="closeMobile">{{ t('header.cabinet') }}</RouterLink>
                <RouterLink
                  v-if="auth.isAdmin"
                  to="/admin/users"
                  class="text-ink dark:text-paper"
                  @click="closeMobile"
                >
                  {{ t('header.admin') }}
                </RouterLink>
                <button type="button" class="text-left text-ink dark:text-paper" @click="handleLogout">{{ t('auth.logout') }}</button>
              </div>
            </template>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>
