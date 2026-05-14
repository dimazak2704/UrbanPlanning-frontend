<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { PhPencilSimple, PhPlus, PhTrash, PhUserCircle } from '@phosphor-icons/vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PhoneInput from '@/components/common/PhoneInput.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Pagination from '@/components/tables/Pagination.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SortSelect from '@/components/tables/SortSelect.vue'

import { getUsers, createUser, updateUser, deleteUser } from '@/api/users.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import { formatDate } from '@/utils/format'
import { getApiErrorMessage } from '@/utils/api-error'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import { ROLE_VALUES } from '@/types/enums'

const toast = useToastStore()
const { t } = useI18n()
const loading = ref(true)
const users = ref<User[]>([])
const sort = ref('id,desc')

const filters = ref({ email: '', role: undefined as string | undefined, active: undefined as boolean | undefined })
const pagination = usePagination({ defaultSize: 10 })
const debouncedFilters = useDebounce(filters, 500)

const roleOptions = computed(() => ROLE_VALUES.map((value) => ({ value, label: t(`enums.role.${value}`) })))
const activeOptions = computed(() => [
  { value: true, label: t('admin.activeLabel') },
  { value: false, label: t('admin.inactiveLabel') },
])
const sortOptions = computed(() => [
  { value: 'id,desc', label: t('common.updatedAt') },
  { value: 'email,asc', label: t('cities.sortNameAsc') },
  { value: 'email,desc', label: t('cities.sortNameDesc') },
])

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await getUsers(debouncedFilters.value, { page: pagination.page.value, size: pagination.size.value, sort: sort.value })
    users.value = data.content
    pagination.updateFromResponse(data)
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('admin.userLoadError')))
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchUsers() }, { deep: true })
watch(() => pagination.page.value, fetchUsers)
watch(() => pagination.size.value, fetchUsers)

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
      toast.success(t('admin.userUpdated'))
    } else {
      await createUser(form.value)
      toast.success(t('admin.userCreated'))
    }
    showModal.value = false
    fetchUsers()
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('admin.userSaveError')))
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
    toast.success(t('admin.userDeleted'))
    if (users.value.length === 1 && pagination.page.value > 0) pagination.page.value--
    else fetchUsers()
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('admin.userDeleteError')))
  } finally {
    userToDelete.value = null
  }
}

