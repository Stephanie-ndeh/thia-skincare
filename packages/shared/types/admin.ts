export interface AdminMetrics {
  total_orders: number
  total_revenue: number
  total_products: number
  total_customers: number
  orders_this_month: number
  revenue_this_month: number
}

export interface CreateVariantRequest {
  size_label?: string
  scent_label?: string
  price: number
  stock_quantity: number
  display_order: number
}

export interface CreateProductRequest {
  name: string
  slug: string
  category_id: string
  description?: string
  ingredients?: string
  usage_instructions?: string
  is_published: boolean
  is_featured: boolean
  variants: CreateVariantRequest[]
}

export interface ToggleProductRequest {
  field: 'is_published' | 'is_featured'
  value: boolean
}

export interface CreateTestimonialRequest {
  customer_name: string
  text: string
  is_featured: boolean
  display_order: number
}

export interface UpdateTestimonialRequest {
  customer_name?: string
  text?: string
  is_featured?: boolean
  display_order?: number
}
