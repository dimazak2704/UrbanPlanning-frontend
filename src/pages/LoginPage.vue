<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { PhBuildings } from '@phosphor-icons/vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = t('auth.enterEmailAndPassword')
    return
  }

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast.success(t('auth.loginSuccess'))
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err) {
    const message = err instanceof Error ? err.message : t('auth.loginError')
    errorMessage.value = message
    toast.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="border border-ink/10 bg-paper-pure p-10 dark:border-night-border dark:bg-night-soft">
    <div class="mb-10 text-center">
      <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-ink/20 dark:border-paper/25">
        <PhBuildings :size="28" weight="thin" class="text-ink-muted dark:text-paper/65" />
      </div>
      <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('auth.loginTitle') }}</h1>
      <p class="mt-2 text-xs font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">{{ t('auth.loginSubtitle') }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleLogin">
      <BaseInput
        v-model="email"
        :label="t('auth.email')"
        type="email"
        placeholder="admin@urban.com"
        required
        :disabled="loading"
      />

      <BaseInput
        v-model="password"
        :label="t('auth.password')"
        type="password"
        placeholder="••••••••"
        required
        :disabled="loading"
      />

      <div
        v-if="errorMessage"
        class="border border-status-suspended/40 bg-accent-soft/20 px-4 py-3 text-sm text-status-suspended"
      >
        {{ errorMessage }}
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
        :loading="loading"
        :disabled="loading"
      >
        {{ t('auth.login') }}
      </BaseButton>
    </form>

  </div>
</template>
