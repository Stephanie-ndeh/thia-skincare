import { watchDebounced } from '@vueuse/core'

export interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  primaryImageUrl: string | null
}

interface RawSearchProduct {
  id: string
  name: string
  slug: string
  product_variants: { price: number }[]
  product_images: { url: string; is_primary: boolean }[]
}

export function useSearch(query: Ref<string>) {
  const supabase = useSupabaseClient()

  const results = ref<SearchResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const debouncedQuery = ref('')

  watchDebounced(
    query,
    async (q) => {
      debouncedQuery.value = q

      if (q.trim().length < 2) {
        results.value = []
        return
      }

      loading.value = true
      error.value = null
      try {
        const { data, error: dbError } = await supabase
          .from('products')
          .select('id,name,slug,product_variants(price),product_images(url,is_primary)')
          .textSearch('search_vector', q.trim(), { type: 'websearch', config: 'english' })
          .eq('is_published', true)
          .limit(20)

        if (dbError) {
          error.value = dbError.message
          results.value = []
          return
        }

        const raw = (data as RawSearchProduct[] | null) ?? []
        results.value = raw.map(p => {
          const prices = p.product_variants.map(v => v.price)
          const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0
          const primaryImg = p.product_images.find(i => i.is_primary) ?? p.product_images[0] ?? null
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: lowestPrice,
            primaryImageUrl: primaryImg?.url ?? null,
          }
        })
      } finally {
        loading.value = false
      }
    },
    { debounce: 300 },
  )

  return { results, loading, error, debouncedQuery }
}
