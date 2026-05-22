export interface ProductImage {
  id: string
  productId: string
  url: string
  storagePath: string
  isPrimary: boolean
  displayOrder: number
  createdAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  sizeLabel: string | null
  scentLabel: string | null
  price: number        // XAF integer
  stockQuantity: number
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  ingredients: string | null
  usageInstructions: string | null
  categoryId: string
  isFeatured: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[]
  images: ProductImage[]
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  categoryId: string
  isFeatured: boolean
  primaryImage: ProductImage | null
  lowestPrice: number  // XAF integer — lowest variant price
}
