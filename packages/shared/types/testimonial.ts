export interface Testimonial {
  id: string
  customer_name: string
  text: string
  photo_url: string | null
  storage_path: string | null
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}
