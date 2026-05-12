export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  productId: string
  userId: string
  orderId: string
  rating: number         // 1–5
  text: string           // 10–1000 chars
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

export interface CreateReviewPayload {
  productId: string
  orderId: string
  rating: number
  text: string
}

export interface CreateReviewRequest {
  product_id: string
  rating: number
  text: string
}

export interface ReviewListItem {
  id: string
  product_id: string
  product_name: string
  product_slug: string
  customer_name: string
  rating: number
  text: string
  status: ReviewStatus
  created_at: string
}

export interface BulkReviewRequest {
  ids: string[]
  status: 'approved' | 'rejected'
}
