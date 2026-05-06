<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon, PencilSquareIcon, TrashIcon, UserCircleIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Pagination from '@/components/tables/Pagination.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

import { getUsers, createUser, updateUser, deleteUser } from '@/api/users.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import { formatDate } from '@/utils/format'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import type { Role } from '@/types/enums'

const toast = useToastStore()
const { t } = useI18n()
const loading = ref(true)
const users = ref<User[]>([])

const filters = ref({ email: '', role: undefined as string | undefined, active: undefined as boolean | undefined })
const { page, totalPages, totalElements, updatePage, setTotal } = usePagination(0)
const debouncedFilters = useDebounce(filters.value, 500)

const roleOptions = computed(() => [
  { value: 'ADMIN', label: t('enums.role.ADMIN') },
  { value: 'ARCHITECT', label: t('enums.role.ARCHITECT') },
])
const activeOptions = computed(() => [
  { value: true, label: t('common.active') },
  { value: false, label: t('common.inactive') },
])

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await getUsers(debouncedFilters.value, { page: page.value, size: 10, sort: 'id,desc' })
    users.value = data.content
    setTotal(data.totalElements, data.totalPages)
  } catch (err) {
    toast.error(t('users.loadError'))
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters, page], fetchUsers)
watch(filters, () => { page.value = 0 }, { deep: true })

onMounted(fetchUsers)

// Modal state
const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const currentUserId = ref(0)
const form = ref<CreateUserRequest>({
  email: '', password: '', role: 'ARCHITECT', active: true,
  firstName: '', lastName: '', patronymic: '',
  specialization: '', experienceYears: 0, phoneNumber: '', bio: ''
})

function openCreate() {
  isEdit.value = false
  form.value = { email: '', password: '', role: 'ARCHITECT', active: true, firstName: '', lastName: '', patronymic: '', specialization: '', experienceYears: 0, phoneNumber: '', bio: '' }
  showModal.value = true
}

function openEdit(user: User) {
  isEdit.value = true
  currentUserId.value = user.id
  form.value = {
    email: user.email, password: '', role: user.role, active: user.active,
    firstName: user.firstName || '', lastName: user.lastName || '', patronymic: user.patronymic || '',
    specialization: user.specialization || '', experienceYears: user.experienceYears || 0,
    phoneNumber: user.phoneNumber || '', bio: user.bio || ''
  }
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      const updateData: UpdateUserRequest = { ...form.value }
      await updateUser(currentUserId.value, updateData)
      toast.success(t('users.updateSuccess'))
    } else {
      await createUser(form.value)
      toast.success(t('users.createSuccess'))
    }
    showModal.value = false
    fetchUsers()
  } catch (err) {
    toast.error(t('users.saveError'))
  } finally {
    saving.value = false
  }
}

// Delete state
const userToDelete = ref<User | null>(null)
async function confirmDelete() {
  if (!userToDelete.value) return
  try {
    await deleteUser(userToDelete.value.id)
    toast.success(t('users.deleteSuccess'))
    if (users.value.length === 1 && page.value > 0) page.value--
    else fetchUsers()
  } catch {
    toast.error(t('users.deleteError'))
  } finally {
    userToDelete.value = null
  }
}

async function toggleActive(user: User) {
  try {
    await updateUser(user.id, { active: !user.active } as UpdateUserRequest)
    user.active = !user.active
    toast.success(`${t('users.statusChanged')} ${user.active ? t('common.active') : t('common.inactive')}`)
  } catch {
    toast.error(t('users.statusChangeError'))
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('admin.usersManagement') }}</h1>
      <BaseButton @click="openCreate"><template #iconLeft><PlusIcon class="h-4 w-4" /></template>{{ t('users.addUser') }}</BaseButton>
    </div>

    <FilterPanel @reset="filters = { email: '', role: undefined, active: undefined }">
      <BaseInput v-model="filters.email" :placeholder="t('users.searchByEmail')" />
      <BaseSelect v-model="filters.role" :options="roleOptions" :placeholder="t('common.all')" />
      <BaseSelect v-model="(filters as any).active" :options="activeOptions" :placeholder="t('common.all')" />
    </FilterPanel>

    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('admin.id') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('admin.user') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('admin.role') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('admin.status') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('admin.registrationDate') }}</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">{{ t('common.actions') }}</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <EmptyState :title="t('users.notFound')" :description="t('cities.notFoundDescription')" />
              </td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ user.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img v-if="user.avatarUrl" class="h-10 w-10 rounded-full object-cover" :src="user.avatarUrl" alt="" />
                    <UserCircleIcon v-else class="h-10 w-10 text-slate-300" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-slate-900">{{ user.lastName || user.firstName ? `${user.lastName ?? ''} ${user.firstName ?? ''}`.trim() : user.email }}</div>
                    <div class="text-sm text-slate-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseBadge :variant="user.role === 'ADMIN' ? 'indigo' : 'teal'">{{ t(`enums.role.${user.role}`) }}</BaseBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="toggleActive(user)" :class="[user.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-800 hover:bg-slate-200', 'px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors']">
                  {{ user.active ? t('common.active') : t('common.inactive') }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ formatDate(user.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEdit(user)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button @click="userToDelete = user" class="text-red-600 hover:text-red-900">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && users.length > 0" class="border-t border-slate-200 px-6 py-4 bg-slate-50">
        <Pagination :current-page="page" :total-pages="totalPages" @update:page="updatePage" />
      </div>
    </div>

    <BaseModal v-model="showModal" :title="isEdit ? t('users.editUser') : t('users.addUser')" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.email" type="email" :label="t('admin.emailLabel')" required />
          <BaseInput v-if="!isEdit" v-model="form.password" type="password" :label="t('admin.passwordLabel')" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseSelect v-model="form.role" :options="roleOptions" :label="t('admin.roleLabel')" />
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.statusToggle') }}</label>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.active" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span class="ml-3 text-sm font-medium text-slate-900">{{ form.active ? t('common.active') : t('common.inactive') }}</span>
            </label>
          </div>
        </div>

        <template v-if="form.role === 'ARCHITECT'">
          <div class="border-t border-slate-200 pt-4 mt-2">
            <h4 class="text-sm font-medium text-slate-900 mb-3">{{ t('architects.title') }}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <BaseInput v-model="form.lastName" :label="t('admin.lastNameLabel')" required />
              <BaseInput v-model="form.firstName" :label="t('admin.firstNameLabel')" required />
              <BaseInput v-model="form.patronymic" :label="t('admin.patronymicLabel')" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <BaseInput v-model="form.specialization" :label="t('admin.specializationLabel')" />
              <BaseInput v-model="form.experienceYears" type="number" :label="t('admin.experienceLabel')" />
            </div>
            <BaseInput v-model="form.phoneNumber" :label="t('admin.phoneLabel')" class="mb-4" />
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.bioLabel') }}</label>
              <textarea v-model="form.bio" rows="3" maxlength="5000" :placeholder="t('admin.bioPlaceholder')"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none" />
            </div>
          </div>
        </template>
        
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <BaseButton type="button" variant="secondary" @click="showModal = false">{{ t('common.cancel') }}</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ t('common.save') }}</BaseButton>
        </div>
      </form>
    </BaseModal>

      <ConfirmDialog
      :model-value="userToDelete !== null"
      @update:model-value="(val: boolean) => { if (!val) userToDelete = null }"
      :title="t('users.deleteConfirmTitle')"
      :message="t('users.deleteConfirmDesc')"
      @confirm="confirmDelete"
      @cancel="userToDelete = null"
    />
  </div>
</template>
