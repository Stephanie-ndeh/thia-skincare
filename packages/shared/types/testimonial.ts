export interface Testimonial {
  id: string
  customerName: string
  text: string
  photoUrl: string | null
  storagePath: string | null
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}
