<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Pagination from '@/components/tables/Pagination.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import LocationPicker from '@/components/forms/LocationPicker.vue'

import { getCities, createCity, updateCity, deleteCity } from '@/api/cities.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import type { City, CityCreateRequest, CityFilters } from '@/types/city'

const toast = useToastStore()
const loading = ref(true)
const cities = ref<City[]>([])

const filters = ref<CityFilters>({ name: '', region: '' })
const { page, totalPages, totalElements, updatePage, setTotal } = usePagination(0)
const debouncedFilters = useDebounce(filters.value, 500)

async function fetchCities() {
  loading.value = true
  try {
    const { data } = await getCities(debouncedFilters.value, { page: page.value, size: 10, sort: 'name,asc' })
    cities.value = data.content
    setTotal(data.totalElements, data.totalPages)
  } catch {
    toast.error('Помилка завантаження міст')
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters, page], fetchCities)
watch(filters, () => { page.value = 0 }, { deep: true })

onMounted(fetchCities)

// Modal
const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const currentId = ref(0)
const location = ref<{lat: number, lng: number} | null>(null)
const form = ref<CityCreateRequest>({
  name: '', region: '', population: 0, area: 0, latitude: 0, longitude: 0
})

watch(location, (val) => {
  if (val) { form.value.latitude = val.lat; form.value.longitude = val.lng }
}, { deep: true })

function openCreate() {
  isEdit.value = false
  form.value = { name: '', region: '', population: 0, area: 0, latitude: 48.3794, longitude: 31.1656 } // Ukraine center roughly
  location.value = { lat: 48.3794, lng: 31.1656 }
  showModal.value = true
}

function openEdit(city: City) {
  isEdit.value = true
  currentId.value = city.id
  form.value = { ...city }
  location.value = { lat: city.latitude, lng: city.longitude }
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      await updateCity(currentId.value, form.value)
      toast.success('Місто оновлено')
    } else {
      await createCity(form.value)
      toast.success('Місто створено')
    }
    showModal.value = false
    fetchCities()
  } catch {
    toast.error('Помилка збереження')
  } finally {
    saving.value = false
  }
}

// Delete
const itemToDelete = ref<City | null>(null)
async function confirmDelete() {
  if (!itemToDelete.value) return
  try {
    await deleteCity(itemToDelete.value.id)
    toast.success('Місто видалено')
    if (cities.value.length === 1 && page.value > 0) page.value--
    else fetchCities()
  } catch {
    toast.error('Помилка видалення')
  } finally {
    itemToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">Управління містами</h1>
      <BaseButton @click="openCreate"><template #iconLeft><PlusIcon class="h-4 w-4" /></template>Додати місто</BaseButton>
    </div>

    <FilterPanel @reset="filters = { name: '', region: '' }">
      <BaseInput v-model="filters.name" placeholder="Пошук за назвою..." />
      <BaseInput v-model="filters.region" placeholder="Регіон..." />
    </FilterPanel>

    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Назва</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Регіон</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Населення</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Площа (кв.км)</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">Дії</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="cities.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <EmptyState title="Не знайдено" description="Спробуйте змінити фільтри пошуку." />
              </td>
            </tr>
            <tr v-else v-for="city in cities" :key="city.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ city.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ city.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ city.region }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ city.population }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ city.area }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEdit(city)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button @click="itemToDelete = city" class="text-red-600 hover:text-red-900">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && cities.length > 0" class="border-t border-slate-200 px-6 py-4 bg-slate-50">
        <Pagination :current-page="page" :total-pages="totalPages" @update:page="updatePage" />
      </div>
    </div>

    <BaseModal v-model="showModal" :title="isEdit ? 'Редагувати місто' : 'Нове місто'" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.name" label="Назва *" required />
          <BaseInput v-model="form.region" label="Регіон *" required />
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
      title="Видалити місто?"
      :message="`Ви впевнені, що хочете видалити місто ${itemToDelete?.name}?`"
      @confirm="confirmDelete"
      @cancel="itemToDelete = null"
    />
  </div>
</template>
