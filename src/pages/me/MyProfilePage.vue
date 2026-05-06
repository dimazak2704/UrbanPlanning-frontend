<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
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
const profileErrors = ref<Record<string, string>>({})

const pwdForm = ref<ChangePasswordRequest>({ currentPassword: '', newPassword: '' })
const confirmPwd = ref('')
const pwdSaving = ref(false)
const pwdErrors = ref<{current?: string; new?: string; confirm?: string}>({})

const avatarUrl = ref<string | null>(null)
const avatarSaving = ref(false)
const avatarInitialized = ref(false)
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
    avatarInitialized.value = true
  } catch {
    toast.error(t('me.profileLoadError'))
  }
}

onMounted(fetchProfile)

watch(avatarUrl, async (next, prev) => {
  if (!avatarInitialized.value) return
  if (next === prev) return
  if (avatarSaving.value) return

  avatarSaving.value = true
  try {
    const { data } = await updateMyProfile({ avatarUrl: next })
    profile.value = data
    avatarUrl.value = data.avatarUrl || null
    toast.success(t('me.profileSaved'))
  } catch {
    avatarUrl.value = prev ?? null
    toast.error(t('me.profileSaveError'))
  } finally {
    avatarSaving.value = false
  }
})

const hasChanges = computed(() => {
  if (!originalProfile.value) return false
  return Object.keys(profileForm.value).some(k => profileForm.value[k as keyof typeof profileForm.value] !== originalProfile.value![k as keyof typeof originalProfile.value])
})

