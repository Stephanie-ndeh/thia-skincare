export type DiscountType = 'percentage' | 'fixed'

export interface DiscountCode {
  id: string
  code: string
  type: DiscountType
  value: number
  isActive: boolean
  expiresAt: string | null
  timesUsed: number
  usageLimit: number | null
  minOrderAmount: number
}

export interface DiscountValidateRequest {
  code: string
  subtotal?: number
}

export interface DiscountValidateResponse {
  valid: boolean
  type: DiscountType
  value: number
  message: string
  code: string
}
