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
import { getProjects } from '@/api/projects.api'
import { useToastStore } from '@/stores/toast.store'
import { INFRASTRUCTURE_TYPE_LABELS, INFRASTRUCTURE_STATUS_LABELS } from '@/utils/enum-labels'
import type { InfrastructureCreateRequest } from '@/types/infrastructure'
import type { InfrastructureType, InfrastructureStatus } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
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
const projectOptions = ref<{ value: number; label: string }[]>([])
const typeOptions = computed(() => Object.entries(INFRASTRUCTURE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })))
const statusOptions = computed(() => Object.entries(INFRASTRUCTURE_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = t('validation.required')
  if (!form.value.projectId) errors.value.projectId = t('validation.required')
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
  } catch (err) { toast.error(err instanceof Error ? err.message : t('infrastructures.saveError')) }
  finally { saving.value = false }
}

onMounted(async () => {
  try { const { data } = await getProjects(undefined, { size: 100 }); projectOptions.value = data.content.map((p) => ({ value: p.id, label: p.name })) } catch { /* ignore */ }

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
      }
    } catch { toast.error(t('infrastructures.loadError')); router.push('/infrastructures') }
  }
  loading.value = false
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-slate-900 mb-8">{{ isEdit ? t('infrastructures.editInfrastructure') : t('infrastructures.newInfrastructure') }}</h1>
    <LoadingSpinner v-if="loading" />
    <form v-else @submit.prevent="onSubmit" class="space-y-6">
      <BaseInput v-model="form.name" :label="t('infrastructures.form.name') + ' *'" :placeholder="t('infrastructures.searchByName')" :error="errors.name" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.type" :options="typeOptions" :label="t('infrastructures.form.type') + ' *'" />
        <BaseSelect v-model="form.status" :options="statusOptions" :label="t('infrastructures.form.status') + ' *'" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.projectId" :options="projectOptions" :label="t('projects.projectName') + ' *'" placeholder="..." :error="errors.projectId" :disabled="!isEdit && !!route.query.projectId" />
        <BaseInput v-model="form.budget" :label="t('projects.form.budget')" type="number" placeholder="0" />
      </div>
      <BaseInput v-model="form.constructionDate" :label="t('infrastructures.form.constructionDate')" type="date" />
      <div><label class="block text-sm font-medium text-slate-700 mb-2">{{ t('projects.form.photo') }}</label><ImageUploader v-model="form.imageUrl" endpoint="infrastructures" /></div>
      <div><label class="block text-sm font-medium text-slate-700 mb-2">{{ t('map.location') }}</label><LocationPicker v-model="location" /></div>
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <BaseButton variant="secondary" type="button" @click="router.back()">{{ t('common.cancel') }}</BaseButton>
        <BaseButton type="submit" :disabled="saving">{{ t('common.save') }}</BaseButton>
      </div>
    </form>
  </div>
</template>
