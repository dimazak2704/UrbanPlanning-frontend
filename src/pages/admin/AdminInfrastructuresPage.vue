<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhPencilSimple, PhPlus, PhTrash } from '@phosphor-icons/vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import Pagination from '@/components/tables/Pagination.vue'
import FilterPanel from '@/components/tables/FilterPanel.vue'
import EmptyState from '@/components/tables/EmptyState.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SortSelect from '@/components/tables/SortSelect.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { getInfrastructures, deleteInfrastructure } from '@/api/infrastructures.api'
import { getCities } from '@/api/cities.api'
import { usePagination } from '@/composables/usePagination'
import { useDebounce } from '@/composables/useDebounce'
import { useToastStore } from '@/stores/toast.store'
import { formatCurrency, formatDate } from '@/utils/format'
import { INFRASTRUCTURE_STATUS_VALUES, INFRASTRUCTURE_TYPE_VALUES, type InfrastructureStatus, type InfrastructureType } from '@/types/enums'
import { INFRASTRUCTURE_STATUS_LABELS, INFRASTRUCTURE_TYPE_LABELS, getInfrastructureStatusColor } from '@/utils/enum-labels'
import type { Infrastructure, InfrastructureFilters } from '@/types/infrastructure'

const { t } = useI18n()
const toast = useToastStore()
const loading = ref(true)
const items = ref<Infrastructure[]>([])
const sort = ref('updatedAt,desc')
const pagination = usePagination({ defaultSize: 10 })
const filters = ref<{
  name: string
  type: InfrastructureType | null
  status: InfrastructureStatus | null
  cityId: number | null
}>({
  name: '',
  type: null,
  status: null,
  cityId: null,
})
const debouncedFilters = useDebounce(filters, 500)
const cityOptions = ref<{ value: number; label: string }[]>([])

const typeOptions = computed(() =>
  INFRASTRUCTURE_TYPE_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_TYPE_LABELS[value] })),
)
const statusOptions = computed(() =>
  INFRASTRUCTURE_STATUS_VALUES.map((value) => ({ value, label: INFRASTRUCTURE_STATUS_LABELS[value] })),
)
const sortOptions = computed(() => [
  { value: 'updatedAt,desc', label: t('projects.sortNewest') },
  { value: 'updatedAt,asc', label: t('projects.sortOldest') },
  { value: 'name,asc', label: t('cities.sortNameAsc') },
  { value: 'name,desc', label: t('cities.sortNameDesc') },
  { value: 'budget,desc', label: t('projects.sortBudgetDesc') },
  { value: 'budget,asc', label: t('projects.sortBudgetAsc') },
])

const itemToDelete = ref<Infrastructure | null>(null)

function resetFilters() {
  filters.value = { name: '', type: null, status: null, cityId: null }
}

async function fetchItems() {
  loading.value = true
  try {
    const f = debouncedFilters.value
    const payload: InfrastructureFilters = {
      name: f.name || undefined,
      type: f.type ?? undefined,
      status: f.status ?? undefined,
      cityId: f.cityId ?? undefined,
    }
    const { data } = await getInfrastructures(payload, {
      page: pagination.page.value,
      size: pagination.size.value,
      sort: sort.value,
    })
    items.value = data.content
    pagination.updateFromResponse(data)
  } catch {
    toast.error(t('infrastructures.loadError'))
  } finally {
    loading.value = false
  }
}

async function loadLookups() {
  try {
    const { data } = await getCities(undefined, { size: 200 })
    cityOptions.value = data.content.map((x) => ({ value: x.id, label: x.name }))
  } catch {
    cityOptions.value = []
  }
}

async function confirmDelete() {
  if (!itemToDelete.value) return
  try {
    await deleteInfrastructure(itemToDelete.value.id)
    toast.success(t('infrastructures.deleteSuccess'))
    if (items.value.length === 1 && pagination.page.value > 0) pagination.page.value--
    else fetchItems()
  } catch {
    toast.error(t('infrastructures.deleteError'))
  } finally {
    itemToDelete.value = null
  }
}

watch([debouncedFilters, sort], () => { pagination.page.value = 0; fetchItems() }, { deep: true })
watch(() => pagination.page.value, fetchItems)
watch(() => pagination.size.value, fetchItems)

