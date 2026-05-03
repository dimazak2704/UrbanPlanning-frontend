import { reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounce } from './useDebounce'
import { ref } from 'vue'

export function useFilters<T extends Record<string, unknown>>(defaultFilters: T) {
  const route = useRoute()
  const router = useRouter()

  const filtersFromQuery = {} as Record<string, unknown>
  for (const key of Object.keys(defaultFilters)) {
    const queryVal = route.query[key]
    if (queryVal !== undefined && queryVal !== null && queryVal !== '') {
      filtersFromQuery[key] = queryVal as string
    }
  }

  const filters = reactive<T>({ ...defaultFilters, ...filtersFromQuery } as T)

  const filtersJson = computed(() => JSON.stringify(filters))
  const filtersJsonRef = ref(filtersJson.value)
  watch(filtersJson, (v) => { filtersJsonRef.value = v })
  const debouncedJson = useDebounce(filtersJsonRef, 300)
  const debouncedFilters = computed<T>(() => JSON.parse(debouncedJson.value) as T)

  function setFilter<K extends keyof T>(key: K, value: T[K]) {
    filters[key] = value
  }

  function clearFilters() {
    for (const key of Object.keys(defaultFilters) as Array<keyof T>) {
      filters[key] = defaultFilters[key]
    }
    syncToUrl()
  }

  function reset() {
    clearFilters()
  }

  function syncToUrl() {
    const query = { ...route.query }
    for (const key of Object.keys(defaultFilters)) {
      const val = filters[key as keyof T]
      if (val !== undefined && val !== null && val !== '' && val !== defaultFilters[key as keyof T]) {
        query[key] = String(val)
      } else {
        delete query[key]
      }
    }
    router.replace({ query })
  }

  watch(
    debouncedFilters,
    () => {
      syncToUrl()
    },
    { deep: true },
  )

  const hasActiveFilters = computed(() => {
    for (const key of Object.keys(defaultFilters) as Array<keyof T>) {
      if (filters[key] !== defaultFilters[key] && filters[key] !== '' && filters[key] !== undefined) {
        return true
      }
    }
    return false
  })

  return {
    filters,
    debouncedFilters,
    setFilter,
    clearFilters,
    reset,
    hasActiveFilters,
  }
}
