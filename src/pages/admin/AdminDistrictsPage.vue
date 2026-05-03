<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
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
import LocationPicker from '@/components/forms/LocationPicker.vue'

import { getDistricts, createDistrict, updateDistrict, deleteDistrict } from '@/api/districts.api'
import { getCities } from '@/api/cities.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import { DISTRICT_TYPE_LABELS } from '@/utils/enum-labels'
import type { District, DistrictCreateRequest, DistrictFilters } from '@/types/district'
import type { DistrictType } from '@/types/enums'

const toast = useToastStore()
const loading = ref(true)
const districts = ref<District[]>([])

const filters = ref<DistrictFilters>({ name: '', cityId: undefined, type: undefined })
const { page, totalPages, totalElements, updatePage, setTotal } = usePagination(0)
const debouncedFilters = useDebounce(filters.value, 500)

const typeOptions = Object.entries(DISTRICT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const cityOptions = ref<{value: number, label: string}[]>([])

async function fetchCities() {
  try {
    const { data } = await getCities(undefined, { size: 100 })
    cityOptions.value = data.content.map(c => ({ value: c.id, label: c.name }))
  } catch {
    /* ignore */
  }
}

async function fetchDistricts() {
  loading.value = true
  try {
    const { data } = await getDistricts(debouncedFilters.value, { page: page.value, size: 10, sort: 'name,asc' })
    districts.value = data.content
    setTotal(data.totalElements, data.totalPages)
  } catch {
    toast.error('Помилка завантаження районів')
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters, page], fetchDistricts)
watch(filters, () => { page.value = 0 }, { deep: true })

onMounted(async () => {
  await fetchCities()
  await fetchDistricts()
})

// Modal
const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const currentId = ref(0)
const location = ref<{lat: number, lng: number} | null>(null)
const form = ref<DistrictCreateRequest>({
  name: '', type: 'RESIDENTIAL', population: 0, area: 0, cityId: 0, latitude: 0, longitude: 0
})

watch(location, (val) => {
  if (val) { form.value.latitude = val.lat; form.value.longitude = val.lng }
}, { deep: true })

function openCreate() {
  isEdit.value = false
  form.value = { name: '', type: 'RESIDENTIAL', population: 0, area: 0, cityId: cityOptions.value.length > 0 ? cityOptions.value[0].value : 0, latitude: 48.3794, longitude: 31.1656 }
  location.value = { lat: 48.3794, lng: 31.1656 }
  showModal.value = true
}

function openEdit(district: District) {
  isEdit.value = true
  currentId.value = district.id
  form.value = { ...district }
  location.value = { lat: district.latitude, lng: district.longitude }
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      await updateDistrict(currentId.value, form.value)
      toast.success('Район оновлено')
    } else {
      await createDistrict(form.value)
      toast.success('Район створено')
    }
    showModal.value = false
    fetchDistricts()
  } catch {
    toast.error('Помилка збереження')
  } finally {
    saving.value = false
  }
}

// Delete
const itemToDelete = ref<District | null>(null)
async function confirmDelete() {
  if (!itemToDelete.value) return
  try {
    await deleteDistrict(itemToDelete.value.id)
    toast.success('Район видалено')
    if (districts.value.length === 1 && page.value > 0) page.value--
    else fetchDistricts()
  } catch {
    toast.error('Помилка видалення')
  } finally {
    itemToDelete.value = null
  }
}

function getTypeColor(type: DistrictType) {
  switch (type) {
    case 'RESIDENTIAL': return 'emerald'
    case 'INDUSTRIAL': return 'slate'
    case 'RECREATIONAL': return 'teal'
    case 'MIXED': return 'indigo'
    default: return 'slate'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">Управління районами</h1>
      <BaseButton @click="openCreate"><template #iconLeft><PlusIcon class="h-4 w-4" /></template>Додати район</BaseButton>
    </div>

    <FilterPanel @reset="filters = { name: '', cityId: undefined, type: undefined }">
      <BaseInput v-model="filters.name" placeholder="Пошук за назвою..." />
      <BaseSelect v-model="filters.cityId" :options="cityOptions" placeholder="Всі міста" />
      <BaseSelect v-model="filters.type" :options="typeOptions" placeholder="Всі типи" />
    </FilterPanel>

    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Назва</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Місто</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Тип</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Населення</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">Дії</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="districts.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <EmptyState title="Не знайдено" description="Спробуйте змінити фільтри пошуку." />
              </td>
            </tr>
            <tr v-else v-for="district in districts" :key="district.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ district.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ district.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ district.cityName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseBadge :variant="getTypeColor(district.type)">{{ DISTRICT_TYPE_LABELS[district.type] }}</BaseBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ district.population }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEdit(district)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button @click="itemToDelete = district" class="text-red-600 hover:text-red-900">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && districts.length > 0" class="border-t border-slate-200 px-6 py-4 bg-slate-50">
        <Pagination :current-page="page" :total-pages="totalPages" @update:page="updatePage" />
      </div>
    </div>

    <BaseModal v-model="showModal" :title="isEdit ? 'Редагувати район' : 'Новий район'" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.name" label="Назва *" required />
          <BaseSelect v-model="form.cityId" :options="cityOptions" label="Місто *" required />
        </div>
        <div class="grid grid-cols-1 gap-4">
          <BaseSelect v-model="form.type" :options="typeOptions" label="Тип *" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.population" type="number" label="Населення" />
          <BaseInput v-model="form.area" type="number" label="Площа (кв.км)" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Локація на карті</label>
          <LocationPicker v-model="location" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton type="button" variant="secondary" @click="showModal = false">Скасувати</BaseButton>
          <BaseButton type="submit" :loading="saving">Зберегти</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      v-model="itemToDelete !== null"
      title="Видалити район?"
      :message="`Ви впевнені, що хочете видалити район ${itemToDelete?.name}?`"
      @confirm="confirmDelete"
      @cancel="itemToDelete = null"
    />
  </div>
</template>
