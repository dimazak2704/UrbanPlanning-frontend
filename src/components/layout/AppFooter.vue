<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-night-border bg-night text-paper/75">
    <div class="container-app py-20">
      <p class="border-b border-night-border pb-10 font-serif text-5xl font-light tracking-tight text-paper md:text-7xl">
        Urban Planning Platform
      </p>

      <div class="grid grid-cols-1 gap-10 py-10 text-center md:grid-cols-3">
        <div class="mx-auto">
          <p class="mb-4 text-xs font-mono uppercase tracking-[0.2em] text-paper/55">{{ t('footer.links') }}</p>
          <div class="space-y-3">
            <RouterLink to="/cities" class="block link-underline text-base text-paper">{{ t('header.cities') }}</RouterLink>
            <RouterLink to="/projects" class="block link-underline text-base text-paper">{{ t('header.projects') }}</RouterLink>
            <RouterLink to="/map" class="block link-underline text-base text-paper">{{ t('header.map') }}</RouterLink>
            <RouterLink to="/architects" class="block link-underline text-base text-paper">{{ t('header.architects') }}</RouterLink>
          </div>
        </div>

        <div class="mx-auto">
          <p class="mb-4 text-xs font-mono uppercase tracking-[0.2em] text-paper/55">{{ t('footer.contacts') }}</p>
          <div class="space-y-3 text-base text-paper">
            <p>admin@urbanplan.ua</p>
            <p>+380 44 123 45 67</p>
            <p>{{ t('footer.location') }}</p>
          </div>
        </div>

        <div class="mx-auto">
          <p class="mb-4 text-xs font-mono uppercase tracking-[0.2em] text-paper/55">{{ t('footer.description') }}</p>
          <p class="max-w-sm text-base leading-relaxed text-paper/75">
            {{ t('home.heroDescription') }}
          </p>
        </div>
      </div>

      <div class="border-t border-night-border pt-6 text-xs font-mono uppercase tracking-[0.2em] text-paper/50">
        © {{ new Date().getFullYear() }} UrbanPlan · v1.0.0
      </div>
    </div>
  </footer>
</template>
