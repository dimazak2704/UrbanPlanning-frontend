<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
import type { District, DistrictCreateRequest, DistrictFilters } from '@/types/district'
import type { DistrictType } from '@/types/enums'

const toast = useToastStore()
const { t } = useI18n()
const loading = ref(true)
const districts = ref<District[]>([])

const filters = ref<DistrictFilters>({ name: '', cityId: undefined, type: undefined })
const { page, totalPages, totalElements, updatePage, setTotal } = usePagination(0)
const debouncedFilters = useDebounce(filters.value, 500)

const typeOptions = computed(() => [
  { value: 'RESIDENTIAL', label: t('enums.districtType.RESIDENTIAL') },
  { value: 'INDUSTRIAL', label: t('enums.districtType.INDUSTRIAL') },
  { value: 'RECREATIONAL', label: t('enums.districtType.RECREATIONAL') },
  { value: 'MIXED', label: t('enums.districtType.MIXED') },
])
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
    toast.error(t('districts.loadError'))
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
      toast.success(t('districts.updateSuccess'))
    } else {
      await createDistrict(form.value)
      toast.success(t('districts.createSuccess'))
    }
    showModal.value = false
    fetchDistricts()
  } catch {
    toast.error(t('districts.saveError'))
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
    toast.success(t('districts.deleteSuccess'))
    if (districts.value.length === 1 && page.value > 0) page.value--
    else fetchDistricts()
  } catch {
    toast.error(t('districts.deleteError'))
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
      <h1 class="text-2xl font-bold text-slate-900">{{ t('admin.districtsManagement') }}</h1>
      <BaseButton @click="openCreate"><template #iconLeft><PlusIcon class="h-4 w-4" /></template>{{ t('districts.addDistrict') }}</BaseButton>
    </div>

    <FilterPanel @reset="filters = { name: '', cityId: undefined, type: undefined }">
      <BaseInput v-model="filters.name" :placeholder="t('cities.searchByName')" />
      <BaseSelect v-model="filters.cityId" :options="cityOptions" :placeholder="t('projects.allCities')" />
      <BaseSelect v-model="filters.type" :options="typeOptions" :placeholder="t('common.all')" />
    </FilterPanel>

    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('districts.districtName') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('cities.cityName') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('districts.type') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{{ t('cities.population') }}</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">{{ t('common.actions') }}</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="districts.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <EmptyState :title="t('cities.notFound')" :description="t('cities.notFoundDescription')" />
              </td>
            </tr>
            <tr v-else v-for="district in districts" :key="district.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ district.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ district.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ district.cityName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseBadge :variant="getTypeColor(district.type)">{{ t(`enums.districtType.${district.type}`) }}</BaseBadge>
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

    <BaseModal v-model="showModal" :title="isEdit ? t('districts.editDistrict') : t('districts.addDistrict')" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.name" :label="t('districts.districtName') + ' *'" required />
          <BaseSelect v-model="form.cityId" :options="cityOptions" :label="t('cities.cityName') + ' *'" required />
        </div>
        <div class="grid grid-cols-1 gap-4">
          <BaseSelect v-model="form.type" :options="typeOptions" :label="t('districts.type') + ' *'" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.population" type="number" :label="t('cities.population')" />
          <BaseInput v-model="form.area" type="number" :label="t('cities.area')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('cities.map') }}</label>
          <LocationPicker v-model="location" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton type="button" variant="secondary" @click="showModal = false">{{ t('common.cancel') }}</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ t('common.save') }}</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      v-model="itemToDelete !== null"
      :title="t('districts.deleteConfirmTitle')"
      :message="t('districts.deleteConfirmDesc')"
      @confirm="confirmDelete"
      @cancel="itemToDelete = null"
    />
  </div>
</template>
