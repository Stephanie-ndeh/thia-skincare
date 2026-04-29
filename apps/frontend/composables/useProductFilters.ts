export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'best_rated'
export type ViewMode = 'grid' | 'list'

export interface ActiveFilter {
  label: string
  key: string
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  best_rated: 'Best Rated',
}

export function useProductFilters() {
  const route = useRoute()
  const router = useRouter()

  const sortBy = computed<SortOption>(() => (route.query.sort as SortOption) || 'newest')
  const minPrice = computed(() => route.query.minPrice ? Number(route.query.minPrice) : null)
  const maxPrice = computed(() => route.query.maxPrice ? Number(route.query.maxPrice) : null)
  const page = computed(() => route.query.page ? Number(route.query.page) : 1)

  const viewMode = ref<ViewMode>('grid')
  if (import.meta.client) {
    viewMode.value = (localStorage.getItem('thia-view-mode') as ViewMode) || 'grid'
  }
  watch(viewMode, (v) => {
    if (import.meta.client) localStorage.setItem('thia-view-mode', v)
  })

  function updateFilters(patch: Record<string, string | number | null | undefined>) {
    const merged: Record<string, string> = {}
    // carry existing query
    for (const [k, v] of Object.entries(route.query)) {
      if (v !== undefined && v !== null) merged[k] = String(v)
    }
    // apply patch
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === '') {
        delete merged[k]
      } else {
        merged[k] = String(v)
      }
    }
    // reset page unless patch explicitly sets it
    if (!('page' in patch)) merged['page'] = '1'
    router.push({ query: merged })
  }

  function clearFilters() {
    router.push({ query: {} })
  }

  const activeFilters = computed<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = []
    if (sortBy.value !== 'newest') {
      filters.push({ label: SORT_LABELS[sortBy.value], key: 'sort' })
    }
    if (minPrice.value !== null) {
      filters.push({ label: `Min: ${minPrice.value.toLocaleString()} XAF`, key: 'minPrice' })
    }
    if (maxPrice.value !== null) {
      filters.push({ label: `Max: ${maxPrice.value.toLocaleString()} XAF`, key: 'maxPrice' })
    }
    return filters
  })

  return {
    sortBy,
    minPrice,
    maxPrice,
    page,
    viewMode,
    updateFilters,
    clearFilters,
    activeFilters,
  }
}
