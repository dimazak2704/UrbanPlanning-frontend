<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { BuildingOffice2Icon } from '@heroicons/vue/24/solid'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Введіть email та пароль'
    return
  }

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast.success('Вхід виконано успішно')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Помилка входу'
    errorMessage.value = message
    toast.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/30">
        <BuildingOffice2Icon class="h-8 w-8 text-white" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900">Вхід до системи</h1>
      <p class="mt-1.5 text-sm text-slate-500">Urban Planning Platform</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleLogin">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="admin@urban.com"
        required
        :disabled="loading"
      />

      <BaseInput
        v-model="password"
        label="Пароль"
        type="password"
        placeholder="••••••••"
        required
        :disabled="loading"
      />

      <div
        v-if="errorMessage"
        class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
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
        Увійти
      </BaseButton>
    </form>

    <div class="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-4">
      <p class="text-xs font-medium text-slate-500 mb-2">Тестові облікові записи:</p>
      <div class="space-y-1.5 text-xs text-slate-600">
        <p>
          <span class="font-medium text-slate-700">Адмін:</span>
          admin@urban.com / admin123
        </p>
        <p>
          <span class="font-medium text-slate-700">Архітектор:</span>
          ivan.shevchenko@urban.com / password123
        </p>
      </div>
    </div>
  </div>
</template>