onMounted(async () => {
  await loadLookups()
  await fetchItems()
})
</script>

<template>
  <div class="min-h-[calc(100vh-260px)] space-y-8 pb-10">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-4xl font-medium tracking-tight text-ink dark:text-paper">{{ t('admin.infrastructuresManagement') }}</h1>
      <div class="flex items-center gap-3">
        <div class="w-52"><SortSelect v-model="sort" :options="sortOptions" /></div>
        <RouterLink to="/infrastructures/new">
          <BaseButton><template #iconLeft><PhPlus :size="14" weight="light" /></template>{{ t('infrastructures.addInfrastructure') }}</BaseButton>
        </RouterLink>
      </div>
    </div>

    <FilterPanel :has-active-filters="Boolean(filters.name || filters.type || filters.status || filters.cityId)" @clear="resetFilters">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BaseInput v-model="filters.name" :placeholder="t('infrastructures.searchByName')" />
        <BaseSelect v-model="filters.type" :options="typeOptions" :placeholder="t('infrastructures.allTypes')" />
        <BaseSelect v-model="filters.status" :options="statusOptions" :placeholder="t('projects.allStatuses')" />
        <BaseSelect v-model="filters.cityId" :options="cityOptions" :placeholder="t('projects.allCities')" />
      </div>
    </FilterPanel>

    <div class="card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="border-b border-ink/10 bg-paper-warm dark:border-night-border dark:bg-night-elevated">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('infrastructures.form.name') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('infrastructures.form.type') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('infrastructures.form.status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('infrastructures.form.project') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('projects.form.budget') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/65">{{ t('common.updatedAt') }}</th>
              <th class="px-6 py-3" />
            </tr>
          </thead>
          <tbody class="bg-paper-pure dark:bg-night-soft">
            <tr v-if="loading">
              <td colspan="8" class="px-6 py-12 text-center"><LoadingSpinner class="mx-auto" /></td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="8" class="px-6 py-12 text-center"><EmptyState :title="t('infrastructures.notFound')" /></td>
            </tr>
            <tr v-for="item in items" :key="item.id" class="border-b border-ink/10 transition-colors hover:bg-paper-warm dark:border-night-border dark:hover:bg-night-elevated">
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ item.id }}</td>
              <td class="px-6 py-4 text-sm font-medium text-ink dark:text-paper">
                <RouterLink :to="`/infrastructures/${item.id}`" class="hover:text-accent">{{ item.name }}</RouterLink>
              </td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ t(`enums.infrastructureType.${item.type}`) }}</td>
              <td class="px-6 py-4"><BaseBadge :custom-class="getInfrastructureStatusColor(item.status)">{{ t(`enums.infrastructureStatus.${item.status}`) }}</BaseBadge></td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ item.projectName }}</td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ formatCurrency(item.budget) }}</td>
              <td class="px-6 py-4 text-sm text-ink-muted dark:text-paper/65">{{ formatDate(item.updatedAt) }}</td>
              <td class="px-6 py-4 text-right">
                <RouterLink :to="`/infrastructures/${item.id}/edit`" class="mr-3 inline-flex text-ink-muted hover:text-accent dark:text-paper/65"><PhPencilSimple :size="18" weight="light" /></RouterLink>
                <button class="inline-flex text-status-suspended" @click="itemToDelete = item"><PhTrash :size="18" weight="light" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && items.length > 0" class="border-t border-ink/10 bg-paper-warm px-6 py-4 dark:border-night-border dark:bg-night-elevated">
        <Pagination :current-page="pagination.page.value" :total-pages="pagination.totalPages.value" :total-elements="pagination.totalElements.value" :page-size="pagination.size.value" @update:page="pagination.setPage" @update:size="pagination.setSize" />
      </div>
    </div>

    <ConfirmDialog :model-value="itemToDelete !== null" :title="t('infrastructures.deleteConfirmTitle')" :message="t('infrastructures.deleteConfirmDesc')" @update:model-value="(val: boolean) => { if (!val) itemToDelete = null }" @confirm="confirmDelete" @cancel="itemToDelete = null" />
  </div>
</template>
