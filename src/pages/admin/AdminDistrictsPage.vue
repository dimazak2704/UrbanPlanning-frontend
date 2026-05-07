<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { PhPencilSimple, PhPlus, PhTrash } from '@phosphor-icons/vue'
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
import SortSelect from '@/components/tables/SortSelect.vue'

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
const sort = ref('name,asc')

const filters = ref<DistrictFilters>({ name: '', cityId: undefined, type: undefined })
const pagination = usePagination({ defaultSize: 10 })
const debouncedFilters = useDebounce(filters, 500)
const sortOptions = computed(() => [
  { value: 'name,asc', label: t('cities.sortNameAsc') },
  { value: 'name,desc', label: t('cities.sortNameDesc') },
  { value: 'population,desc', label: t('cities.sortPopDesc') },
  { value: 'population,asc', label: t('cities.sortPopAsc') },
])

const typeOptions = computed(() => [
  { value: 'RESIDENTIAL', label: t('enums.districtType.RESIDENTIAL') },
  { value: 'INDUSTRIAL', label: t('enums.districtType.INDUSTRIAL') },
  { value: 'RECREATIONAL', label: t('enums.districtType.RECREATIONAL') },
  { value: 'MIXED', label: t('enums.districtType.MIXED') },
])
const cityOptions = ref<{value: number, label: string}[]>([])
const cityLocations = ref<Record<number, { lat: number; lng: number }>>({})

async function fetchCities() {
  try {
    const { data } = await getCities(undefined, { size: 100 })
    cityOptions.value = data.content.map(c => ({ value: c.id, label: c.name }))
    cityLocations.value = Object.fromEntries(
      data.content
        .filter((c) => c.latitude !== null && c.longitude !== null)
        .map((c) => [c.id, { lat: c.latitude as number, lng: c.longitude as number }]),
    )
  } catch {
    /* ignore */
  }
}

async function fetchDistricts() {
  loading.value = true
  try {
    const { data } = await getDistricts(debouncedFilters.value, { page: pagination.page.value, size: pagination.size.value, sort: sort.value })
    districts.value = data.content
    pagination.updateFromResponse(data)
  } catch {
    toast.error(t('districts.loadError'))
  } finally {
    loading.value = false
  }
}

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchDistricts() }, { deep: true })
watch(() => pagination.page.value, fetchDistricts)
watch(() => pagination.size.value, fetchDistricts)

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
const focusLocation = ref<{lat: number, lng: number} | null>(null)
const form = ref<DistrictCreateRequest>({
  name: '', type: 'RESIDENTIAL', population: 0, area: 0, cityId: 0, latitude: null, longitude: null
})

watch(location, (val) => {
  if (val) { form.value.latitude = val.lat; form.value.longitude = val.lng }
}, { deep: true })

watch(() => form.value.cityId, (cityId) => {
  focusLocation.value = cityLocations.value[cityId] ?? null
})

function openCreate() {
  isEdit.value = false
  const cityId = cityOptions.value.length > 0 ? cityOptions.value[0].value : 0
  form.value = { name: '', type: 'RESIDENTIAL', population: 0, area: 0, cityId, latitude: null, longitude: null }
  location.value = null
  focusLocation.value = cityLocations.value[cityId] ?? null
  showModal.value = true
}

function openEdit(district: District) {
  isEdit.value = true
  currentId.value = district.id
  form.value = { ...district }
  location.value = district.latitude !== null && district.longitude !== null
    ? { lat: district.latitude, lng: district.longitude }
    : null
  focusLocation.value = district.latitude !== null && district.longitude !== null
    ? { lat: district.latitude, lng: district.longitude }
    : (cityLocations.value[district.cityId] ?? null)
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
    if (districts.value.length === 1 && pagination.page.value > 0) pagination.page.value--
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
  <div class="min-h-[calc(100vh-260px)] space-y-8 pb-10">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('admin.districtsManagement') }}</h1>
      <div class="flex items-center gap-3">
        <div class="w-52"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <BaseButton @click="openCreate"><template #iconLeft><PhPlus :size="14" weight="light" /></template>{{ t('districts.addDistrict') }}</BaseButton>
      </div>
    </div>

    <FilterPanel :has-active-filters="Boolean(filters.name || filters.cityId || filters.type)" @clear="filters = { name: '', cityId: undefined, type: undefined }">
      <BaseInput v-model="filters.name" :placeholder="t('cities.searchByName')" />
      <BaseSelect v-model="filters.cityId" :options="cityOptions" :placeholder="t('projects.allCities')" />
      <BaseSelect v-model="filters.type" :options="typeOptions" :placeholder="t('common.all')" />
    </FilterPanel>

    <div class="card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="border-b border-ink/10 bg-paper-warm dark:border-night-border dark:bg-night-elevated">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('districts.districtName') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('cities.cityName') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('districts.type') }}</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('cities.population') }}</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">{{ t('common.actions') }}</span></th>
            </tr>
          </thead>
          <tbody class="bg-paper-pure dark:bg-night-soft">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="districts.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <EmptyState :title="t('cities.notFound')" :description="t('cities.notFoundDescription')" />
              </td>
            </tr>
            <tr v-else v-for="district in districts" :key="district.id" class="border-b border-ink/10 hover:bg-paper-warm dark:border-night-border dark:hover:bg-night-elevated">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-ink-muted dark:text-paper/65">{{ district.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <RouterLink :to="`/districts/${district.id}`" class="text-ink transition-colors hover:text-accent dark:text-paper dark:hover:text-accent">
                  {{ district.name }}
                </RouterLink>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <RouterLink :to="`/cities/${district.cityId}`" class="text-ink-muted transition-colors hover:text-accent dark:text-paper/65 dark:hover:text-accent">
                  {{ district.cityName }}
                </RouterLink>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseBadge :variant="getTypeColor(district.type)">{{ t(`enums.districtType.${district.type}`) }}</BaseBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-ink-muted dark:text-paper/65">{{ district.population }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEdit(district)" class="mr-4 text-ink-muted hover:text-accent dark:text-paper/65">
                  <PhPencilSimple :size="18" weight="light" />
                </button>
                <button @click="itemToDelete = district" class="text-status-suspended">
                  <PhTrash :size="18" weight="light" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && districts.length > 0" class="border-t border-ink/10 bg-paper-warm px-6 py-4 dark:border-night-border dark:bg-night-elevated">
        <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value" :total-elements="pagination.totalElements.value" :page-size="pagination.size.value" @update:page="pagination.setPage" @update:size="pagination.setSize" />
      </div>
    </div>

    <BaseModal v-model="showModal" :title="isEdit ? t('districts.editDistrict') : t('districts.addDistrict')" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.name" :label="t('districts.districtName')" required />
          <BaseSelect v-model="form.cityId" :options="cityOptions" :label="t('cities.cityName')" required />
        </div>
        <div class="grid grid-cols-1 gap-4">
          <BaseSelect v-model="form.type" :options="typeOptions" :label="t('districts.type')" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.population" type="number" min="1" :label="t('cities.population')" />
          <BaseInput v-model="form.area" type="number" min="1" :label="t('cities.area')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('cities.map') }}</label>
          <LocationPicker v-model="location" :focus-location="focusLocation" :focus-zoom="11" />
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
      :title="t('districts.deleteConfirmTitle')"
      :message="t('districts.deleteConfirmDesc')"
      @confirm="confirmDelete"
      @cancel="itemToDelete = null"
    />
  </div>
</template>
