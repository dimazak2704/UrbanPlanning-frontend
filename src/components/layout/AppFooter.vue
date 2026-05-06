<script setup lang="ts">
import { BuildingOffice2Icon } from '@heroicons/vue/24/solid'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-slate-800 bg-slate-900 text-slate-400">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <!-- About -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <BuildingOffice2Icon class="h-6 w-6 text-primary-400" />
            <span class="text-lg font-bold text-white">
              Urban<span class="text-primary-400">Plan</span>
            </span>
          </div>
          <p class="text-sm leading-relaxed">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
            {{ t('footer.links') }}
          </h3>
          <ul class="space-y-2.5">
            <li>
              <RouterLink to="/cities" class="text-sm hover:text-white transition-colors">
                {{ t('header.cities') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/projects" class="text-sm hover:text-white transition-colors">
                {{ t('header.projects') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/map" class="text-sm hover:text-white transition-colors">
                {{ t('header.map') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/architects" class="text-sm hover:text-white transition-colors">
                {{ t('header.architects') }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contacts -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
            {{ t('footer.contacts') }}
          </h3>
          <ul class="space-y-2.5 text-sm">
            <li>📧 admin@urbanplan.ua</li>
            <li>📞 +380 44 123 45 67</li>
            <li>📍 {{ t('footer.location') }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
        © {{ new Date().getFullYear() }} UrbanPlan.
      </div>
    </div>
  </footer>
</template>
