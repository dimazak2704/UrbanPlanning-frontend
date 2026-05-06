<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ImageUploader from '@/components/forms/ImageUploader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { getMyProfile, updateMyProfile, changeMyPassword, deleteMyAvatar } from '@/api/me.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatDate } from '@/utils/format'
import { ROLE_LABELS } from '@/utils/enum-labels'
import type { Me, UpdateMeRequest, ChangePasswordRequest } from '@/types/me'

const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

const profile = ref<Me | null>(null)
const profileForm = ref<UpdateMeRequest>({
  firstName: '', lastName: '', patronymic: '',
  specialization: '', experienceYears: 0, phoneNumber: '', bio: ''
})
const originalProfile = ref<UpdateMeRequest | null>(null)
const profileSaving = ref(false)

const pwdForm = ref<ChangePasswordRequest>({ currentPassword: '', newPassword: '' })
const confirmPwd = ref('')
const pwdSaving = ref(false)
const pwdErrors = ref<{current?: string; new?: string; confirm?: string}>({})

const avatarUrl = ref<string | null>(null)
const showAvatarDelete = ref(false)

async function fetchProfile() {
  try {
    const { data } = await getMyProfile()
    profile.value = data
    profileForm.value = {
      firstName: data.firstName || '', lastName: data.lastName || '', patronymic: data.patronymic || '',
      specialization: data.specialization || '', experienceYears: data.experienceYears || 0,
      phoneNumber: data.phoneNumber || '', bio: data.bio || ''
    }
    originalProfile.value = { ...profileForm.value }
    avatarUrl.value = data.avatarUrl || null
  } catch {
    toast.error(t('me.profileLoadError'))
  }
}

onMounted(fetchProfile)

const hasChanges = computed(() => {
  if (!originalProfile.value) return false
  return Object.keys(profileForm.value).some(k => profileForm.value[k as keyof typeof profileForm.value] !== originalProfile.value![k as keyof typeof originalProfile.value])
})

async function saveProfile() {
  if (!hasChanges.value) return
  profileSaving.value = true
  try {
    const changedFields: Partial<UpdateMeRequest> = {}
    Object.keys(profileForm.value).forEach(k => {
      const key = k as keyof typeof profileForm.value
      if (profileForm.value[key] !== originalProfile.value![key]) {
        changedFields[key] = profileForm.value[key] as never
      }
    })
    const { data } = await updateMyProfile(changedFields as UpdateMeRequest)
    profile.value = data
    originalProfile.value = { ...profileForm.value }
    toast.success(t('me.profileSaved'))
  } catch {
    toast.error(t('me.profileSaveError'))
  } finally {
    profileSaving.value = false
  }
}

async function savePwd() {
  pwdErrors.value = {}
  if (!pwdForm.value.currentPassword) pwdErrors.value.current = t('validation.required')
  if (!pwdForm.value.newPassword) pwdErrors.value.new = t('validation.required')
  else if (pwdForm.value.newPassword.length < 6) pwdErrors.value.new = t('validation.minLength', { min: 6 })
  if (pwdForm.value.newPassword !== confirmPwd.value) pwdErrors.value.confirm = t('validation.passwordsNotMatch')
  
  if (Object.keys(pwdErrors.value).length > 0) return
  
  pwdSaving.value = true
  try {
    await changeMyPassword(pwdForm.value)
    toast.success(t('me.pwdChanged'))
    pwdForm.value = { currentPassword: '', newPassword: '' }
    confirmPwd.value = ''
  } catch (err: any) {
    if (err.response?.status === 400) toast.error(t('me.wrongPwd'))
    else toast.error(t('me.pwdChangeError'))
  } finally {
    pwdSaving.value = false
  }
}

