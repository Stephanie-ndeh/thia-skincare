export type DiscountType = 'percentage' | 'fixed'

export interface DiscountCode {
  id: string
  code: string
  type: DiscountType
  value: number           // percentage (1-100) or fixed XAF amount
  minimumOrder: number    // XAF integer
  usageLimit: number | null
  usageCount: number
  isActive: boolean
  startsAt: string
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ValidateDiscountResult {
  valid: boolean
  type?: DiscountType
  value?: number
  message: string
}
