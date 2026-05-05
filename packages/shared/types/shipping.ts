export interface ShippingZone {
  id: string
  name: string
  cities: string[]
  rate: number           // XAF integer
  freeThreshold: number  // 0 = never free
  displayOrder: number
  isActive: boolean
}

export interface ShippingCalculateRequest {
  city: string
  subtotal: number
}

export interface ShippingCalculateResponse {
  rate: number
  zoneName: string
  isFree: boolean
}