async function handleDeleteAvatar() {
  try {
    await deleteMyAvatar()
    avatarUrl.value = null
    toast.success(t('me.avatarDeleted'))
    showAvatarDelete.value = false
  } catch {
    toast.error(t('me.avatarDeleteError'))
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl">
    <h1 class="text-2xl font-bold text-slate-900">{{ t('me.myProfile') }}</h1>

    <div v-if="profile" class="card">
      <TabGroup>
        <TabList class="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-6">
          <Tab v-if="auth.isArchitect" v-slot="{ selected }" as="template">
            <button :class="['w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2', selected ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-900']">
              {{ t('me.tabs.profile') }}
            </button>
          </Tab>
          <Tab v-slot="{ selected }" as="template">
            <button :class="['w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2', selected ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-900']">
              {{ t('me.tabs.security') }}
            </button>
          </Tab>
          <Tab v-slot="{ selected }" as="template">
            <button :class="['w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2', selected ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-900']">
              {{ t('me.tabs.account') }}
            </button>
          </Tab>
        </TabList>

        <TabPanels>
          <!-- Профіль (Тільки ARCHITECT) -->
          <TabPanel v-if="auth.isArchitect" class="space-y-6 focus:outline-none">
            <div class="flex items-center gap-6 pb-6 border-b border-slate-100">
              <div class="w-32">
                <ImageUploader v-model="avatarUrl" endpoint="avatars" />
              </div>
              <div v-if="avatarUrl">
                <BaseButton variant="danger" size="sm" @click="showAvatarDelete = true">{{ t('me.deleteAvatar') }}</BaseButton>
              </div>
            </div>

            <form @submit.prevent="saveProfile" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <BaseInput v-model="profileForm.lastName" :label="t('forms.lastName')" />
                <BaseInput v-model="profileForm.firstName" :label="t('forms.firstName')" />
                <BaseInput v-model="profileForm.patronymic" :label="t('forms.patronymic')" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput v-model="profileForm.specialization" :label="t('architects.form.specialization')" />
                <BaseInput v-model="profileForm.experienceYears" type="number" :label="t('architects.form.exp')" />
              </div>
              <BaseInput v-model="profileForm.phoneNumber" :label="t('forms.phone')" />
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('architects.form.bio') }}</label>
                <textarea v-model="profileForm.bio" rows="4" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none" />
              </div>
              
              <div class="flex justify-end pt-4">
                <BaseButton type="submit" :disabled="!hasChanges || profileSaving" :loading="profileSaving">
                  {{ t('common.save') }}
                </BaseButton>
              </div>
            </form>
          </TabPanel>

          <!-- Безпека -->
          <TabPanel class="space-y-4 focus:outline-none max-w-md">
            <h3 class="text-lg font-medium text-slate-900 mb-4">{{ t('me.pwdChange') }}</h3>
            <form @submit.prevent="savePwd" class="space-y-4">
              <BaseInput v-model="pwdForm.currentPassword" type="password" :label="t('me.currentPwd') + ' *'" :error="pwdErrors.current" />
              <BaseInput v-model="pwdForm.newPassword" type="password" :label="t('me.newPwd') + ' *'" :error="pwdErrors.new" />
              <BaseInput v-model="confirmPwd" type="password" :label="t('me.confirmPwd') + ' *'" :error="pwdErrors.confirm" />
              <div class="pt-2">
                <BaseButton type="submit" :loading="pwdSaving">{{ t('me.changePwd') }}</BaseButton>
              </div>
            </form>
          </TabPanel>

          <!-- Акаунт -->
          <TabPanel class="focus:outline-none">
            <h3 class="text-lg font-medium text-slate-900 mb-4">{{ t('me.accountInfo') }}</h3>
            <div class="space-y-4 max-w-md">
              <div class="flex justify-between py-3 border-b border-slate-100">
                <span class="text-sm font-medium text-slate-500">Email</span>
                <span class="text-sm text-slate-900">{{ profile.email }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-slate-100">
                <span class="text-sm font-medium text-slate-500">{{ t('forms.role') }}</span>
                <span class="text-sm text-slate-900">{{ ROLE_LABELS[profile.role] }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-slate-100">
                <span class="text-sm font-medium text-slate-500">{{ t('forms.status') }}</span>
                <span class="text-sm text-emerald-600 font-medium">{{ t('common.active') }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-slate-100">
                <span class="text-sm font-medium text-slate-500">{{ t('common.created') }}</span>
                <span class="text-sm text-slate-900">{{ formatDate(profile.createdAt) }}</span>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>

    <ConfirmDialog
      v-model="showAvatarDelete"
      :title="t('me.deleteAvatarConfirm')"
      :message="t('me.deleteAvatarDesc')"
      @confirm="handleDeleteAvatar"
    />
  </div>
</template>
