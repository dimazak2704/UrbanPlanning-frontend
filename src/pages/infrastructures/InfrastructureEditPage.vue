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
import { getInfrastructureById, createInfrastructure, updateInfrastructure } from '@/api/infrastructures.api'
import { getProjects, getProjectById, getMyProjects } from '@/api/projects.api'
import { useToastStore } from '@/stores/toast.store'
import { useAuthStore } from '@/stores/auth.store'
import { INFRASTRUCTURE_TYPE_LABELS, INFRASTRUCTURE_STATUS_LABELS } from '@/utils/enum-labels'
import type { InfrastructureCreateRequest } from '@/types/infrastructure'
import {
  INFRASTRUCTURE_STATUS_VALUES,
  INFRASTRUCTURE_TYPE_VALUES,
  type InfrastructureType,
  type InfrastructureStatus,
} from '@/types/enums'
import { getApiErrorMessage } from '@/utils/api-error'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const auth = useAuthStore()
const { t } = useI18n()
const isEdit = computed(() => !!route.params.id)
const itemId = computed(() => Number(route.params.id) || 0)
const loading = ref(true)
const saving = ref(false)

const form = ref<InfrastructureCreateRequest>({
  name: '', type: 'TRANSPORT' as InfrastructureType, status: 'PLANNED' as InfrastructureStatus,
  budget: null, imageUrl: null, projectId: Number(route.query.projectId) || 0,
  constructionDate: null, latitude: null, longitude: null,
})

const location = ref<{ lat: number; lng: number } | null>(null)
const focusLocation = ref<{ lat: number; lng: number } | null>(null)
const projectOptions = ref<{ value: number; label: string }[]>([])
const projectLocations = ref<Record<number, { lat: number; lng: number }>>({})
const typeOptions = computed(() =>
  INFRASTRUCTURE_TYPE_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_TYPE_LABELS[value] })),
)
const statusOptions = computed(() =>
  INFRASTRUCTURE_STATUS_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_STATUS_LABELS[value] })),
)
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = t('validation.required')
  if (!form.value.projectId) errors.value.projectId = t('validation.required')
  if (form.value.budget !== null && form.value.budget <= 0) errors.value.budget = t('validation.minValue', { min: 1 })
  return Object.keys(errors.value).length === 0
}

watch(location, (val) => {
  if (val) { form.value.latitude = val.lat; form.value.longitude = val.lng }
  else { form.value.latitude = null; form.value.longitude = null }
}, { deep: true })

async function onSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    if (isEdit.value) { await updateInfrastructure(itemId.value, form.value); toast.success(t('infrastructures.updateSuccess')) }
    else { const { data } = await createInfrastructure(form.value); toast.success(t('infrastructures.createSuccess')); router.push(`/infrastructures/${data.id}`); return }
    router.push(`/infrastructures/${itemId.value}`)
  } catch (err) { toast.error(getApiErrorMessage(err, t('infrastructures.saveError'))) }
  finally { saving.value = false }
}

onMounted(async () => {
  try {
    const response = auth.isArchitect
      ? await getMyProjects(undefined, { size: 100, sort: 'updatedAt,desc' })
      : await getProjects(undefined, { size: 100, sort: 'updatedAt,desc' })
    projectOptions.value = response.data.content.map((p) => ({ value: p.id, label: p.name }))
    projectLocations.value = Object.fromEntries(
      response.data.content
        .filter((p) => p.latitude !== null && p.longitude !== null)
        .map((p) => [p.id, { lat: p.latitude as number, lng: p.longitude as number }]),
    )
    if (!isEdit.value && form.value.projectId) {
      focusLocation.value = projectLocations.value[form.value.projectId] ?? null
    }
  } catch { /* ignore */ }

  if (isEdit.value) {
    try {
      const { data } = await getInfrastructureById(itemId.value)
      form.value = {
        name: data.name, type: data.type, status: data.status,
        budget: data.budget, imageUrl: data.imageUrl,
        projectId: data.projectId,
        constructionDate: data.constructionDate,
        latitude: data.latitude, longitude: data.longitude,
      }
      if (data.latitude && data.longitude) {
        location.value = { lat: data.latitude, lng: data.longitude }
        focusLocation.value = { lat: data.latitude, lng: data.longitude }
      }
    } catch (err) { toast.error(getApiErrorMessage(err, t('infrastructures.loadError'))); router.push('/infrastructures') }
  }
  loading.value = false
})

watch(() => form.value.projectId, async (projectId) => {
  if (!projectId) return
  const known = projectLocations.value[projectId]
  if (known) {
    focusLocation.value = known
    return
  }
  try {
    const { data } = await getProjectById(projectId)
    if (data.latitude !== null && data.longitude !== null) {
      const coords = { lat: data.latitude, lng: data.longitude }
      focusLocation.value = coords
      projectLocations.value[projectId] = coords
    }
  } catch {
    // ignore, keep manual picker
  }
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="mb-8 text-3xl font-bold text-ink dark:text-paper">{{ isEdit ? t('infrastructures.editInfrastructure') : t('infrastructures.newInfrastructure') }}</h1>
    <LoadingSpinner v-if="loading" />
    <form v-else @submit.prevent="onSubmit" class="space-y-6">
      <BaseInput v-model="form.name" :label="t('infrastructures.form.name')" required :placeholder="t('infrastructures.form.name')" :error="errors.name" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.type" :options="typeOptions" :label="t('infrastructures.form.type')" />
        <BaseSelect v-model="form.status" :options="statusOptions" :label="t('infrastructures.form.status')" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.projectId" :options="projectOptions" :label="t('projects.projectName')" placeholder="..." :error="errors.projectId" :disabled="!isEdit && !!route.query.projectId" />
        <BaseInput v-model="form.budget" :label="t('projects.form.budget')" type="number" min="1" placeholder="1" :error="errors.budget" />
      </div>
      <BaseInput v-model="form.constructionDate" :label="t('infrastructures.form.constructionDate')" type="date" />
      <div><label class="mb-2 block text-sm font-medium text-ink dark:text-paper">{{ t('projects.form.photo') }}</label><ImageUploader v-model="form.imageUrl" endpoint="infrastructures" /></div>
      <div><label class="mb-2 block text-sm font-medium text-ink dark:text-paper">{{ t('map.location') }}</label><LocationPicker v-model="location" :focus-location="focusLocation" :focus-zoom="14" /></div>
      <div class="flex justify-end gap-3 border-t border-ink/10 pt-4 dark:border-night-border">
        <BaseButton variant="secondary" type="button" @click="router.back()">{{ t('common.cancel') }}</BaseButton>
        <BaseButton type="submit" :disabled="saving">{{ t('common.save') }}</BaseButton>
      </div>
    </form>
  </div>
</template>
