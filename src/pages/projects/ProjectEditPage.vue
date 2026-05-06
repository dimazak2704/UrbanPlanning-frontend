<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LocationPicker from '@/components/forms/LocationPicker.vue'
import ImageUploader from '@/components/forms/ImageUploader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getProjectById, createProject, updateProject } from '@/api/projects.api'
import { getCities } from '@/api/cities.api'
import { getDistricts } from '@/api/districts.api'
import { getArchitects } from '@/api/architects.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { PROJECT_STATUS_LABELS } from '@/utils/enum-labels'
import type { ProjectCreateRequest } from '@/types/project'
import type { ProjectStatus } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

const isEdit = computed(() => !!route.params.id)
const projectId = computed(() => Number(route.params.id) || 0)
const loading = ref(true)
const saving = ref(false)

const form = ref<ProjectCreateRequest>({ name: '', description: '', status: 'PLANNED' as ProjectStatus, budget: 0, startDate: '', endDate: null, imageUrl: null, cityId: 0, districtId: 0 })
const location = ref<{ lat: number; lng: number } | null>(null)
const cityOptions = ref<{ value: number; label: string }[]>([])
const districtOptions = ref<{ value: number; label: string }[]>([])
const architectOptions = ref<{ value: number; label: string }[]>([])
const statusOptions = computed(() => Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = t('validation.required')
  else if (form.value.name.length > 150) errors.value.name = t('validation.maxLength', { max: 150 })
  if (!form.value.districtId) errors.value.districtId = t('validation.required')
  if (!form.value.status) errors.value.status = t('validation.required')
  if (form.value.endDate && form.value.startDate && form.value.endDate < form.value.startDate) errors.value.endDate = t('validation.endDateBeforeStart')
  return Object.keys(errors.value).length === 0
}

async function onSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    if (isEdit.value) {
      await updateProject(projectId.value, form.value)
      toast.success(t('projects.updateSuccess'))
    } else {
      const { data } = await createProject(form.value)
      toast.success(t('projects.createSuccess'))
      router.push(`/projects/${data.id}`)
      return
    }
    router.push(`/projects/${projectId.value}`)
  } catch (err) { toast.error(err instanceof Error ? err.message : t('projects.saveError')) }
  finally { saving.value = false }
}

async function loadLookups() {
  const [c, a] = await Promise.allSettled([getCities(undefined, { size: 100 }), getArchitects(undefined, { size: 100 })])
  if (c.status === 'fulfilled') cityOptions.value = c.value.data.content.map((x) => ({ value: x.id, label: x.name }))
  if (a.status === 'fulfilled') architectOptions.value = a.value.data.content.map((x) => ({ value: x.id, label: x.fullName }))
}

watch(() => form.value.cityId, async (cityId) => {
  if (!cityId) { districtOptions.value = []; return }
  try {
    const { data } = await getDistricts({ cityId: Number(cityId) }, { size: 100 })
    districtOptions.value = data.content.map((d) => ({ value: d.id, label: d.name }))
  } catch { districtOptions.value = [] }
})

onMounted(async () => {
  await loadLookups()
  if (isEdit.value) {
    try {
      const { data } = await getProjectById(projectId.value)
      form.value = { name: data.name, description: data.description, status: data.status, budget: data.budget, startDate: data.startDate, endDate: data.endDate, imageUrl: data.imageUrl, cityId: data.cityId, districtId: data.districtId }
    } catch (err) { toast.error(t('projects.loadError')); router.push('/projects') }
  }
  loading.value = false
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-slate-900 mb-8">{{ isEdit ? t('projects.editProject') : t('projects.newProject') }}</h1>
    <LoadingSpinner v-if="loading" />
    <form v-else @submit.prevent="onSubmit" class="space-y-6">
      <BaseInput v-model="form.name" :label="t('projects.form.name') + ' *'" :placeholder="t('projects.searchByName')" :error="errors.name" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.cityId" :options="cityOptions" :label="t('cities.cityName') + ' *'" :placeholder="t('projects.allCities')" />
        <BaseSelect v-model="form.districtId" :options="districtOptions" :label="t('districts.districtName') + ' *'" placeholder="..." :error="errors.districtId" :disabled="!form.cityId" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.status" :options="statusOptions" :label="t('projects.form.status') + ' *'" :error="errors.status" />
        <BaseInput v-model="form.budget" :label="t('projects.form.budget')" type="number" placeholder="0" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.startDate" :label="t('projects.form.startDate')" type="date" />
        <BaseInput v-model="form.endDate" :label="t('projects.form.endDate')" type="date" :error="errors.endDate" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('projects.form.description') }}</label>
        <textarea v-model="form.description" rows="5" maxlength="5000"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none" />
        <p class="mt-1 text-xs text-slate-400 text-right">{{ form.description.length }} / 5000</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('projects.form.photo') }}</label>
        <ImageUploader v-model="form.imageUrl" endpoint="projects" />
      </div>
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <BaseButton variant="secondary" type="button" @click="router.back()">{{ t('common.cancel') }}</BaseButton>
        <BaseButton type="submit" :disabled="saving">{{ t('common.save') }}</BaseButton>
      </div>
    </form>
  </div>
</template>
