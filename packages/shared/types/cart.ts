export interface CartItem {
  id: string
  userId: string
  variantId: string
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface CartItemWithProduct extends CartItem {
  productId: string
  productName: string
  productSlug: string
  variantSku: string
  variantSizeLabel: string | null
  variantScentLabel: string | null
  variantPrice: number   // XAF integer
  variantStock: number
  primaryImageUrl: string | null
}
