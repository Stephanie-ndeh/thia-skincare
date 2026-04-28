export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CategoryWithCount extends Category {
  productCount: number
}
