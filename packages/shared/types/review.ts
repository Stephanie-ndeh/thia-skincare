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
