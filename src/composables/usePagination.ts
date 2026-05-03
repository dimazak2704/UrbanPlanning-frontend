import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface UsePaginationOptions {
  defaultSize?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { defaultSize = 10 } = options
  const route = useRoute()
  const router = useRouter()

  const page = ref(Number(route.query.page) || 0)
  const size = ref(Number(route.query.size) || defaultSize)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const loading = ref(false)

  const isFirstPage = computed(() => page.value === 0)
  const isLastPage = computed(() => page.value >= totalPages.value - 1)

  function syncToUrl() {
    const query = { ...route.query }
    query.page = page.value > 0 ? String(page.value) : undefined!
    query.size = size.value !== defaultSize ? String(size.value) : undefined!

    if (!query.page) delete query.page
    if (!query.size) delete query.size

    router.replace({ query })
  }

  function setPage(n: number) {
    page.value = Math.max(0, Math.min(n, totalPages.value - 1))
    syncToUrl()
  }

  function nextPage() {
    if (!isLastPage.value) setPage(page.value + 1)
  }

  function prevPage() {
    if (!isFirstPage.value) setPage(page.value - 1)
  }

  function setSize(newSize: number) {
    size.value = newSize
    page.value = 0
    syncToUrl()
  }

  function reset() {
    page.value = 0
    size.value = defaultSize
    syncToUrl()
  }

  function updateFromResponse(response: { totalPages: number; totalElements: number }) {
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
  }

  watch(
    () => route.query,
    (query) => {
      const qPage = Number(query.page)
      const qSize = Number(query.size)
      if (!isNaN(qPage) && qPage !== page.value) page.value = qPage
      if (!isNaN(qSize) && qSize > 0 && qSize !== size.value) size.value = qSize
    },
  )

  return {
    page,
    size,
    totalPages,
    totalElements,
    loading,
    isFirstPage,
    isLastPage,
    setPage,
    nextPage,
    prevPage,
    setSize,
    reset,
    updateFromResponse,
  }
}