async function toggleActive(user: User) {
  try {
    await updateUser(user.id, { active: !user.active } as UpdateUserRequest)
    user.active = !user.active
    toast.success(t('admin.statusChanged', { status: user.active ? t('admin.activeLabel') : t('admin.inactiveLabel') }))
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('admin.statusChangeError')))
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-260px)] space-y-8 pb-10">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('admin.usersManagement') }}</h1>
      <div class="flex items-center gap-3">
        <div class="w-52"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <BaseButton @click="openCreate"><template #iconLeft><PhPlus :size="14" weight="light" /></template>{{ t('admin.addUser') }}</BaseButton>
      </div>
    </div>

    <FilterPanel :has-active-filters="Boolean(filters.email || filters.role || filters.active !== undefined)" @clear="filters = { email: '', role: undefined, active: undefined }">
      <BaseInput v-model="filters.email" :placeholder="t('admin.searchByEmail')" />
      <BaseSelect v-model="filters.role" :options="roleOptions" :placeholder="t('common.all')" />
      <BaseSelect v-model="filters.active" :options="activeOptions" :placeholder="t('common.all')" />
    </FilterPanel>

    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="border-b border-ink/10 bg-paper-warm dark:border-night-border dark:bg-night-elevated">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">{{ t('admin.id') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">{{ t('admin.user') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">{{ t('admin.role') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">{{ t('admin.status') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65">{{ t('admin.registrationDate') }}</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">{{ t('common.actions') }}</span></th>
            </tr>
          </thead>
          <tbody class="bg-paper-pure dark:bg-night-soft">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center text-ink-muted dark:text-paper/65"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-ink-muted dark:text-paper/65">
                <EmptyState :title="t('admin.notFound')" :description="t('admin.notFoundDescription')" />
              </td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id" class="border-b border-ink/10 transition-colors hover:bg-paper-warm dark:border-night-border dark:hover:bg-night-elevated">
              <td class="whitespace-nowrap px-6 py-5 text-sm text-ink-muted dark:text-paper/65">{{ user.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img v-if="user.avatarUrl" class="h-10 w-10 border border-ink/15 object-cover dark:border-paper/25" :src="user.avatarUrl" alt="" />
                    <PhUserCircle v-else :size="40" weight="thin" class="text-ink-subtle dark:text-paper/45" />
                  </div>
                  <div class="ml-4">
                    <RouterLink
                      v-if="user.role === 'ARCHITECT'"
                      :to="`/architects/${user.id}`"
                      class="text-sm font-medium text-ink transition-colors hover:text-accent dark:text-paper dark:hover:text-accent"
                    >
                      {{ user.lastName || user.firstName ? `${user.lastName ?? ''} ${user.firstName ?? ''}`.trim() : user.email }}
                    </RouterLink>
                    <div v-else class="text-sm font-medium text-ink dark:text-paper">{{ user.lastName || user.firstName ? `${user.lastName ?? ''} ${user.firstName ?? ''}`.trim() : user.email }}</div>
                    <div class="text-sm text-ink-muted dark:text-paper/65">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseBadge :variant="user.role === 'ADMIN' ? 'indigo' : 'teal'">{{ t(`enums.role.${user.role}`) }}</BaseBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="toggleActive(user)" :class="[user.active ? 'border-status-completed/50 text-status-completed' : 'border-ink/20 text-ink-muted dark:border-paper/30 dark:text-paper/65', 'border px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-colors']">
                  {{ user.active ? t('admin.activeLabel') : t('admin.inactiveLabel') }}
                </button>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ formatDate(user.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEdit(user)" class="mr-4 text-ink-muted hover:text-accent dark:text-paper/65">
                  <PhPencilSimple :size="18" weight="light" />
                </button>
                <button @click="userToDelete = user" class="text-status-suspended">
                  <PhTrash :size="18" weight="light" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && users.length > 0" class="border-t border-ink/10 bg-paper-warm px-6 py-4 dark:border-night-border dark:bg-night-elevated">
        <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value" :total-elements="pagination.totalElements.value" :page-size="pagination.size.value" @update:page="pagination.setPage" @update:size="pagination.setSize" />
      </div>
    </div>

    <BaseModal v-model="showModal" :title="isEdit ? t('admin.editUser') : t('admin.addUser')" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.email" type="email" :label="t('admin.emailLabel')" required />
          <BaseInput v-if="!isEdit" v-model="form.password" type="password" :label="t('admin.passwordLabel')" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseSelect v-model="form.role" :options="roleOptions" :label="t('admin.roleLabel')" />
          <div>
            <label class="mb-2 block text-sm font-medium text-ink dark:text-paper">{{ t('admin.statusToggle') }}</label>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.active" class="sr-only peer">
              <div class="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span class="ml-3 text-sm font-medium text-ink dark:text-paper">{{ form.active ? t('admin.activeLabel') : t('admin.inactiveLabel') }}</span>
            </label>
          </div>
        </div>

        <template v-if="form.role === 'ARCHITECT'">
          <div class="mt-2 border-t border-ink/10 pt-4 dark:border-night-border">
            <h4 class="mb-3 text-sm font-medium text-ink dark:text-paper">{{ t('architects.title') }}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <BaseInput v-model="form.lastName" :label="t('admin.lastNameLabel')" required />
              <BaseInput v-model="form.firstName" :label="t('admin.firstNameLabel')" required />
              <BaseInput v-model="form.patronymic" :label="t('admin.patronymicLabel')" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <BaseInput v-model="form.specialization" :label="t('admin.specializationLabel')" />
              <BaseInput v-model="form.experienceYears" type="number" min="1" :label="t('admin.experienceLabel')" />
            </div>
            <PhoneInput v-model="form.phoneNumber" :label="t('admin.phoneLabel')" class="mb-4" />
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-ink dark:text-paper">{{ t('admin.bioLabel') }}</label>
              <textarea v-model="form.bio" rows="3" maxlength="5000" :placeholder="t('admin.bioPlaceholder')"
                class="w-full resize-none rounded-lg border border-ink/20 bg-transparent px-3 py-2 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-paper/30 dark:text-paper" />
            </div>
          </div>
        </template>
        
        <div class="flex justify-end gap-3 border-t border-ink/10 pt-4 dark:border-night-border">
          <BaseButton type="button" variant="secondary" @click="showModal = false">{{ t('common.cancel') }}</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ t('common.save') }}</BaseButton>
        </div>
      </form>
    </BaseModal>

      <ConfirmDialog
      :model-value="userToDelete !== null"
      @update:model-value="(val: boolean) => { if (!val) userToDelete = null }"
      :title="t('admin.deleteUserTitle')"
      :message="t('admin.deleteUserMessage', { email: userToDelete?.email || '' })"
      @confirm="confirmDelete"
      @cancel="userToDelete = null"
    />
  </div>
</template>
