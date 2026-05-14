export type DiscountType = 'percentage' | 'fixed'

export interface DiscountCode {
  id: string
  code: string
  type: DiscountType
  value: number
  minimum_order: number
  usage_limit: number | null
  usage_count: number
  is_active: boolean
  starts_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
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

export interface CreateDiscountCodeRequest {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimum_order?: number
  usage_limit?: number
  starts_at?: string
  expires_at?: string
  is_active: boolean
}

export interface UpdateDiscountCodeRequest {
  type?: 'percentage' | 'fixed'
  value?: number
  minimum_order?: number
  usage_limit?: number | null
  starts_at?: string
  expires_at?: string | null
  is_active?: boolean
}