async function saveProfile() {
  if (!hasChanges.value) return
  profileErrors.value = {}
  if (!profileForm.value.lastName?.trim()) profileErrors.value.lastName = t('validation.required')
  if (!profileForm.value.firstName?.trim()) profileErrors.value.firstName = t('validation.required')
  if (profileForm.value.experienceYears !== undefined && profileForm.value.experienceYears <= 0) {
    profileErrors.value.experienceYears = t('validation.minValue', { min: 1 })
  }
  if (Object.keys(profileErrors.value).length > 0) return
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
    toast.success(t('me.passwordChanged'))
    pwdForm.value = { currentPassword: '', newPassword: '' }
    confirmPwd.value = ''
  } catch (err: any) {
    if (err.response?.status === 400) toast.error(t('me.wrongCurrentPassword'))
    else toast.error(t('me.passwordChangeError'))
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
  <div class="max-w-5xl min-h-[calc(100vh-260px)] space-y-8 pb-10">
    <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('me.profile') }}</h1>

    <div v-if="profile" class="card">
      <TabGroup>
        <TabList class="mb-6 flex space-x-1 border border-ink/10 bg-paper-warm p-1 dark:border-night-border dark:bg-night-elevated">
          <Tab v-if="auth.isArchitect" v-slot="{ selected }" as="template">
            <button :class="['w-full py-2.5 text-xs font-mono uppercase tracking-wider focus:outline-none', selected ? 'border border-ink/20 bg-paper-pure text-ink dark:border-paper/35 dark:bg-night-soft dark:text-paper' : 'text-ink-muted hover:text-ink dark:text-paper/65 dark:hover:text-paper']">
              {{ t('me.profileTab') }}
            </button>
          </Tab>
          <Tab v-slot="{ selected }" as="template">
            <button :class="['w-full py-2.5 text-xs font-mono uppercase tracking-wider focus:outline-none', selected ? 'border border-ink/20 bg-paper-pure text-ink dark:border-paper/35 dark:bg-night-soft dark:text-paper' : 'text-ink-muted hover:text-ink dark:text-paper/65 dark:hover:text-paper']">
              {{ t('me.securityTab') }}
            </button>
          </Tab>
          <Tab v-slot="{ selected }" as="template">
            <button :class="['w-full py-2.5 text-xs font-mono uppercase tracking-wider focus:outline-none', selected ? 'border border-ink/20 bg-paper-pure text-ink dark:border-paper/35 dark:bg-night-soft dark:text-paper' : 'text-ink-muted hover:text-ink dark:text-paper/65 dark:hover:text-paper']">
              {{ t('me.accountTab') }}
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
              <div v-if="avatarUrl" class="pt-4">
                <BaseButton variant="danger" size="sm" @click="showAvatarDelete = true">{{ t('me.deleteAvatar') }}</BaseButton>
              </div>
            </div>

            <form @submit.prevent="saveProfile" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <BaseInput v-model="profileForm.lastName" :label="t('me.lastName')" :error="profileErrors.lastName" />
                <BaseInput v-model="profileForm.firstName" :label="t('me.firstName')" :error="profileErrors.firstName" />
                <BaseInput v-model="profileForm.patronymic" :label="t('me.patronymic')" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput v-model="profileForm.specialization" :label="t('me.specializationLabel')" />
                <BaseInput v-model="profileForm.experienceYears" type="number" min="1" :label="t('me.experienceLabel')" :error="profileErrors.experienceYears" />
              </div>
              <BaseInput v-model="profileForm.phoneNumber" :label="t('me.phoneLabel')" />
              <div>
                <label class="mb-2 block text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">{{ t('me.bioLabel') }}</label>
                <textarea v-model="profileForm.bio" rows="4" class="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-base text-ink focus:border-ink focus:outline-none resize-none dark:border-paper/30 dark:text-paper dark:focus:border-paper" />
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
            <h3 class="mb-4 font-serif text-2xl font-medium tracking-tight text-ink dark:text-paper">{{ t('me.changePassword') }}</h3>
            <form @submit.prevent="savePwd" class="space-y-4">
              <BaseInput v-model="pwdForm.currentPassword" type="password" :label="t('me.currentPassword')" :error="pwdErrors.current" />
              <BaseInput v-model="pwdForm.newPassword" type="password" :label="t('me.newPassword')" :error="pwdErrors.new" />
              <BaseInput v-model="confirmPwd" type="password" :label="t('me.confirmPassword')" :error="pwdErrors.confirm" />
              <div class="pt-2">
                <BaseButton type="submit" :loading="pwdSaving">{{ t('me.changePasswordBtn') }}</BaseButton>
              </div>
            </form>
          </TabPanel>

          <!-- Акаунт -->
          <TabPanel class="focus:outline-none">
            <h3 class="mb-4 font-serif text-2xl font-medium tracking-tight text-ink dark:text-paper">{{ t('me.accountInfo') }}</h3>
            <div class="space-y-4 max-w-md">
              <div class="flex justify-between border-b border-ink/10 py-3 dark:border-night-border">
                <span class="text-sm font-medium text-ink-muted dark:text-paper/65">Email</span>
                <span class="text-sm text-ink dark:text-paper">{{ profile.email }}</span>
              </div>
              <div class="flex justify-between border-b border-ink/10 py-3 dark:border-night-border">
                <span class="text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('me.roleLabel') }}</span>
                <span class="text-sm text-ink dark:text-paper">{{ ROLE_LABELS[profile.role] }}</span>
              </div>
              <div class="flex justify-between border-b border-ink/10 py-3 dark:border-night-border">
                <span class="text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('me.statusLabel') }}</span>
                <span class="text-sm font-medium text-status-completed">{{ t('me.activeStatus') }}</span>
              </div>
              <div class="flex justify-between border-b border-ink/10 py-3 dark:border-night-border">
                <span class="text-sm font-medium text-ink-muted dark:text-paper/65">{{ t('me.registrationDate') }}</span>
                <span class="text-sm text-ink dark:text-paper">{{ formatDate(profile.createdAt) }}</span>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>

    <ConfirmDialog
      v-model="showAvatarDelete"
      :title="t('me.deleteAvatarConfirm')"
      :message="t('me.deleteAvatarMessage')"
      @confirm="handleDeleteAvatar"
    />
  </div>
</template>
