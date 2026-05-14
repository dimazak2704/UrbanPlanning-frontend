<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { PhPencilSimple, PhPlus, PhTrash } from '@phosphor-icons/vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Pagination from '@/components/tables/Pagination.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import LocationPicker from '@/components/forms/LocationPicker.vue'
import SortSelect from '@/components/tables/SortSelect.vue'

import { getCities, createCity, updateCity, deleteCity } from '@/api/cities.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import type { City, CityCreateRequest, CityFilters } from '@/types/city'
import { getApiErrorMessage } from '@/utils/api-error'

const toast = useToastStore()
const { t } = useI18n()
const loading = ref(true)
const cities = ref<City[]>([])
const sort = ref('name,asc')

const filters = ref<CityFilters>({ name: '', region: '' })
const pagination = usePagination({ defaultSize: 10 })
const debouncedFilters = useDebounce(filters, 500)
const sortOptions = [
  { value: 'name,asc', label: t('cities.sortNameAsc') },
  { value: 'name,desc', label: t('cities.sortNameDesc') },
  { value: 'population,desc', label: t('cities.sortPopDesc') },
  { value: 'population,asc', label: t('cities.sortPopAsc') },
  { value: 'area,desc', label: t('cities.sortAreaDesc') },
  { value: 'area,asc', label: t('cities.sortAreaAsc') },
]

async function fetchCities() {
  loading.value = true
  try {
    const { data } = await getCities(debouncedFilters.value, { page: pagination.page.value, size: pagination.size.value, sort: sort.value })
    cities.value = data.content
    pagination.updateFromResponse(data)
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('cities.loadError')))
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchCities() }, { deep: true })
watch(() => pagination.page.value, fetchCities)
watch(() => pagination.size.value, fetchCities)

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
      toast.success(t('cities.updateSuccess'))
    } else {
      await createCity(form.value)
      toast.success(t('cities.createSuccess'))
    }
    showModal.value = false
    fetchCities()
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('cities.saveError')))
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
    toast.success(t('cities.deleteSuccess'))
    if (cities.value.length === 1 && pagination.page.value > 0) pagination.page.value--
    else fetchCities()
  } catch (err) {
    toast.error(getApiErrorMessage(err, t('cities.deleteError')))
  } finally {
    itemToDelete.value = null
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-260px)] space-y-8 pb-10">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('admin.citiesManagement') }}</h1>
      <div class="flex items-center gap-3">
        <div class="w-52"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <BaseButton @click="openCreate"><template #iconLeft><PhPlus :size="14" weight="light" /></template>{{ t('cities.addCity') }}</BaseButton>
      </div>
    </div>

    <FilterPanel :has-active-filters="Boolean(filters.name || filters.region)" @clear="filters = { name: '', region: '' }">
      <BaseInput v-model="filters.name" :placeholder="t('cities.searchByName')" />
      <BaseInput v-model="filters.region" :placeholder="t('cities.searchByRegion')" />
    </FilterPanel>

    <div class="card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="border-b border-ink/10 bg-paper-warm dark:border-night-border dark:bg-night-elevated">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('cities.cityName') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('cities.region') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('cities.population') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('cities.area') }} ({{ t('common.km2') }})</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">{{ t('common.actions') }}</span></th>
            </tr>
          </thead>
          <tbody class="bg-paper-pure dark:bg-night-soft">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="cities.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <EmptyState :title="t('cities.notFound')" :description="t('cities.notFoundDescription')" />
              </td>
            </tr>
            <tr v-else v-for="city in cities" :key="city.id" class="border-b border-ink/10 hover:bg-paper-warm dark:border-night-border dark:hover:bg-night-elevated">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-ink-muted dark:text-paper/65">{{ city.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <RouterLink :to="`/cities/${city.id}`" class="text-ink transition-colors hover:text-accent dark:text-paper dark:hover:text-accent">
                  {{ city.name }}
                </RouterLink>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-ink-muted dark:text-paper/65">{{ city.region }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-ink-muted dark:text-paper/65">{{ city.population }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-ink-muted dark:text-paper/65">{{ city.area }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEdit(city)" class="mr-4 text-ink-muted hover:text-accent dark:text-paper/65">
                  <PhPencilSimple :size="18" weight="light" />
                </button>
                <button @click="itemToDelete = city" class="text-status-suspended">
                  <PhTrash :size="18" weight="light" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && cities.length > 0" class="border-t border-ink/10 bg-paper-warm px-6 py-4 dark:border-night-border dark:bg-night-elevated">
        <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value" :total-elements="pagination.totalElements.value" :page-size="pagination.size.value" @update:page="pagination.setPage" @update:size="pagination.setSize" />
      </div>
    </div>

    <BaseModal v-model="showModal" :title="isEdit ? t('cities.editCity') : t('cities.addCity')" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.name" :label="t('cities.cityName')" required />
          <BaseInput v-model="form.region" :label="t('cities.region')" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.population" type="number" min="1" :label="t('cities.population')" />
          <BaseInput v-model="form.area" type="number" min="1" :label="t('cities.area')" />
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
      :model-value="itemToDelete !== null"
      @update:modelValue="(val: boolean) => { if (!val) itemToDelete = null }"
      :title="t('cities.deleteConfirmTitle')"
      :message="t('cities.deleteConfirmDesc')"
      @confirm="confirmDelete"
      @cancel="itemToDelete = null"
    />
  </div>
</template>
