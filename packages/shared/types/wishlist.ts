export interface WishlistProductSummary {
  id: string
  name: string
  slug: string
  primaryImageUrl: string | null
  lowestPrice: number
  categoryName: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product: WishlistProductSummary | null
}

export interface WishlistToggleResponse {
  added: boolean
  product_id: string
}
