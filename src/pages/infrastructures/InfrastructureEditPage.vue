<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LocationPicker from '@/components/forms/LocationPicker.vue'
import ImageUploader from '@/components/forms/ImageUploader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getInfrastructureById, createInfrastructure, updateInfrastructure } from '@/api/infrastructures.api'
import { getProjects } from '@/api/projects.api'
import { getDistricts } from '@/api/districts.api'
import { useToastStore } from '@/stores/toast.store'
import { INFRASTRUCTURE_TYPE_LABELS, INFRASTRUCTURE_STATUS_LABELS } from '@/utils/enum-labels'
import type { InfrastructureCreateRequest } from '@/types/infrastructure'
import type { InfrastructureType, InfrastructureStatus } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const isEdit = computed(() => !!route.params.id)
const itemId = computed(() => Number(route.params.id) || 0)
const loading = ref(true)
const saving = ref(false)

const form = ref<InfrastructureCreateRequest>({
  name: '', type: 'TRANSPORT' as InfrastructureType, status: 'PLANNED' as InfrastructureStatus,
  description: '', cost: 0, imageUrl: null, projectId: Number(route.query.projectId) || 0,
  districtId: 0, latitude: 0, longitude: 0,
})

const location = ref<{ lat: number; lng: number } | null>(null)
const projectOptions = ref<{ value: number; label: string }[]>([])
const districtOptions = ref<{ value: number; label: string }[]>([])
const typeOptions = computed(() => Object.entries(INFRASTRUCTURE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })))
const statusOptions = computed(() => Object.entries(INFRASTRUCTURE_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })))
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Назва обов\'язкова'
  if (!form.value.projectId) errors.value.projectId = 'Оберіть проєкт'
  if (!form.value.districtId) errors.value.districtId = 'Оберіть район'
  return Object.keys(errors.value).length === 0
}

watch(location, (val) => {
  if (val) { form.value.latitude = val.lat; form.value.longitude = val.lng }
}, { deep: true })

async function onSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    if (isEdit.value) { await updateInfrastructure(itemId.value, form.value); toast.success('Оновлено') }
    else { const { data } = await createInfrastructure(form.value); toast.success('Створено'); router.push(`/infrastructures/${data.id}`); return }
    router.push(`/infrastructures/${itemId.value}`)
  } catch (err) { toast.error(err instanceof Error ? err.message : 'Помилка') }
  finally { saving.value = false }
}

onMounted(async () => {
  try { const { data } = await getProjects(undefined, { size: 100 }); projectOptions.value = data.content.map((p) => ({ value: p.id, label: p.name })) } catch { /* ignore */ }
  try { const { data } = await getDistricts(undefined, { size: 100 }); districtOptions.value = data.content.map((d) => ({ value: d.id, label: `${d.name} (${d.cityName})` })) } catch { /* ignore */ }
  
  if (isEdit.value) {
    try {
      const { data } = await getInfrastructureById(itemId.value)
      form.value = { name: data.name, type: data.type, status: data.status, description: data.description, cost: data.cost, imageUrl: data.imageUrl, projectId: data.projectId, districtId: data.districtId, latitude: data.latitude, longitude: data.longitude }
      location.value = { lat: data.latitude, lng: data.longitude }
    } catch { toast.error('Помилка'); router.push('/infrastructures') }
  } else if (form.value.projectId) {
    // If projectId is in route query, pre-fill district as well
    try {
      const { data: projData } = await getProjects({ name: '' }, { size: 100 }); // Or use getProjectById if imported
      const targetProj = projData.content.find(p => p.id === form.value.projectId);
      if (targetProj) {
        form.value.districtId = targetProj.districtId;
      }
    } catch { /* ignore */ }
  }
  loading.value = false
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-slate-900 mb-8">{{ isEdit ? 'Редагування інфраструктури' : 'Нова інфраструктура' }}</h1>
    <LoadingSpinner v-if="loading" />
    <form v-else @submit.prevent="onSubmit" class="space-y-6">
      <BaseInput v-model="form.name" label="Назва *" placeholder="Назва об'єкту" :error="errors.name" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.type" :options="typeOptions" label="Тип *" />
        <BaseSelect v-model="form.status" :options="statusOptions" label="Статус *" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.projectId" :options="projectOptions" label="Проєкт *" placeholder="Оберіть проєкт" :error="errors.projectId" :disabled="!isEdit && !!route.query.projectId" />
        <BaseSelect v-model="form.districtId" :options="districtOptions" label="Район *" placeholder="Оберіть район" :error="errors.districtId" :disabled="!isEdit && !!route.query.projectId" />
      </div>
      <BaseInput v-model="form.cost" label="Вартість (₴)" type="number" placeholder="0" />
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Опис</label>
        <textarea v-model="form.description" rows="4" maxlength="5000" placeholder="Опис..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none" />
      </div>
      <div><label class="block text-sm font-medium text-slate-700 mb-2">Фото</label><ImageUploader v-model="form.imageUrl" endpoint="infrastructures" /></div>
      <div><label class="block text-sm font-medium text-slate-700 mb-2">Локація на карті</label><LocationPicker v-model="location" /></div>
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <BaseButton variant="secondary" type="button" @click="router.back()">Скасувати</BaseButton>
        <BaseButton type="submit" :disabled="saving">{{ saving ? 'Збереження...' : 'Зберегти' }}</BaseButton>
      </div>
    </form>
  </div>
</template>
